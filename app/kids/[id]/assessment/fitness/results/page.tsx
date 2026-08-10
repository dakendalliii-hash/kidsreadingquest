// kidsreadingquest/app/assessment/fitness/results/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResultsClient from "./ResultsClient";

export default async function FitnessAssessmentResultsPage() {
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

  if (!parentRecord) redirect("/unauthorized");

  // 3️⃣ Load kid
  const { data: kids } = await supabase
    .from("kids")
    .select("id, age, name")
    .eq("parent_id", parentRecord.id);

  if (!kids || kids.length === 0) redirect("/parent/manage-kids/add");

  const kid = kids[0];

  // 4️⃣ Determine current band from age
  let currentBand = "";
  if (kid.age <= 5) currentBand = "A 4-5";
  else if (kid.age <= 7) currentBand = "B 6-7";
  else currentBand = "C 8-9";

  // 5️⃣ Load assessment results summary + score
  const { data: assessment } = await supabase
    .from("assessments")
    .select("results_summary, score")
    .eq("band", currentBand)
    .single();

  if (!assessment) throw new Error("Assessment results not found.");

  const score = assessment.score ?? 0;

  // 6️⃣ Determine recommended band
  let recommendedBand = currentBand;
  if (score > 80) {
    if (currentBand.startsWith("A")) recommendedBand = "B 6-7";
    else if (currentBand.startsWith("B")) recommendedBand = "C 8-9";
  }

  // 7️⃣ Store recommended band in kids table (NEW)
  await supabase
    .from("kids")
    .update({ recommended_band: recommendedBand })
    .eq("id", kid.id);

  // 8️⃣ Render client component
  return (
    <ResultsClient
      kidName={kid.name}
      currentBand={currentBand}
      recommendedBand={recommendedBand}
      resultsSummary={assessment.results_summary}
      score={score}
    />
  );
}
