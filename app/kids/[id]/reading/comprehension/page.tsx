// app/kids/[id]/reading/comprehension/page.tsx

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingComprehensionClient from "./ReadingComprehensionClient";
import { logError } from "@/lib/logging/logError";

// Questions are shuffled on every request, so this page must never be cached.
export const dynamic = "force-dynamic";

type ReadingQuestionRow = {
  question_text: string;
  correct_answer: string | number;
  options: unknown;
};

type ComprehensionQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
};

// Fisher-Yates shuffle (returns a new array)
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// options is jsonb, so supabase-js normally returns a parsed array,
// but fall back to JSON.parse in case it arrives as a string.
function parseOptions(raw: unknown): string[] | null {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value) || value.length === 0) return null;
  return value.map(String);
}

function buildQuestions(rows: ReadingQuestionRow[]): ComprehensionQuestion[] {
  const questions: ComprehensionQuestion[] = [];

  for (const row of rows) {
    const options = parseOptions(row.options);
    const correctIdx = Number(row.correct_answer);

    if (
      !options ||
      !Number.isInteger(correctIdx) ||
      correctIdx < 0 ||
      correctIdx >= options.length
    ) {
      console.error("[COMPREHENSION PAGE] Skipping malformed question row:", row);
      continue;
    }

    // Tag the correct option BEFORE shuffling so we can find it afterwards,
    // even if two options happen to have identical text.
    const tagged = options.map((text, i) => ({
      text,
      isCorrect: i === correctIdx,
    }));
    const shuffledOptions = shuffle(tagged);

    questions.push({
      question: row.question_text,
      choices: shuffledOptions.map((o) => o.text),
      correctIndex: shuffledOptions.findIndex((o) => o.isCorrect),
    });
  }

  // Shuffle the question order too, so each try looks different.
  return shuffle(questions);
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

    // ⭐ Load progress (now includes the workout value)
    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("band, site_id, passage_index, workout")
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

    // ⭐ Workout always comes from the progress table
    const workout = Number(progress.workout);
    if (progress.workout === null || Number.isNaN(workout)) {
      throw new Error(`No workout value on progress row for kid=${kidId}`);
    }

    console.log("[COMPREHENSION PAGE] effective:", {
      kidId,
      band,
      siteId,
      passageIndex,
      workout,
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

    // ⭐ Load comprehension questions for this band + workout
    const { data: questionRows, error: questionsError } = await supabase
      .from("reading_questions")
      .select("question_text, correct_answer, options")
      .eq("band", band)
      .eq("workout", workout)
      .eq("question_type", "comprehension");

    if (questionsError) {
      throw new Error(
        `Failed to load questions for band=${band}, workout=${workout}: ${questionsError.message}`
      );
    }

    const questionsData = buildQuestions(
      (questionRows ?? []) as ReadingQuestionRow[]
    );

console.log("[READ COMP PAGE] Query values:", {
  band,
  workout,
  workoutType: typeof workout,
});
console.log("[READ COMP PAGE] Question Data:", { questionRows, questionsError });
console.log("[READ COMP PAGE] Question Data: ", { questionRows });

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
  } catch (error) {
    console.error("SSR: comprehension", error);
    throw error;
  }
}
