"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * This file intentionally contains ONLY the legacy SSR actions
 * that your app still uses elsewhere.
 *
 * The new read-aloud flow lives in:
 *   /app/kids/[id]/readAloudAction.ts
 *
 * We keep this file clean and minimal.
 */

/* ---------------------------------------------------------
   LEGACY: markPassageCompleteAction
   (Still used by older parts of the app, not by MicReader)
--------------------------------------------------------- */
export async function markPassageCompleteAction(kidId: string) {
  const supabase = await createServerSupabaseClient();

  // Load progress
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

  // Try next passage in same site
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
  }

  // Try next site
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
  }

  // Graduate to next band
  const nextBand =
    currentBand === "A"
      ? "B"
      : currentBand === "B"
      ? "C"
      : "C"; // stays at C

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
  }

  // No more passages anywhere
  redirect(`/kids/${kidId}?celebrate=1`);
}
