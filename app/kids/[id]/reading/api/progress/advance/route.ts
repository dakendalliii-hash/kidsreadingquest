// ============================================================================
// FILE: /reading/api/advance/route.ts
// PURPOSE:
//   Determines the next passage in the workout OR signals workout completion.
//   This route is called after each step (fluency → comprehension → vocabulary).
//
// FIXES:
//   - Deterministic workout end check (.3 only)
//   - Stable next-passage computation
//   - Returns redirect payload consumed by ReadingClient
//   - Never falls back to stale progress
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

    const { band, siteId, passageIndex } = body;

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
    // Load passage to determine workout value
    // ------------------------------------------------------------------------
    const { data: passageRecord, error: passageError } = await supabase
      .from("passages")
      .select("workout")
      .eq("language", "en")
      .eq("band", band)
      .eq("site_id", siteId)
      .eq("passage_index", passageIndex)
      .single();

    if (passageError || !passageRecord) {
      return NextResponse.json(
        { success: false, error: "Passage not found" },
        { status: 404 }
      );
    }

    // ⭐ Deterministic workout end check
    const workoutValue = Number(passageRecord.workout);
    const isWorkoutEnd = workoutValue === 1.3;

    // ------------------------------------------------------------------------
    // If workout end (.3), return results trigger
    // ------------------------------------------------------------------------
    if (isWorkoutEnd) {
      return NextResponse.json({
        success: true,
        workoutComplete: true,
        redirect: {
          to: "results",
        },
      });
    }

    // ------------------------------------------------------------------------
    // Otherwise compute next passage
    // ------------------------------------------------------------------------
    const nextPassageIndex = passageIndex + 1;

console.log("[ADVANCE API] workoutValue:", workoutValue);
console.log("[ADVANCE API] isWorkoutEnd:", isWorkoutEnd);

if (!isWorkoutEnd) {
  console.log("[ADVANCE API] next passage:", {
    band,
    siteId,
    nextPassageIndex,
  });
}

    return NextResponse.json({
      success: true,
      workoutComplete: false,
      redirect: {
        to: "next",
        band,
        siteId,
        passageIndex: nextPassageIndex,
      },
    });

  } catch (err) {
    console.error("❌ Advance API error:", err);
    await logError("advance route", err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
