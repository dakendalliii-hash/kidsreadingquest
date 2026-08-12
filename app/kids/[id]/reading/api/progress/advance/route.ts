import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;
  const { language } = await request.json();

  const supabase = await createServerSupabaseClient();

  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index, streak")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    return NextResponse.json({ error: "Progress not found" }, { status: 404 });
  }

  const { band, site_id, passage_index } = progress;

  // Try next passage in same site
  const nextIndex = passage_index + 1;

  const { data: nextPassageSameSite } = await supabase
    .from("passages")
    .select("band, site_id, passage_index")
    .eq("language", language)
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", nextIndex)
    .maybeSingle();

  if (nextPassageSameSite) {
    await supabase
      .from("progress")
      .update({
        passage_index: nextIndex,
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    return NextResponse.json({
      band,
      site_id,
      passage_index: nextIndex,
      celebrate: false,
    });
  }

  // Try first passage of next site
  const nextSite = site_id + 1;

  const { data: nextSiteFirstPassage } = await supabase
    .from("passages")
    .select("band, site_id, passage_index")
    .eq("language", language)
    .eq("band", band)
    .eq("site_id", nextSite)
    .eq("passage_index", 1)
    .maybeSingle();

  if (nextSiteFirstPassage) {
    await supabase
      .from("progress")
      .update({
        site_id: nextSite,
        passage_index: 1,
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    return NextResponse.json({
      band,
      site_id: nextSite,
      passage_index: 1,
      celebrate: false,
    });
  }

  // Graduate to next band
  const nextBand = band === "A" ? "B" : band === "B" ? "C" : "C";

  const { data: nextBandFirstPassage } = await supabase
    .from("passages")
    .select("band, site_id, passage_index")
    .eq("language", language)
    .eq("band", nextBand)
    .eq("site_id", 1)
    .eq("passage_index", 1)
    .maybeSingle();

  if (nextBandFirstPassage) {
    await supabase
      .from("progress")
      .update({
        band: nextBand,
        site_id: 1,
        passage_index: 1,
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    return NextResponse.json({
      band: nextBand,
      site_id: 1,
      passage_index: 1,
      celebrate: false,
    });
  }

  // No more passages → celebrate
  return NextResponse.json({ celebrate: true });
}
