// app/kids/[id]/read-aloud/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;
  console.log("[READ-ALOUD API] Kid ID:", kidId);

  const supabase = await createServerSupabaseClient();
  console.log("[READ-ALOUD API] Supabase client initialized");

  const body = await req.json();
  console.log("[READ-ALOUD API] Received body:", body);

const { metrics } = body;
const wpm = metrics?.wpm ?? 0;
const accuracy = metrics?.accuracy ?? 0;
const errors = metrics?.errors ?? 0;

  // ⭐ Band A thresholds
  const fluencyPassed =
    wpm >= 20 &&
    accuracy >= 80 &&
    errors <= 10;

  console.log("[READ-ALOUD API] Fluency passed:", fluencyPassed);

  if (!fluencyPassed) {
    return NextResponse.json({ advance: false });
  }

  // ⭐ Fetch current progress
  const { data: progress } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (!progress) {
    console.error("[READ-ALOUD API] No progress record found");
    return NextResponse.json({ advance: false });
  }

  const { band, site_id, passage_index } = progress;

  console.log("[READ-ALOUD API] Current progress:", progress);

  // ⭐ Get max passage_index for current site
  const { data: maxPassage } = await supabase
    .from("passages")
    .select("passage_index")
    .eq("band", band)
    .eq("site_id", site_id)
    .order("passage_index", { ascending: false })
    .limit(1)
    .single();

  const maxPassageIndex = maxPassage?.passage_index ?? 1;
  console.log("[READ-ALOUD API] Max passage_index:", maxPassageIndex);

  // ⭐ Get max site_id for current band
  const { data: maxSite } = await supabase
    .from("passages")
    .select("site_id")
    .eq("band", band)
    .order("site_id", { ascending: false })
    .limit(1)
    .single();

  const maxSiteId = maxSite?.site_id ?? 1;
  console.log("[READ-ALOUD API] Max site_id:", maxSiteId);

  let newSiteId = site_id;
  let newPassageIndex = passage_index;
  let bandComplete = false;

  // ⭐ Progression logic
  if (passage_index < maxPassageIndex) {
    newPassageIndex = passage_index + 1;
    console.log("[READ-ALOUD API] Advancing passage_index →", newPassageIndex);
  } else {
    // Move to next site
    if (site_id < maxSiteId) {
      newSiteId = site_id + 1;
      newPassageIndex = 1;
      console.log("[READ-ALOUD API] Advancing site_id →", newSiteId);
    } else {
      // Band complete
      bandComplete = true;
      console.log("[READ-ALOUD API] Band complete!");
    }
  }

  // ⭐ Update progress table
  if (!bandComplete) {
    await supabase
      .from("progress")
      .update({
        site_id: newSiteId,
        passage_index: newPassageIndex,
      })
      .eq("kid_id", kidId);

    console.log("[READ-ALOUD API] Progress updated");
  }

return NextResponse.json({
  advance: fluencyPassed,
  bandComplete,
  fluencyPassed,
});
}
