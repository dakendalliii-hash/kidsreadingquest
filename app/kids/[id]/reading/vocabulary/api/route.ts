// ============================================================================
// FILE: app/kids/[id]/reading/vocabulary/api/route.ts
// PURPOSE:
//   Handles vocabulary scoring for workout passages.
//   Saves metrics, merges with previous attempt snapshot,
//   advances the workout, and determines whether the workout is complete (.3).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logging/logError";

// Shape of the metrics snapshot stored on reading_attempts.metrics (jsonb).
// Typing it here avoids "Json" spread/property errors with generated types.
type AttemptMetrics = {
  comprehensionScore?: number;
  comprehensionPassed?: boolean;
  accuracy?: number;
  wpm?: number;
  errors?: number;
  totalWords?: number;
  totalSeconds?: number;
  transcript?: string;
  fluencyPassed?: boolean;
  [key: string]: unknown;
};

// Workout values look like 1.1, 1.2, 1.3, 2.1 ...
// Rounding to tenths avoids floating-point noise (e.g. 1.3 % 1 = 0.30000000000000004).
function getWorkoutInfo(rawWorkout: unknown) {
  let workoutValue = Number(rawWorkout);

  // Missing, zero or invalid workout → start at 1.1
  if (!Number.isFinite(workoutValue) || workoutValue <= 0) {
    workoutValue = 1.1;
  }

  const major = Math.floor(workoutValue);
  const minor = Math.round((workoutValue - major) * 10);

  const isWorkoutEnd = minor === 3;

  // .1 → .2 → .3 → next major .1
  const next =
    minor >= 3 ? major + 1 + 0.1 : major + (minor + 1) / 10;

  // toFixed keeps stored numeric values clean (2.3, not 2.3000000000000003),
  // which matters because reading_questions is looked up with .eq("workout", ...)
  const nextWorkout = Number(next.toFixed(1));

  return { workoutValue, isWorkoutEnd, nextWorkout };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kidId } = await context.params;
    const body = await request.json();

    const { vocabularyScore, vocabularyPassed, band, siteId, passageIndex } =
      body;

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

    // ------------------------------------------------------------------------
    // Load current workout from progress
    // ------------------------------------------------------------------------
    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("workout")
      .eq("kid_id", kidId)
      .single();

    if (progressError || !progress) {
      console.error(
        "[VOCAB API ROUTE] Error reading workout from progress table:",
        progressError
      );
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------------
    // Deterministic workout end check + next workout value
    // ------------------------------------------------------------------------
    const { workoutValue, isWorkoutEnd, nextWorkout } = getWorkoutInfo(
      progress.workout
    );

    console.log("[VOCAB API ROUTE] workout:", {
      workoutValue,
      isWorkoutEnd,
      nextWorkout,
    });

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
      .maybeSingle();

    const previous = (lastAttempt?.metrics ?? {}) as AttemptMetrics;

    // ------------------------------------------------------------------------
    // Merge old + new metrics
    // ------------------------------------------------------------------------
    const fullMetrics = {
      ...previous,

      vocabularyScore,
      vocabularyPassed,

      comprehensionScore: previous.comprehensionScore ?? 0,
      comprehensionPassed: previous.comprehensionPassed ?? false,

      accuracy: previous.accuracy ?? 0,
      wpm: previous.wpm ?? 0,
      errors: previous.errors ?? 0,
      totalWords: previous.totalWords ?? 0,
      totalSeconds: previous.totalSeconds ?? 0,
      transcript: previous.transcript ?? "",

      fluencyPassed: previous.fluencyPassed ?? false,
    };

    // ------------------------------------------------------------------------
    // Write full snapshot
    // ------------------------------------------------------------------------
    const { error: rpcError } = await supabase.rpc("add_kid_reading_attempts", {
      p_attempt_type: "existing",
      p_band: band,
      p_fluency_passed: fullMetrics.fluencyPassed,
      p_kid_id: kidId,
      p_parent_id: user.id,
      p_metrics: fullMetrics,
      p_passage_index: passageIndex,
      p_site_id: siteId,
      p_comprehension_passed: fullMetrics.comprehensionPassed,
      p_comprehension_score: fullMetrics.comprehensionScore,
      p_vocabulary_passed: fullMetrics.vocabularyPassed ?? false,
      p_vocabulary_score: fullMetrics.vocabularyScore ?? 0,
    });

    if (rpcError) {
      console.error("❌ RPC vocabulary insert error:", rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------------
    // Advance workout in progress table
    // ------------------------------------------------------------------------
    const { error: updateProgressError } = await supabase
      .from("progress")
      .update({
        workout: nextWorkout,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    if (updateProgressError) {
      console.error("Progress Update Error:", updateProgressError);
    }

    // ------------------------------------------------------------------------
    // If workout end (.3), return results trigger
    // ------------------------------------------------------------------------
    if (isWorkoutEnd) {
      console.log("[VOCAB API ROUTE] Workout End Detected");

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
    const nextPassageIndex = Number(passageIndex) + 1;

    console.log("[VOCAB API ROUTE] next passage:", {
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