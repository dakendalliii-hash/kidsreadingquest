import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const { params } = context;

  const { id: kidId } = await params;
  console.log("KidProfile params:", { id: kidId });

  const body = await req.json();

  const supabase = await createServerSupabaseClient();

  const {
    band,
    siteId,
    passageIndex,
    language: rawLanguage,
  } = body;

  // ⭐ ALWAYS enforce a language (default to EN)
  const language = rawLanguage ?? "en";

  console.log("[PASSAGE API] Fetching passage:", {
    band,
    siteId,
    passageIndex,
    language,
  });

    // ------------------------------------------------------------------------
    // Check progress to determine workout value
    // ------------------------------------------------------------------------
    const { data: passageRecord, error: passageError } = await supabase
      .from("progress")
      .select("workout")
      .eq("kid_id", kidId)
      .single();

    if (passageError || !passageRecord) {
      return NextResponse.json(
        { success: false, error: "Passage not found" },
        { status: 404 }
      );
    }

  let currentWorkout = Number(passageRecord.workout);
  console.log("[PASSAGE API ROUTE] workout from progress:", currentWorkout);

  if(currentWorkout===0.0){ currentWorkout=1.1 };
  console.log("[PASSAGE API ROUTE] workout from 0.0:", currentWorkout);

  if(!currentWorkout){ currentWorkout=0.0 };
  console.log("[PASSAGE API ROUTE] workout from null:", currentWorkout);


console.log("[PASSAGE API] Workout Value ", {currentWorkout});

  // ⭐ THIS is where .eq("language", language) belongs
  const { data, error } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("workout", currentWorkout)
    .eq("language", language)        // ⭐ REQUIRED — prevents Hindi row from being returned
    .single();

{/* Using workout instead of site_id and passage_index to get better tracking
    .eq("site_id", siteId)
    .eq("passage_index", passageIndex)
*/}

  if (error) {
    console.error("[PASSAGE API] Error:", error);
    return NextResponse.json(
      { error: "Passage not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ text: data.text });
}
