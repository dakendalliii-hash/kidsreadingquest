// =========================================================
// FILE: app/kids/[id]/kid-profile/[source]/page.tsx
// PURPOSE: Kid Profile Page (SSR) using global CSS formatting
// =========================================================

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string; source: string }>;
}) {
  const { id: kidId, source } = await params;

console.log("KidProfile params:", { id: kidId, source });

  const supabase = await createServerSupabaseClient();

  // ⭐ Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ⭐ Fetch parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/login");

  // ⭐ Ensure kid belongs to parent
  const { data: kid } = await supabase
    .from("kids")
    .select("*")
    .eq("id", kidId)
    .eq("parent_id", parentRecord.id)
    .single();

  if (!kid) redirect("/parent");

  // ⭐ Fetch band from progress
  const { data: progress } = await supabase
    .from("progress")
    .select("band")
    .eq("kid_id", kidId)
    .single();

  const band = progress?.band ?? "Unknown";

  // ⭐ Fetch last workout attempt
  const { data: lastAttempt } = await supabase
    .from("reading_attempts")
    .select("created_at, site_id, passage_index")
    .eq("kid_id", kidId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const lastWorkoutDate = lastAttempt?.created_at ?? null;
  const lastWorkoutCompleted = lastAttempt
    ? `${lastAttempt.site_id}-${lastAttempt.passage_index}`
    : "None";

  // ⭐ Fetch latest assessment attempt
  const { data: assessmentAttempt } = await supabase
    .from("reading_attempts")
    .select("metrics")
    .eq("kid_id", kidId)
    .eq("attempt_type", "assessment")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // ⭐ Extract accuracy from metrics jsonb
  const assessmentScore =
    assessmentAttempt?.metrics?.accuracy ?? "Not yet tested";

  // ⭐ Determine reading plan type based on route segment
  const isFromAssessmentResults = source === "from-assessment";

  let readingPlanType = kid.reading_plan_type ?? "Not assigned";

  if (isFromAssessmentResults) {
    readingPlanType = "Default";
  }

  // ⭐ Date joined
  const dateJoined = kid.created_at
    ? new Date(kid.created_at).toLocaleDateString()
    : "Unknown";

  // =========================================================
  // RENDER PAGE
  // =========================================================
  return (
    <main
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        padding: "80px 40px 40px 40px",
      }}
    >
      <div className="page-container">
        <h1 className="section-header">Kid Profile</h1>

        {/* ⭐ Profile Fields */}
        <div className="forward-card">
          <p><strong>Name:</strong> {kid.name}</p>
          <p><strong>Age:</strong> {kid.age}</p>
          <p><strong>Band:</strong> {band}</p>
          <p><strong>Assessment Score:</strong> {assessmentScore}</p>
          <p><strong>Reading Plan Type:</strong> {readingPlanType}</p>
          <p><strong>Date Joined:</strong> {dateJoined}</p>
          <p><strong>Last Workout Date:</strong> {lastWorkoutDate ? new Date(lastWorkoutDate).toLocaleString() : "None"}</p>
          <p><strong>Last Workout Completed:</strong> {lastWorkoutCompleted}</p>
        </div>

        {/* ⭐ Start Workout Button */}
        <a href={`/kids/${kidId}/reading`} className="btn-green full-card-button">
          Start Workout
        </a>
      </div>
    </main>
  );
}
