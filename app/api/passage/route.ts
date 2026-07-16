import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const { band, siteId, passageIndex, language } = JSON.parse(raw);

    if (!band || siteId === undefined || passageIndex === undefined || !language) {
      return NextResponse.json(
        { error: "Missing band, siteId, passageIndex, or language" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: passageRow, error } = await supabase
      .from("passages")
      .select("text")
      .eq("band", band)
      .eq("site_id", siteId)
      .eq("passage_index", passageIndex)
      .eq("language", language)
      .single();

    if (error || !passageRow || !passageRow.text) {
      return NextResponse.json(
        { error: "Passage not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { text: passageRow.text },
      { status: 200 }
    );
  } catch (err) {
    console.error("passage route error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
