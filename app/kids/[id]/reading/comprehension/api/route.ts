import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await context.params;
    const body = await request.json();

    const {
      comprehensionScore,
      comprehensionPassed,
      band,
      siteId,
      passageIndex,
    } = body;

    const supabase = await createServerSupabaseClient();

    // ⭐ Authenticated parent
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
      ...lastAttempt?.metrics,

      // comprehension updates
      comprehensionScore,
      comprehensionPassed,

      // ensure fluency fields exist
      accuracy: lastAttempt?.metrics?.accuracy ?? 0,
      wpm: lastAttempt?.metrics?.wpm ?? 0,
      errors: lastAttempt?.metrics?.errors ?? 0,
      totalWords: lastAttempt?.metrics?.totalWords ?? 0,
      totalSeconds: lastAttempt?.metrics?.totalSeconds ?? 0,
      transcript: lastAttempt?.metrics?.transcript ?? "",

      // ensure vocabulary fields exist
      vocabularyScore: lastAttempt?.metrics?.vocabularyScore ?? 0,
      vocabularyPassed: lastAttempt?.metrics?.vocabularyPassed ?? false,

      // ensure fluency flag exists
      fluencyPassed: lastAttempt?.metrics?.fluencyPassed ?? false,
    };

    // ⭐ Write full snapshot
    const { error: rpcError } = await supabase.rpc("add_kid_reading_attempts", {
      p_attempt_type: "existing",
      p_band: band,
      p_fluency_passed: null,
      p_kid_id: kidId,
      p_parent_id: user.id,
      p_metrics: fullMetrics,
      p_passage_index: passageIndex,
      p_site_id: siteId,
      p_comprehension_passed: comprehensionPassed,
      p_comprehension_score: comprehensionScore,
      p_vocabulary_passed: null,
      p_vocabulary_score: null,
    });

    if (rpcError) {
      console.error("❌ RPC comprehension insert error:", rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Comprehension API error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
