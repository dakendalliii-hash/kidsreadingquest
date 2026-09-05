import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: any   // Next.js 16 inference workaround
) {
  const { id: kidId } = await context.params;

  const body = await request.json();
  const { band, siteId, passageIndex } = body;

  if (!band || !siteId || passageIndex === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: band, siteId, passageIndex" },
      { status: 400 }
    );
  }

  // ⭐ FIX: await the Supabase client
  const supabase = await createServerSupabaseClient();

  const { data: questions, error } = await supabase
    .from("reading_questions")
    .select("id, question_type, question_text, correct_answer")
    .eq("band", band)
    .eq("site_id", siteId)
    .eq("passage_index", passageIndex)
    .eq("question_type", "vocabulary");

  if (error) {
    console.error("[QUESTIONS API] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vocabulary questions" },
      { status: 500 }
    );
  }

  return NextResponse.json({ questions });
}
