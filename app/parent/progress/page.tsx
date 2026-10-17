// =========================================================
// SECTION 1 — Imports
// =========================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect, unstable_rethrow } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import { logError } from "@/lib/logging/logError";

// =========================================================
// SECTION 2 — Types
// =========================================================
interface ParentKidProgress {
  kid_id: string;
  kid_name: string;
  band: string;
  band_id: number;
  site_id: number;
  passage_index: number;
  status: string;
  updated_at: string;
}

// One finished passage (fluency + comprehension + vocabulary stages done)
interface CompletedAttempt {
  createdAt: Date;
  wpm: number | null;
  accuracy: number | null;
  errors: number | null;
  comprehension: number; // reading_attempts.comprehension_score
  vocabulary: number; // reading_attempts.vocabulary_score
}

interface KidMetrics {
  fitnessScore: string;
  dailyCompletion: string;
  weeklyProgress: string;
  monthlyProgress: string;
  speedTrend: string;
  accuracyTrend: string;
  errorTrend: string;
  vocabularyTrend: string;
  comprehensionTrend: string;
}

// =========================================================
// SECTION 3 — Report settings (adjust these to taste)
// =========================================================

// Day boundaries ("today") are calculated in this time zone.
const REPORT_TIME_ZONE = "America/New_York";

// Goals used for the daily / weekly / monthly completion numbers.
const PASSAGES_PER_WORKOUT = 3; // a workout is x.1, x.2, x.3
const WORKOUT_DAYS_PER_WEEK = 5;
const WEEKLY_GOAL = PASSAGES_PER_WORKOUT * WORKOUT_DAYS_PER_WEEK; // 15 passages
const MONTHLY_GOAL = WEEKLY_GOAL * 4; // 60 passages

// Trends compare the latest N finished passages with the N before them.
const TREND_WINDOW = 3;

// Fitness score = average of accuracy, comprehension and vocabulary
// over the latest N finished passages.
const FITNESS_WINDOW = 5;

// =========================================================
// SECTION 4 — Metric helpers
// =========================================================
const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mean(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function dayKey(date: Date): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function percentOfGoal(count: number, goal: number): string {
  return `${Math.min(100, Math.round((count / goal) * 100))}%`;
}

// Workouts are numbered 1.1, 1.2, 1.3, 2.1 ... (3 steps per whole number).
// This turns a workout number into its position in that sequence:
// 1.1 → 1, 1.3 → 3, 2.1 → 4, 67.1 → 199. Anything below 1.1 → 0.
function workoutPosition(workout: number | null | undefined): number {
  if (workout === null || workout === undefined || !Number.isFinite(workout)) {
    return 0;
  }
  if (workout < 1) return 0;

  const major = Math.floor(workout);
  // Round to tenths to avoid floating-point noise (e.g. 2.3 - 2 = 0.2999...)
  const minor = Math.round((workout - major) * 10);

  return (major - 1) * PASSAGES_PER_WORKOUT + Math.max(minor, 1);
}

// progress.workout is the NEXT workout the kid will do, so every workout
// before it is finished. Percent = finished workouts / largest workout.
function workoutProgress(
  currentWorkout: number | null | undefined,
  maxWorkout: number | null | undefined
) {
  const total = workoutPosition(maxWorkout);
  if (total <= 0) return { completed: 0, total: 0, percent: 0 };

  const completed = Math.min(
    total,
    Math.max(0, workoutPosition(currentWorkout) - 1)
  );

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

// "percent" = relative change (speed, errors); "points" = simple difference
// (accuracy, comprehension and vocabulary scores are already percentages).
function trendLabel(
  recent: number | null,
  previous: number | null,
  mode: "percent" | "points"
): string {
  if (recent === null || previous === null) return "Not enough data";

  let change: number;
  if (mode === "points") {
    change = recent - previous;
  } else {
    if (previous === 0) return recent === 0 ? "Even" : "Up";
    change = ((recent - previous) / previous) * 100;
  }

  const rounded = Math.round(Math.abs(change));
  if (rounded < 1) return "Even";

  return `${change > 0 ? "Up" : "Down"} ${rounded}${
    mode === "percent" ? "%" : " pts"
  }`;
}

// attempts must be sorted oldest → newest
function computeKidMetrics(attempts: CompletedAttempt[], now: Date): KidMetrics {
  const recent = attempts.slice(-TREND_WINDOW);
  const previous = attempts.slice(-TREND_WINDOW * 2, -TREND_WINDOW);

  const avg = (
    group: CompletedAttempt[],
    pick: (a: CompletedAttempt) => number | null
  ) => mean(group.map(pick));

  // Fitness score
  const fitnessGroup = attempts.slice(-FITNESS_WINDOW);
  const fitness = mean([
    avg(fitnessGroup, (a) => a.accuracy),
    avg(fitnessGroup, (a) => a.comprehension),
    avg(fitnessGroup, (a) => a.vocabulary),
  ]);

  // Completion counts
  const todayKey = dayKey(now);
  const todayCount = attempts.filter(
    (a) => dayKey(a.createdAt) === todayKey
  ).length;
  const weekCount = attempts.filter(
    (a) => now.getTime() - a.createdAt.getTime() <= 7 * DAY_MS
  ).length;
  const monthCount = attempts.filter(
    (a) => now.getTime() - a.createdAt.getTime() <= 30 * DAY_MS
  ).length;

  return {
    fitnessScore: fitness === null ? "Not enough data" : String(Math.round(fitness)),
    dailyCompletion: `${Math.min(todayCount, PASSAGES_PER_WORKOUT)} of ${PASSAGES_PER_WORKOUT} passages today`,
    weeklyProgress: percentOfGoal(weekCount, WEEKLY_GOAL),
    monthlyProgress: percentOfGoal(monthCount, MONTHLY_GOAL),
    speedTrend: trendLabel(
      avg(recent, (a) => a.wpm),
      avg(previous, (a) => a.wpm),
      "percent"
    ),
    accuracyTrend: trendLabel(
      avg(recent, (a) => a.accuracy),
      avg(previous, (a) => a.accuracy),
      "points"
    ),
    errorTrend: trendLabel(
      avg(recent, (a) => a.errors),
      avg(previous, (a) => a.errors),
      "percent"
    ),
    vocabularyTrend: trendLabel(
      avg(recent, (a) => a.vocabulary),
      avg(previous, (a) => a.vocabulary),
      "points"
    ),
    comprehensionTrend: trendLabel(
      avg(recent, (a) => a.comprehension),
      avg(previous, (a) => a.comprehension),
      "points"
    ),
  };
}

// =========================================================
// SECTION 5 — Page Component
// =========================================================
export default async function ParentProgressReportPage() {
  try {
    const supabase = await createServerSupabaseClient();

    // ------------------------------
    // Auth check
    // ------------------------------
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) redirect("/login");

    // ------------------------------
    // Verify parent
    // ------------------------------
    const { data: parentRecord } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!parentRecord) redirect("/unauthorized");

    // ------------------------------
    // Fetch progress for all kids
    // ------------------------------
    const { data: progressData, error } = await supabase.rpc(
      "get_parent_kid_progress",
      { p_parent_auth_id: user.id }
    );

    if (error) {
      console.error("❌ get_parent_kid_progress failed:", error);
    }

    // ------------------------------
    // ⭐ Largest workout number per band (from the passages table)
    // ------------------------------
    const maxWorkoutByBand: Record<string, number | null> = {};

    const bands: string[] = Array.from(
      new Set<string>(
        (progressData ?? []).map((k: ParentKidProgress) => k.band)
      )
    );

    for (const band of bands) {
      const { data: maxRow, error: maxError } = await supabase
        .from("passages")
        .select("workout")
        .eq("band", band)
        .eq("language", "en")
        .not("workout", "is", null)
        .order("workout", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxError) {
        console.error("❌ max workout query failed:", { band, maxError });
      }

      maxWorkoutByBand[band] = toNumber(maxRow?.workout);
    }

    // ------------------------------
    // ⭐ reading_attempts → per-kid metrics (one query for all kids)
    //
    // Each stage of a passage (fluency, comprehension, vocabulary) writes its
    // own row. A passage is finished when the vocabulary stage has run, which
    // is the only row where BOTH fluency_passed and comprehension_passed are
    // true. Assessment rows (attempt_type = 'assessment') are excluded.
    // ------------------------------
    const kidIds: string[] = (progressData ?? []).map(
      (k: ParentKidProgress) => k.kid_id
    );

    const attemptsByKid: Record<string, CompletedAttempt[]> = {};
    const workoutByKid: Record<string, number | null> = {};

    if (kidIds.length > 0) {
      const { data: attemptRows, error: attemptsError } = await supabase
        .from("reading_attempts")
        .select(
          "kid_id, created_at, comprehension_score, vocabulary_score, metrics"
        )
        .in("kid_id", kidIds)
        .eq("attempt_type", "existing")
        .eq("fluency_passed", true)
        .eq("comprehension_passed", true)
        .order("created_at", { ascending: true });

      if (attemptsError) {
        console.error("❌ reading_attempts query failed:", attemptsError);
      }

      console.log("[PROGRESS REPORT] completed attempts loaded:", {
        kids: kidIds.length,
        rows: attemptRows?.length ?? 0,
      });

      for (const row of attemptRows ?? []) {
        const m = (row.metrics ?? {}) as Record<string, unknown>;
        (attemptsByKid[row.kid_id] ??= []).push({
          createdAt: new Date(row.created_at),
          wpm: toNumber(m.wpm),
          accuracy: toNumber(m.accuracy),
          errors: toNumber(m.errors),
          comprehension: toNumber(row.comprehension_score) ?? 0,
          vocabulary: toNumber(row.vocabulary_score) ?? 0,
        });
      }

      // Current workout per kid (for "Next Workout")
      const { data: workoutRows, error: workoutError } = await supabase
        .from("progress")
        .select("kid_id, workout")
        .in("kid_id", kidIds);

      if (workoutError) {
        console.error("❌ progress workout query failed:", workoutError);
      }

      for (const row of workoutRows ?? []) {
        workoutByKid[row.kid_id] = toNumber(row.workout);
      }
    }

    const now = new Date();

    // =========================================================
    // SECTION 6 — Render
    // =========================================================
    return (
      <div
        style={{
          backgroundImage: "url('/DiverseKids.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
          }}
        >
          <FormContainer>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
                padding: "40px",
                width: "85%",
                maxWidth: "800px",
                margin: "0 auto",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "25px",
                }}
              >
                Reading Progress Report
              </h1>

              {(!progressData || progressData.length === 0) && (
                <p style={{ color: "black", fontSize: "1.1rem" }}>
                  No progress records found.
                </p>
              )}

              {/* ========================================================= */}
              {/* SECTION 7 — Kid Progress Cards */}
              {/* ========================================================= */}
              {progressData?.map((kid: ParentKidProgress) => {
                // ⭐ Progress by workout: current workout vs largest workout in the band
                const workout = workoutByKid[kid.kid_id];
                const { percent } = workoutProgress(
                  workout,
                  maxWorkoutByBand[kid.band]
                );

                // ⭐ Metrics from reading_attempts
                const metrics = computeKidMetrics(
                  attemptsByKid[kid.kid_id] ?? [],
                  now
                );

                return (
                  <div
                    key={kid.kid_id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "10px",
                      padding: "20px",
                      marginBottom: "20px",
                      textAlign: "left",
                      color: "black",
                      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    }}
                  >
                    <p><strong>Name:</strong> {kid.kid_name}</p>
                    <p><strong>Band:</strong> {kid.band}</p>
                    <p><strong>Fitness Score:</strong> {metrics.fitnessScore}</p>
                    <p><strong>Daily Workout Completion:</strong> {metrics.dailyCompletion}</p>
                    <p><strong>Weekly Progress:</strong> {metrics.weeklyProgress}</p>
                    <p><strong>Monthly Progress:</strong> {metrics.monthlyProgress}</p>
                    <p><strong>Speed Trend:</strong> {metrics.speedTrend}</p>
                    <p><strong>Accuracy Trend:</strong> {metrics.accuracyTrend}</p>
                    <p><strong>Error Pattern Trend:</strong> {metrics.errorTrend}</p>
                    <p><strong>Vocabulary Mastery Trend:</strong> {metrics.vocabularyTrend}</p>
                    <p><strong>Comprehension Mastery Trend:</strong> {metrics.comprehensionTrend}</p>
                    <p>
                      <strong>Next Workout:</strong>{" "}
                      {workout != null ? workout.toFixed(1) : "N/A"}
                    </p>
{/*                    <p><strong>Site:</strong> {kid.site_id}</p>
                    <p><strong>Passage Index:</strong> {kid.passage_index}</p>  */}

                    {/* Band-wide progress bar */}
                    <div
                      style={{
                        marginTop: "15px",
                        width: "100%",
                        height: "20px",
                        backgroundColor: "#ddd",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          backgroundColor: "#4A90E2",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    <p style={{ marginTop: "5px", fontWeight: "bold" }}>
                      {percent}% Complete
                    </p>
                  </div>
                );
              })}
            </div>
          </FormContainer>
        </div>
      </div>
    );
  } catch (error) {
    // redirect() works by throwing; let Next.js handle those untouched
    unstable_rethrow(error);

    await logError("SSR: app/parent/progress", error);
    throw error;
  }
}
