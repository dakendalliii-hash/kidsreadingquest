// kidsreadingquest/app/program/workoutPreparing/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkoutPreparingClient from "./WorkoutPreparingClient";

// =========================================================
// SSR PAGE — NO DATABASE WRITES
// =========================================================
export default async function WorkoutPreparingPage() {
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
    .select("id, name")
    .eq("parent_id", parentRecord.id);

  if (!kids || kids.length === 0) {
    redirect("/parent/manage-kids/add");
  }

  const kid = kids[0];

  return (
    <WorkoutPreparingClient
      kidId={kid.id}
      kidName={kid.name}
    />
  );
}
