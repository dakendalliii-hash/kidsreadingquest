// =========================================================
// FILE: app/kids/[id]/assessment/score/route.ts
// PURPOSE: Compute assessment placement AND record attempt
// =========================================================

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logging/logError";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { metrics, band, kidId } = body;

    // ---------------------------------------------
    // Extract metrics from AssessmentClient payload
    // ---------------------------------------------
    const {
      wpm,
      accuracy,
      errors,
      totalWords,
      totalSeconds,
      mispronounced,
      skipped,
      inserted,
      repeated,
      transcript,
    } = metrics;

    const numericAccuracy = Number(accuracy);
    const numericErrors = Number(errors);

    // ---------------------------------------------
    // Compute placement + reason
    // ---------------------------------------------
    const bandOrder = ["A 4-5", "B 6-7", "C 8-9"];
    const currentIndex = bandOrder.indexOf(band);

    let placement = band;
    let reason = "Performance meets expectations for this band.";

    if (band === "C 8-9") {
      placement = "C 8-9";
      reason = "This is the highest band. Continue here.";
    } else if (numericAccuracy > 95 && numericErrors < 5) {
      placement = bandOrder[currentIndex + 1];
      reason = "Strong fluency. Ready for a higher band.";
    } else {
      placement = band;
      reason = "Start with this band to build fluency.";
    }

    // ---------------------------------------------
    // Build metrics JSONB object for reading_attempts
    // ---------------------------------------------
    const metricsJson = {
      wpm,
      accuracy: numericAccuracy,
      errors: numericErrors,
      totalWords,
      totalSeconds,
      mispronounced,
      skipped,
      inserted,
      repeated,
      transcript,
      placement,
      reason,
    };

    // ---------------------------------------------
    // Insert assessment attempt via Supabase RPC
    // ---------------------------------------------
    const supabase = await createServerSupabaseClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return new Response(
    JSON.stringify({
      placement: "",
      reason: "Not authenticated.",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

const parentAuthId = user.id;


console.log("RPC payload:", {
  p_kid_id: kidId,
  p_band: placement,
  p_site_id: 0,
  p_passage_index: 0,
  p_attempt_type: "assessment",
  p_metrics: metricsJson,
  p_fluency_passed: true
});

const { error: rpcError } = await supabase.rpc(
  "add_kid_reading_attempts",
  {
    p_attempt_type: "assessment",
    p_band: placement,
    p_fluency_passed: true,
    p_kid_id: kidId,
    p_parent_id: parentAuthId,
    p_metrics: metricsJson,
    p_passage_index: 0,
    p_site_id: 0,
    p_comprehension_passed: false,
    p_comprehension_score: 0,
    p_vocabulary_passed: false,
    p_vocabulary_score: 0,
  }
);

    if (rpcError) {
      console.error("❌ RPC add_kid_reading_attempts failed:", rpcError);
    }

    // ---------------------------------------------
    // Return placement + reason to AssessmentClient
    // ---------------------------------------------
    return new Response(
      JSON.stringify({
        placement,
        reason,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Assessment score error:", err);
  await logError("assessment score route", err);

    return new Response(
      JSON.stringify({
        placement: "",
        reason: "Server error processing assessment.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
