// app/kids/[id]/reading/vocabulary/page.tsx

import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingVocabularyClient from "./ReadingVocabularyClient";

// ⭐ Generate vocabulary questions dynamically
function generateVocabularyQuestions(passageText: string) {
  const words = passageText
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (words.length < 3) {
    words.push("story", "animal", "forest");
  }

  const pickWord = () =>
    words[Math.floor(Math.random() * words.length)];

  const w1 = pickWord();
  const w2 = pickWord();
  const w3 = pickWord();

  return [
    {
      question: `What does the word "${w1}" most likely mean in the passage?`,
      choices: ["An object", "An action", "A description", "A feeling"],
      correctIndex: 0,
    },
    {
      question: `Which word has a similar meaning to "${w2}"?`,
      choices: ["Happy", "Fast", "Bright", "Strong"],
      correctIndex: 0,
    },
    {
      question: `What is the opposite of "${w3}"?`,
      choices: ["Cold", "Slow", "Quiet", "Weak"],
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

  // ⭐ 1. Load progress (NO redirect)
  const { data: progress } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  // If progress is missing, render nothing (client will handle gating)
  if (!progress) {
    return <div>Loading...</div>;
  }

  const { band, site_id, passage_index } = progress;

  console.log(
    "[VOCAB PAGE] kidId:",
    kidId,
    "band:",
    band,
    "siteID:",
    site_id,
    "PassageIndex:",
    passage_index
  );

  // ⭐ 2. Load passage text (NO redirect)
  const { data: passageData } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", passage_index)
    .eq("language", "en")
    .single();

  if (!passageData) {
    return <div>Passage not found.</div>;
  }

  // ⭐ 3. Generate vocabulary questions dynamically
  const questionsData = generateVocabularyQuestions(passageData.text);

  // ⭐ 4. Render vocabulary client (NO server-side gating)
  return (
    <ReadingVocabularyClient
      kidId={kidId}
      passageText={passageData.text}
      band={band}
      siteId={site_id}
      passageIndex={passage_index}
      questions={questionsData}
    />
  );
}
