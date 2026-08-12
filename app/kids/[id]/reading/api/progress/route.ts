import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Progress not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
