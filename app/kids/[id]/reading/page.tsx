// kidsreadingquest/app/kids/[id]/reading/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReadingClient from "./ReadingClient";

// =========================================================
// SSR PAGE — LOAD FIRST WORKOUT PASSAGE
// =========================================================
export default async function KidReadingPage({ params }: { params: { id: string } }) {
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

  // 3️⃣ Load kid
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name, age, band")
    .eq("id", params.id)
    .eq("parent_id", parentRecord.id)
    .single();

  if (!kid) redirect("/parent/manage-kids");

  // 4️⃣ Load first workout passage based on band
  const { data: workout } = await supabase
    .from("workouts")
    .select("passage_1")
    .eq("band", kid.band)
    .single();

  if (!workout) {
    throw new Error("Workout passage not found for band: " + kid.band);
  }

  return (
    <ReadingClient
      kidId={kid.id}
      kidName={kid.name}
      band={kid.band}
      passage={workout.passage_1}
    />
  );
}
