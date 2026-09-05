// app/kids/[id]/reading/results/page.tsx

import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingResultsClient from "./ReadingResultsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ⭐ Next.js 16 param unwrapping
  const { id: kidId } = await params;

  const supabase = await createServerSupabaseClient();

  // ⭐ 1. Load progress (band, site, passage_index)
  const { data: progress } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  // If progress missing, render nothing (client handles gating)
  if (!progress) {
    return <div>Loading...</div>;
  }

  const { band, site_id, passage_index } = progress;

  // ⭐ 2. Load latest "existing" attempt (fluency + comprehension + vocabulary)
  const { data: latestAttempt } = await supabase
    .from("reading_attempts")
    .select(
      "metrics, fluency_passed, comprehension_passed, comprehension_score, vocabulary_passed, vocabulary_score"
    )
    .eq("kid_id", kidId)
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", passage_index)
    .eq("attempt_type", "existing") // ⭐ unified attempt type
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no attempt exists, show loading (client handles gating)
  if (!latestAttempt) {
    return <div>Loading...</div>;
  }

  // ⭐ 3. Render results client
  return (
    <ReadingResultsClient
      kidId={kidId}
      band={band}
      siteId={site_id}
      passageIndex={passage_index}
      fluencyAttempt={latestAttempt}
      comprehensionAttempt={latestAttempt}
      vocabularyAttempt={latestAttempt}
    />
  );
}
