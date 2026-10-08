// =========================================================
// FILE: app/kids/[id]/kid-profile/[source]/page.tsx
// PURPOSE: Kid Profile Page (SSR) using global CSS formatting
// =========================================================

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect, unstable_rethrow } from "next/navigation";
import { logError } from "@/lib/logging/logError";

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string; source: string }>;
}) {
  try {
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

    const parentPlanType = parentRecord.plan_type ?? "Not assigned";

    // ⭐ Ensure kid belongs to parent
    const { data: kid } = await supabase
      .from("kids")
      .select("*")
      .eq("id", kidId)
      .eq("parent_id", parentRecord.id)
      .single();

    if (!kid) redirect("/parent");

    // ⭐ Determine reading plan type based on route segment
    const isFromAssessmentResults = source === "from-assessment";

    // ⭐ Has the kid taken the assessment yet?
    const { data: assessmentAttempt } = await supabase
      .from("reading_attempts")
      .select("metrics")
      .eq("kid_id", kidId)
      .eq("attempt_type", "assessment")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // No assessment on file → send the kid through the assessment flow.
    // (Skipped when arriving from the assessment results, so a failed save
    // can't cause an endless redirect loop.)
    if (!assessmentAttempt && !isFromAssessmentResults) {
      redirect(`/kids/${kidId}/assessment`);
    }

    // ⭐ Fetch band + current workout from progress (single query)
    const { data: progress } = await supabase
      .from("progress")
      .select("band, workout")
      .eq("kid_id", kidId)
      .single();

    const band = progress?.band ?? "Unknown";

    const workoutNumber = Number(progress?.workout);
    const hasWorkout = Number.isFinite(workoutNumber) && workoutNumber > 0;
    const currentWorkout = hasWorkout ? workoutNumber : "Unknown";
    // e.g. current workout 2.1 → last completed workout 1
    const lastWorkoutCompleted = hasWorkout ? Math.floor(workoutNumber) - 1 : 0;

    // ⭐ Fetch last workout attempt (workouts only, not the assessment)
    const { data: lastAttempt } = await supabase
      .from("reading_attempts")
      .select("created_at")
      .eq("kid_id", kidId)
      .eq("attempt_type", "existing")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastWorkoutDate = lastAttempt?.created_at ?? null;

    // ⭐ Extract accuracy from metrics jsonb
    const assessmentScore =
      assessmentAttempt?.metrics?.accuracy ?? "Not yet tested";

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
            <p>
              <strong>Birthday:</strong>{" "}
              <span style={{ color: "red" }}>10/12/2021</span>
            </p>
            <p><strong>Band:</strong> {band}</p>
            <p><strong>Assessment Score:</strong> {assessmentScore}</p>
            <p>
              <strong>Current Fitness Score:</strong>{" "}
              <span style={{ color: "red" }}>85</span>
            </p>
            <p><strong>Reading Plan Type:</strong> {parentPlanType}</p>
            <p><strong>Date Joined:</strong> {dateJoined}</p>
            <p>
              <strong>Last Workout Date:</strong>{" "}
              {lastWorkoutDate
                ? new Date(lastWorkoutDate).toLocaleString()
                : "None"}
            </p>
            <p>
              <strong>Last Workout Completed:</strong>{" "}
              {lastWorkoutCompleted > 0 ? lastWorkoutCompleted : "None"}
            </p>
            <p><strong>Workout Number:</strong> {currentWorkout}</p>
          </div>

          {/* ⭐ Start Workout Button */}
          <a
            href={`/kids/${kidId}/reading`}
            className="btn-green full-card-button"
          >
            Start Workout
          </a>
        </div>
      </main>
    );
  } catch (error) {
    // redirect() works by throwing a special error. Let Next.js handle those
    // (redirects, notFound, etc.) and only log/rethrow genuine failures.
    unstable_rethrow(error);

    await logError("SSR: app/kids/[id]/kid-profile", error);
    throw error;
  }
}
