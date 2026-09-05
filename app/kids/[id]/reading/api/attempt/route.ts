import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;

  const {
    band,
    siteId,
    passageIndex,
    accuracy,
    attemptType,
    totalQuestions,
    correctCount,
  } = await request.json();

  const supabase = await createServerSupabaseClient();

  // Insert comprehension attempt using your existing RPC
  const { error: rpcError } = await supabase.rpc(
    "add_kid_reading_attempts",
    {
      p_kid_id: kidId,
      p_band: band,
      p_site_id: siteId,
      p_passage_index: passageIndex,
      p_accuracy: accuracy,
      p_wpm: 0, // comprehension has no WPM
      p_errors: totalQuestions - correctCount,
      p_total_words: 0,
      p_total_seconds: 0,
      p_fluency_passed: true,
      p_attempt_type: attemptType, // "comprehension"
      p_transcript: "",
      p_mispronounced: 0,
      p_skipped: 0,
      p_inserted: 0,
      p_repeated: 0,
    }
  );

  if (rpcError) {
    console.error("❌ RPC error (comprehension attempt):", rpcError);
    return NextResponse.json(
      { error: "Failed to save comprehension attempt" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
