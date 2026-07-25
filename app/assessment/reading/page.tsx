// kidsreadingquest/app/assessment/reading/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReadingClient from "./ReadingClient";

// =========================================================
// SSR PAGE — LOAD ASSESSMENT PASSAGE
// =========================================================
export default async function AssessmentReadingPage() {
  const supabase = await createServerSupabaseClient();

  // 1️⃣ Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // 2️⃣ Get parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // 3️⃣ Ensure at least one kid exists
  const { data: kids } = await supabase
    .from("kids")
    .select("id, age")
    .eq("parent_id", parentRecord.id);

  if (!kids || kids.length === 0) {
    redirect("/parent/manage-kids/add");
  }

  // 4️⃣ Determine band from age (same logic as addKid)
  const kid = kids[0];
  const age = kid.age;

  let band = "";
  if (age >= 4 && age <= 5) band = "A 4-5";
  else if (age >= 6 && age <= 7) band = "B 6-7";
  else if (age >= 8 && age <= 9) band = "C 8-9";
  else throw new Error("Invalid age.");

  // 5️⃣ Load assessment passage from assessments table
  const { data: assessment } = await supabase
    .from("assessments")
    .select("passage")
    .eq("band", band)
    .single();

  if (!assessment) {
    throw new Error("Assessment passage not found for band: " + band);
  }

  return (
    <ReadingClient
      passage={assessment.passage}
      band={band}
    />
  );
}
