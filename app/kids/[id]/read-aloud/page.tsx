// app/kids/[id]/read-aloud/page.tsx
// ⭐ SERVER COMPONENT
// ⭐ Responsible for loading passage + progress for EXISTING kids
// ⭐ Must use PROGRESS table (not kids table) to keep reading loop aligned
// ⭐ Must query passages with correct columns and language filter

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import MicReaderWrapper from "./MicReaderWrapper";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ⭐ Unwrap Next.js 16 params
  const { id: kidId } = await params;

  console.log("[READ-ALOUD PAGE] kidId:", kidId);

  const supabase = await createServerSupabaseClient();

  // ⭐ 1. Validate kid ownership (same as before — no changes)
  const { data: kidRecord, error: kidError } = await supabase
    .from("kids")
    .select("id, parent_id")
    .eq("id", kidId)
    .single();

  if (kidError || !kidRecord) redirect("/kids");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== kidRecord.parent_id) redirect("/kids");

  // ⭐ 2. Load PROGRESS (band, site, passage_index)
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    // No progress → kid must start at read‑aloud
    redirect(`/kids/${kidId}/read-aloud?lang=en`);
  }

  const { band, site_id, passage_index } = progress;

  // ⭐ 3. Load passage using PROGRESS values
  // ❗ Use real columns: text
  // ❗ Filter by language = 'en' to get the English passage
  const { data: passage, error: passageError } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", passage_index)
    .eq("language", "en")
    .single();

  if (passageError || !passage) {
    // If passage missing, return kid to profile (same behavior as before)
    redirect(`/kids/${kidId}/kid-profile`);
  }

  // ⭐ 4. Render MicReaderWrapper with CORRECT progress values
  // ❗ passageEnglish uses the 'text' column (English, language='en')
  // ❗ passageLocalized is currently the same as passageEnglish
  return (
    <MicReaderWrapper
      passageEnglish={passage.text}
      passageLocalized={passage.text}
      band={band}
      kidId={kidId}
      siteId={site_id}
      passageIndex={passage_index}
    />
  );
}
