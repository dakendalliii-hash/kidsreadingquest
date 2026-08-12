import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;
  const { band, siteId, passageIndex, language } = await request.json();

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", siteId)
    .eq("passage_index", passageIndex)
    .eq("language", language)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  }

  return NextResponse.json({ text: data.text });
}
