// ============================================================================
// FILE: /reading/vocabulary/api/route.ts
// PURPOSE:
//   Handles vocabulary scoring for workout passages.
//   Saves metrics, merges with previous attempt snapshot,
//   and determines whether the workout is complete (.3).
//
// FIXES:
//   - Deterministic workout end check
//   - Correct next‑passage computation
//   - Returns redirect payload so ReadingClient advances properly
// ============================================================================

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

    const {
      vocabularyScore,
      vocabularyPassed,
      band,
      siteId,
      passageIndex,
    } = body;

    const supabase = await createServerSupabaseClient();

    // ------------------------------------------------------------------------
    // Authenticated parent
    // ------------------------------------------------------------------------
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

  // ⭐ Load progress (workout)
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("workout")   // Added workout so we always get the current workout
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    // Possible for new kid not to have a progress record
    console.log("[VOCAB API] Error reading workout from progress table.");

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }

	const { workout } = progress;

  // ⭐ Load passage text (English)
  const { data: passageRecord, error: passageError } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("workout", workout)
    .eq("language", "en")
    .single();

    if (passageError || !passageRecord) {
      return NextResponse.json(
        { success: false, error: "Passage not found" },
        { status: 404 }
      );
    }

    // ⭐ Deterministic workout end check

const workoutValue = Number(progress.workout);
const workoutStep = Math.round((workoutValue % 1) * 10);

console.log("[API ROUTE] workoutStep ", {workoutStep});

const isWorkoutEnd = workoutStep === 3;
const nextWorkout = (() => {
  const major = Math.floor(workoutValue);
  // Round to handle JavaScript floating-point errors
  const minor = Math.round((workoutValue - major) * 10); 

  if (minor >= 3) {
    return major + 1 + 0.1; // Roll over to next major, minor starts at 1
  } else {
    return major + (minor + 1) / 10; // Standard increment
  }
})();

    // ------------------------------------------------------------------------
    // Load previous metrics snapshot
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // Merge old + new metrics
    // ------------------------------------------------------------------------
    const fullMetrics = {
      ...lastAttempt?.metrics,

      vocabularyScore,
      vocabularyPassed,

      comprehensionScore: lastAttempt?.metrics?.comprehensionScore ?? 0,
      comprehensionPassed: lastAttempt?.metrics?.comprehensionPassed ?? false,

      accuracy: lastAttempt?.metrics?.accuracy ?? 0,
      wpm: lastAttempt?.metrics?.wpm ?? 0,
      errors: lastAttempt?.metrics?.errors ?? 0,
      totalWords: lastAttempt?.metrics?.totalWords ?? 0,
      totalSeconds: lastAttempt?.metrics?.totalSeconds ?? 0,
      transcript: lastAttempt?.metrics?.transcript ?? "",

      fluencyPassed: lastAttempt?.metrics?.fluencyPassed ?? false,
    };

    // ------------------------------------------------------------------------
    // Write full snapshot
    // ------------------------------------------------------------------------
    const { error: rpcError } = await supabase.rpc("add_kid_reading_attempts", {
      p_attempt_type: "existing",
      p_band: band,
      p_fluency_passed: fullMetrics.fluencyPassed ?? false,
      p_kid_id: kidId,
      p_parent_id: user.id,
      p_metrics: fullMetrics,
      p_passage_index: passageIndex,
      p_site_id: siteId,
      p_comprehension_passed: fullMetrics.comprehensionPassed ?? false,
      p_comprehension_score: fullMetrics.comprehensionScore ?? 0,
      p_vocabulary_passed: fullMetrics.vocabularyPassed ?? false,
      p_vocabulary_score: fullMetrics.vocabularyScore ?? 0
    });

    if (rpcError) {
      console.error("❌ RPC vocabulary insert error:", rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 500 }
      );
    }

//------------------------------------------------------------
// Write current workout to progress table
//------------------------------------------------------------
const { error: updateProgressError } = await supabase
  .from("progress")
  .update({
    workout: nextWorkout,
    updated_at: new Date().toISOString(),
  })
  .eq("kid_id", kidId);

if (updateProgressError) {
  console.error("Progress Update Error:", progressError);
}
    // ------------------------------------------------------------------------
    // If workout end (.3), return results trigger
    // ------------------------------------------------------------------------
    if (isWorkoutEnd) {

console.log("[API ROUTE] Workout End Detected");

      return NextResponse.json({
        success: true,
        workoutComplete: true,
        metrics: fullMetrics,
        redirect: {
          to: "results",
        },
      });
    }

    // ------------------------------------------------------------------------
    // Otherwise compute next passage
    // ------------------------------------------------------------------------
    const nextPassageIndex = passageIndex + 1;

console.log("[VOCAB API] workoutValue:", workoutValue);
console.log("[VOCAB API] nextWorkout:", nextWorkout);
console.log("[VOCAB API] isWorkoutEnd:", isWorkoutEnd);
console.log("[VOCAB API] next passage:", {
  band,
  siteId,
  nextPassageIndex,
});


    return NextResponse.json({
      success: true,
      workoutComplete: false,
      metrics: fullMetrics,
      redirect: {
        to: "next",
        band,
        siteId,
        passageIndex: nextPassageIndex,
      },
    });

  } catch (err) {
    console.error("❌ Vocabulary API error:", err);
    await logError("vocabulary route", err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
