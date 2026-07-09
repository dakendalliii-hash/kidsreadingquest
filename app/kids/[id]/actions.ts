"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Fully language-aware progression engine.
 * Called after successful reading.
 *
 * MicReader → readAloudAction → markPassageCompleteAction
 */

export async function markPassageCompleteAction(
  kidId: string,
  language: "en" | "hindi" = "en"
) {
  const supabase = await createServerSupabaseClient();

  // Load current progress
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index, streak")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    throw new Error("Could not load progress.");
  }

  const currentBand = progress.band;
  const currentSite = progress.site_id;
  const currentIndex = progress.passage_index;

  /* ---------------------------------------------------------
     1. Try next passage in the same site (language-aware)
  --------------------------------------------------------- */
  const { data: nextPassageSameSite } = await supabase
    .from("passages")
    .select("id")
    .eq("language", language)
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

    redirect(`/kids/${kidId}?celebrate=1&lang=${language}`);
  }

  /* ---------------------------------------------------------
     2. Try first passage of the next site (language-aware)
  --------------------------------------------------------- */
  const { data: nextSiteFirstPassage } = await supabase
    .from("passages")
    .select("id")
    .eq("language", language)
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

    redirect(`/kids/${kidId}?celebrate=1&lang=${language}`);
  }

  /* ---------------------------------------------------------
     3. Graduate to next band (language-aware)
  --------------------------------------------------------- */
  const nextBand =
    currentBand === "A"
      ? "B"
      : currentBand === "B"
      ? "C"
      : "C"; // stays at C

  const { data: nextBandFirstPassage } = await supabase
    .from("passages")
    .select("id")
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
        status: "not started",
        streak: progress.streak + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("kid_id", kidId);

    redirect(`/kids/${kidId}?celebrate=1&lang=${language}`);
  }

  /* ---------------------------------------------------------
     4. No more passages anywhere — celebrate
  --------------------------------------------------------- */
  redirect(`/kids/${kidId}?celebrate=1&lang=${language}`);
}
