import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logging/logError";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await context.params;
    const body = await request.json();
    const { metrics, band, siteId, passageIndex } = body;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // ⭐ Compute fluency
    const accuracy = metrics?.accuracy ?? 0;
    const wpm = metrics?.wpm ?? 0;
    const fluencyPassed = accuracy >= 80 && wpm >= 40;

    // ⭐ Load previous metrics snapshot
    const { data: lastAttempt } = await supabase
      .from("reading_attempts")
      .select("metrics")
      .eq("kid_id", kidId)
      .eq("band", band)
      .eq("site_id", siteId)
      .eq("passage_index", passageIndex)
      .eq("attempt_type", "existing")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // ⭐ Merge old + new into a full snapshot
    const fullMetrics = {
      ...lastAttempt?.metrics,     // previous snapshot
      ...metrics,                  // new fluency metrics

      // explicitly set updated values
      accuracy,
      wpm,
      fluencyPassed,

      // ensure all fields exist
      errors: metrics?.errors ?? lastAttempt?.metrics?.errors ?? 0,
      totalWords: metrics?.totalWords ?? lastAttempt?.metrics?.totalWords ?? 0,
      totalSeconds: metrics?.totalSeconds ?? lastAttempt?.metrics?.totalSeconds ?? 0,
      transcript: metrics?.transcript ?? lastAttempt?.metrics?.transcript ?? "",

      comprehensionScore: lastAttempt?.metrics?.comprehensionScore ?? 0,
      vocabularyScore: lastAttempt?.metrics?.vocabularyScore ?? 0,

      comprehensionPassed: lastAttempt?.metrics?.comprehensionPassed ?? false,
      vocabularyPassed: lastAttempt?.metrics?.vocabularyPassed ?? false,
    };

    // ⭐ Write full snapshot
    const { error: rpcError } = await supabase.rpc("add_kid_reading_attempts", {
      p_attempt_type: "existing",
      p_band: band,
      p_fluency_passed: fluencyPassed,
      p_kid_id: kidId,
      p_parent_id: user.id,
      p_metrics: fullMetrics,
      p_passage_index: passageIndex,
      p_site_id: siteId,

      // comprehension/vocab not part of this step
      p_comprehension_passed: null,
      p_comprehension_score: null,
      p_vocabulary_passed: null,
      p_vocabulary_score: null,
    });

    if (rpcError) {
      console.error("❌ RPC fluency insert error:", rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, fluencyPassed });
  } catch (err) {
    console.error("❌ Fluency API error:", err);
  await logError("advance route", err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
