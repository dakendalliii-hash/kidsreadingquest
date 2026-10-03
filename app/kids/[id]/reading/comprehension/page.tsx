// app/kids/[id]/reading/comprehension/page.tsx

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingComprehensionClient from "./ReadingComprehensionClient";
import { logError } from "@/lib/logging/logError";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    band?: string;
    siteId?: string;
    passageIndex?: string;
  }>;
}) {
  try {
    const { id: kidId } = await params;
    const supabase = await createServerSupabaseClient();

    // ⭐ Load progress
    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("band, site_id, passage_index")
      .eq("kid_id", kidId)
      .single();

    if (progressError || !progress) {
      redirect(`/kids/${kidId}/read-aloud?lang=en`);
    }

    // ⭐ Read overrides from URL

const resolvedSearchParams = await searchParams;

const overrideBand = resolvedSearchParams.band;
const overrideSiteId = resolvedSearchParams.siteId;
const overridePassageIndex = resolvedSearchParams.passageIndex;


    // ⭐ Apply overrides when present
    const band = overrideBand ?? progress.band;
    const siteId = overrideSiteId ? Number(overrideSiteId) : progress.site_id;
    const passageIndex = overridePassageIndex
      ? Number(overridePassageIndex)
      : progress.passage_index;

    console.log("[COMPREHENSION PAGE] effective:", {
      kidId,
      band,
      siteId,
      passageIndex,
      overrideBand,
      overrideSiteId,
      overridePassageIndex,
    });

    // ⭐ Fluency check
    const { data: fluencyAttempt } = await supabase
      .from("reading_attempts")
      .select("fluency_passed")
      .eq("kid_id", kidId)
      .eq("site_id", siteId)
      .eq("passage_index", passageIndex)
      .eq("attempt_type", "existing")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!fluencyAttempt || fluencyAttempt.fluency_passed === false) {
      redirect(`/kids/${kidId}/read-aloud?lang=en`);
    }

    // ⭐ Load passage text
    const { data: passageData, error: passageError } = await supabase
      .from("passages")
      .select("text")
      .eq("band", band)
      .eq("site_id", siteId)
      .eq("passage_index", passageIndex)
      .eq("language", "en")
      .single();

    if (passageError || !passageData) {
      throw new Error(
        `Passage not found for band=${band}, site=${siteId}, index=${passageIndex}`
      );
    }

    const questionsData = generateComprehensionQuestions(passageData.text);

    return (
      <ReadingComprehensionClient
        kidId={kidId}
        passageText={passageData.text}
        band={band}
        siteId={siteId}
        passageIndex={passageIndex}
        questions={questionsData}
      />
    );
  }  catch (error) {
  console.error("SSR: comprehension", error);
  throw error;
}

}
