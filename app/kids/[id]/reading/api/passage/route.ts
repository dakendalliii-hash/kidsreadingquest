import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const body = await req.json();

  const {
    band,
    siteId,
    passageIndex,
    language: rawLanguage,
  } = body;

  // ⭐ ALWAYS enforce a language (default to EN)
  const language = rawLanguage ?? "en";

  console.log("[PASSAGE API] Fetching passage:", {
    band,
    siteId,
    passageIndex,
    language,
  });

  // ⭐ THIS is where .eq("language", language) belongs
  const { data, error } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", siteId)
    .eq("passage_index", passageIndex)
    .eq("language", language)        // ⭐ REQUIRED — prevents Hindi row from being returned
    .single();

  if (error) {
    console.error("[PASSAGE API] Error:", error);
    return NextResponse.json(
      { error: "Passage not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ text: data.text });
}
