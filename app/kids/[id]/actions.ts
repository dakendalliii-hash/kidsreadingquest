"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function markPassageCompleteAction(formData: FormData) {
  const kidId = formData.get("kidId") as string;
  const supabase = await createServerSupabaseClient();

  // 1. Get current progress
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index, streak")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    console.error("Progress lookup failed:", progressError);
    redirect(`/kids/${kidId}`);
    return;
  }

  const currentBand = progress.band;
  const currentSite = progress.site_id;
  const currentIndex = progress.passage_index;

  // 2. Try to find the next passage in the same site
  const { data: nextPassageSameSite } = await supabase
    .from("passages")
    .select("id")
    .eq("language", "en")
    .eq("band", currentBand)
    .eq("site_id", currentSite)
    .eq("passage_index", currentIndex + 1)
    .maybeSingle();

  if (nextPassageSameSite) {
    await supabase
      .from("progress")
      .update({
        passage_index: currentIndex + 1,
        status: "not started",
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    redirect(`/kids/${kidId}?celebrate=1`);
    return;
  }

  // 3. No more passages in this site → try next site
  const { data: nextSiteFirstPassage } = await supabase
    .from("passages")
    .select("id")
    .eq("language", "en")
    .eq("band", currentBand)
    .eq("site_id", currentSite + 1)
    .eq("passage_index", 1)
    .maybeSingle();

  if (nextSiteFirstPassage) {
    await supabase
      .from("progress")
      .update({
        site_id: currentSite + 1,
        passage_index: 1,
        status: "not started",
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    redirect(`/kids/${kidId}?celebrate=1`);
    return;
  }

  // 4. No more sites → graduate to next band
  const nextBand =
    currentBand === "A"
      ? "B"
      : currentBand === "B"
      ? "C"
      : "C"; // stays at C if already at C

  const { data: nextBandFirstPassage } = await supabase
    .from("passages")
    .select("id")
    .eq("language", "en")
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
        status: "not started",
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    redirect(`/kids/${kidId}?celebrate=1`);
    return;
  }

  // 5. No more passages anywhere → stay where you are
  console.warn("No more passages available for this kid.");
  redirect(`/kids/${kidId}?celebrate=1`);
}
