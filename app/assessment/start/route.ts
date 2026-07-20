import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const age = Number(formData.get("age"));

  let band = "";
  if (age <= 5) band = "A 4-5";
  else if (age <= 7) band = "B 6-7";
  else band = "C 8-9";

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("band, title, a_text")
    .eq("band", band)
    .single();

  if (error || !data) {
    redirect("/assessment?error=missing_passage");
  }

  redirect(
    `/assessment?band=${encodeURIComponent(data.band)}&title=${encodeURIComponent(
      data.title
    )}&text=${encodeURIComponent(data.a_text)}&age=${age}`
  );
}
