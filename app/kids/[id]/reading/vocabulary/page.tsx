// app/kids/[id]/reading/vocabulary/page.tsx

import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReadingVocabularyClient from "./ReadingVocabularyClient";
import { logError } from "@/lib/logging/logError";

// Questions are shuffled on every request, so this page must never be cached.
export const dynamic = "force-dynamic";

type ReadingQuestionRow = {
  question_text: string;
  correct_answer: string | number;
  options: unknown;
};

type VocabularyQuestion = {
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

function buildQuestions(rows: ReadingQuestionRow[]): VocabularyQuestion[] {
  const questions: VocabularyQuestion[] = [];

  for (const row of rows) {
    const options = parseOptions(row.options);
    const correctIdx = Number(row.correct_answer);

    if (
      !options ||
      !Number.isInteger(correctIdx) ||
      correctIdx < 0 ||
      correctIdx >= options.length
    ) {
      console.error("[VOCAB PAGE] Skipping malformed question row:", row);
      continue;
    }

    // Tag the correct option BEFORE shuffling so we can find it afterwards.
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

  return shuffle(questions);
}

// Workout values look like 1.1, 1.2, 1.3, 2.1 ...
// Floating point makes (1.3 % 1) come out as 0.30000000000000004,
// so round the fractional part to the nearest tenth before comparing.
function isFinalWorkoutStep(workout: number): boolean {
  const tenths = Math.round((workout - Math.floor(workout)) * 10);
  return tenths === 3;
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

    // ⭐ 1. Load progress (includes the workout value)
    const { data: progress } = await supabase
      .from("progress")
      .select("band, site_id, passage_index, workout")
      .eq("kid_id", kidId)
      .single();

    if (!progress) {
      return <div>Loading...</div>;
    }

    // ⭐ 2. Apply URL overrides sent by the comprehension page
    const resolvedSearchParams = await searchParams;

    const band = resolvedSearchParams.band ?? progress.band;
    const siteId = resolvedSearchParams.siteId
      ? Number(resolvedSearchParams.siteId)
      : progress.site_id;
    const passageIndex = resolvedSearchParams.passageIndex
      ? Number(resolvedSearchParams.passageIndex)
      : progress.passage_index;

    // ⭐ 3. Workout always comes from the progress table
    const workout = Number(progress.workout);
    if (progress.workout === null || Number.isNaN(workout)) {
      return <div>Workout not found for this reader.</div>;
    }

    const isFinalWorkout = isFinalWorkoutStep(workout);

    console.log("[VOCAB PAGE] effective:", {
      kidId,
      band,
      siteId,
      passageIndex,
      workout,
      isFinalWorkout,
    });

    // ⭐ 4. Load vocab questions for this band + workout
    const { data: questionRows, error: questionsError } = await supabase
      .from("reading_questions")
      .select("question_text, correct_answer, options")
      .eq("band", band)
      .eq("workout", workout)
      .eq("question_type", "vocab");

    if (questionsError) {
      throw new Error(
        `Failed to load vocab questions for band=${band}, workout=${workout}: ${questionsError.message}`
      );
    }

    const questionsData = buildQuestions(
      (questionRows ?? []) as ReadingQuestionRow[]
    );

    // ⭐ 5. Render vocabulary client (NO server-side gating)
    return (
      <ReadingVocabularyClient
        kidId={kidId}
        band={band}
        siteId={siteId}
        passageIndex={passageIndex}
        isFinalWorkout={isFinalWorkout} 
        questions={questionsData}
      />
    );
  } catch (error) {
    await logError("SSR: app/kids/[id]/reading/vocabulary", error);
    throw error;
  }
}

