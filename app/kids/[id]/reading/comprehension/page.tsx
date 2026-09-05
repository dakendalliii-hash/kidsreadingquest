// app/kids/[id]/reading/comprehension/page.tsx

import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingComprehensionClient from "./ReadingComprehensionClient";

function generateComprehensionQuestions(passageText: string) {
  const sentences = passageText
    .split(/[.?!]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const firstSentence = sentences[0] || passageText;
  const randomSentence =
    sentences[Math.floor(Math.random() * sentences.length)] || firstSentence;

  return [
    {
      question: "What is the passage mainly about?",
      choices: [
        "A description of a place",
        "A list of instructions",
        "A conversation between people",
        "A story about animals",
      ],
      correctIndex: 0,
    },
    {
      question: `What happens in this part of the passage: "${randomSentence}"?`,
      choices: [
        "Something moves or changes",
        "Someone asks a question",
        "A problem is solved",
        "A character leaves the scene",
      ],
      correctIndex: 0,
    },
    {
      question: "How does the narrator feel in the passage?",
      choices: ["Curious", "Angry", "Sleepy", "Confused"],
      correctIndex: 0,
    },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ⭐ Next.js 16 param unwrapping
  const { id: kidId } = await params;

  const supabase = await createServerSupabaseClient();

  // ⭐ 1. Load progress (band, site, passage_index)
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    redirect(`/kids/${kidId}/read-aloud?lang=en`);
  }

  const { band, site_id, passage_index } = progress;

  console.log(
    "[COMPREHENSION PAGE] kidId:",
    kidId,
    "band:",
    band,
    "siteID:",
    site_id,
    "PassageIndex:",
    passage_index
  );

// ⭐ 2. Load latest fluency attempt
const { data: fluencyAttempt, error: fluencyError } = await supabase
  .from("reading_attempts")
  .select("fluency_passed")
  .eq("kid_id", kidId)
  .eq("site_id", site_id)
  .eq("passage_index", passage_index)
  .eq("attempt_type", "existing")   // ⭐ RESTORED LINE
  .order("created_at", { ascending: false })
  .limit(1)
  .single();

// ⭐ Only redirect if we have a definitive false
if (fluencyError || !fluencyAttempt) {
  redirect(`/kids/${kidId}/read-aloud?lang=en`);
}

if (fluencyAttempt.fluency_passed === false) {
  redirect(`/kids/${kidId}/read-aloud?lang=en`);
}

  // ⭐ 3. Load passage text (English only)
  const { data: passageData, error: passageError } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", passage_index)
    .eq("language", "en")
    .single();

  if (passageError || !passageData) {
    throw new Error(
      `Passage not found for band=${band}, site=${site_id}, index=${passage_index}`
    );
  }

  // ⭐ 4. Generate comprehension questions dynamically
  const questionsData = generateComprehensionQuestions(passageData.text);

  // ⭐ 5. Render comprehension client
  return (
    <ReadingComprehensionClient
      kidId={kidId}
      passageText={passageData.text}
      band={band}
      siteId={site_id}
      passageIndex={passage_index}
      questions={questionsData}
    />
  );
}
