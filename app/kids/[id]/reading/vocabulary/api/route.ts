import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;

  const {
    answers,
    questions,
    band,
    siteId,
    passageIndex,
  } = await request.json();

  const supabase = await createServerSupabaseClient();

  // ⭐ Get parent_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parentId = user.id;

  // ⭐ Compute vocabulary score
  const correctCount = questions.reduce((acc: number, q: any, i: number) => {
    return acc + (answers[i] === q.correctIndex ? 1 : 0);
  }, 0);

  const scorePercent = Math.round(
    (correctCount / questions.length) * 100
  );

  const vocabularyPassed = scorePercent === 100;

  // ⭐ Load comprehension attempt to enforce gating
  const { data: comprehensionAttempt } = await supabase
    .from("reading_attempts")
    .select("comprehension_passed")
    .eq("kid_id", kidId)
    .eq("band", band)
    .eq("site_id", siteId)
    .eq("passage_index", passageIndex)
    .eq("attempt_type", "existing")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const comprehensionPassed =
    comprehensionAttempt?.comprehension_passed === true;

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

    // vocabulary updates
    vocabularyScore: scorePercent,
    vocabularyPassed,

    // ensure fluency fields exist
    accuracy: lastAttempt?.metrics?.accuracy ?? 0,
    wpm: lastAttempt?.metrics?.wpm ?? 0,
    errors: lastAttempt?.metrics?.errors ?? 0,
    totalWords: lastAttempt?.metrics?.totalWords ?? 0,
    totalSeconds: lastAttempt?.metrics?.totalSeconds ?? 0,
    transcript: lastAttempt?.metrics?.transcript ?? "",

    // ensure comprehension fields exist
    comprehensionScore: lastAttempt?.metrics?.comprehensionScore ?? 0,
    comprehensionPassed,

    // ensure fluency flag exists
    fluencyPassed: lastAttempt?.metrics?.fluencyPassed ?? false,
  };

  // ⭐ Save vocabulary attempt via RPC
  const { error: rpcError } = await supabase.rpc(
    "add_kid_reading_attempts",
    {
      p_attempt_type: "existing",
      p_band: band,
      p_fluency_passed: true,
      p_kid_id: kidId,
      p_parent_id: parentId,

      // ⭐ full snapshot
      p_metrics: fullMetrics,

      p_passage_index: passageIndex,
      p_site_id: siteId,

      p_comprehension_passed: comprehensionPassed,
      p_comprehension_score: lastAttempt?.metrics?.comprehensionScore ?? 0,

      p_vocabulary_passed: vocabularyPassed,
      p_vocabulary_score: scorePercent,
    }
  );

  if (rpcError) {
    console.error("❌ Vocabulary RPC error:", rpcError);
    return NextResponse.json(
      { error: "Failed to save vocabulary attempt" },
      { status: 500 }
    );
  }

  // ⭐ Advance progress only if BOTH comprehension + vocabulary passed
  if (comprehensionPassed && vocabularyPassed) {
    const advanceRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/kids/${kidId}/reading/api/progress/advance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "en" }),
      }
    );

    const advanceJson = await advanceRes.json();

    return NextResponse.json({
      vocabularyScore: scorePercent,
      vocabularyPassed,
      comprehensionPassed,
      advanced: true,
      next: advanceJson,
    });
  }

  return NextResponse.json({
    vocabularyScore: scorePercent,
    vocabularyPassed,
    comprehensionPassed,
    advanced: false,
  });
}
