import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;
  const { language } = await request.json();

  const supabase = await createServerSupabaseClient();

  console.log("ADVANCE ROUTE FIRED for kid:", kidId);

  // ⭐ 1. Load current progress
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index, streak")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    return NextResponse.json({ error: "Progress not found" }, { status: 404 });
  }

  const { band, site_id, passage_index } = progress;

  // ⭐ 2. Load metadata from passages (correct source of truth)

  // 2a. Max passage_index for this band + site + language
  const { data: maxPassageRow } = await supabase
    .from("passages")
    .select("passage_index")
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("language", language)
    .order("passage_index", { ascending: false })
    .limit(1)
    .single();

  // 2b. Max site_id for this band + language
  const { data: maxSiteRow } = await supabase
    .from("passages")
    .select("site_id")
    .eq("band", band)
    .eq("language", language)
    .order("site_id", { ascending: false })
    .limit(1)
    .single();

  // 2c. Band order list
  const { data: bandList } = await supabase
    .from("bands")
    .select("name")
    .order("name", { ascending: true });

  if (!maxPassageRow || !maxSiteRow || !bandList) {
    return NextResponse.json(
      { error: "Metadata missing for progression" },
      { status: 500 }
    );
  }

  const maxPassageIndex = maxPassageRow.passage_index;
  const maxSiteId = maxSiteRow.site_id;
  const bandOrder = bandList.map((b) => b.name);
  const currentBandIndex = bandOrder.indexOf(band);
  const nextBand =
    bandOrder[currentBandIndex + 1] ?? bandOrder[currentBandIndex];

  // ⭐ 3. Compute next progression step
  let newBand = band;
  let newSiteId = site_id;
  let newPassageIndex = passage_index + 1;

  // Passage rollover
  if (newPassageIndex > maxPassageIndex) {
    newPassageIndex = 1;
    newSiteId = site_id + 1;
  }

  // Site rollover
  if (newSiteId > maxSiteId) {
    newSiteId = 1;
    newBand = nextBand;
  }

  // Final band cap
  const finalBand = bandOrder[bandOrder.length - 1];
  if (newBand === finalBand && newSiteId > maxSiteId) {
    return NextResponse.json({
      celebrate: true,
      redirect: `/kids/${kidId}/reading?celebrate=1`,
    });
  }

  // ⭐ 4. Verify next passage exists
  const { data: nextPassage } = await supabase
    .from("passages")
    .select("band, site_id, passage_index")
    .eq("language", language)
    .eq("band", newBand)
    .eq("site_id", newSiteId)
    .eq("passage_index", newPassageIndex)
    .maybeSingle();

  if (!nextPassage) {
    return NextResponse.json({
      celebrate: true,
      redirect: `/kids/${kidId}/reading?celebrate=1`,
    });
  }

  // ⭐ 5. Update progress
  const { error: updateError } = await supabase
    .from("progress")
    .update({
      band: newBand,
      site_id: newSiteId,
      passage_index: newPassageIndex,
      streak: progress.streak + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("kid_id", kidId);

  console.log("UPDATE ERROR:", updateError);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }

  // ⭐ 6. Return next progression state + redirect
  return NextResponse.json({
    band: newBand,
    site_id: newSiteId,
    passage_index: newPassageIndex,
    celebrate: false,
    redirect: `/kids/${kidId}/reading?band=${newBand}&siteId=${newSiteId}&passageIndex=${newPassageIndex}`,
  });
}
