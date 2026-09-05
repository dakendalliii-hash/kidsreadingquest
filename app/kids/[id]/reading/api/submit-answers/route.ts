import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: any) {
  // Next.js 16 bug workaround: params is inferred as Promise<{ id: string }>
  const { id: kidId } = await context.params;

  try {
    const body = await request.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required fields: attemptId, answers[]" },
        { status: 400 }
      );
    }

    // ⭐ FIX: await the Supabase client
    const supabase = await createServerSupabaseClient();

    // Validate attempt exists
    const { data: attemptCheck, error: attemptErr } = await supabase
      .from("reading_attempts")
      .select("id")
      .eq("id", attemptId)
      .eq("kid_id", kidId)
      .single();

    if (attemptErr || !attemptCheck) {
      return NextResponse.json(
        { error: "Invalid attemptId or attempt does not belong to this kid" },
        { status: 400 }
      );
    }

    // Prepare rows for insertion
    const rows = answers.map((a: any) => ({
      attempt_id: attemptId,
      question_id: a.questionId,
      kid_answer: a.kidAnswer,
      is_correct: a.isCorrect,
    }));

    const { error: insertErr } = await supabase
      .from("reading_attempt_questions")
      .insert(rows);

    if (insertErr) {
      console.error("[SUBMIT ANSWERS API] Insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to store answers" },
        { status: 500 }
      );
    }

    // Optional: compute summary
    const total = rows.length;
    const correct = rows.filter((r) => r.is_correct).length;

    return NextResponse.json({
      success: true,
      attemptId,
      totalQuestions: total,
      correctAnswers: correct,
    });
  } catch (err) {
    console.error("[SUBMIT ANSWERS API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
