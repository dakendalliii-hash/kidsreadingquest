// kidsreadingquest/app/(public)/choose-path/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChoosePathClient from "./ChoosePathClient";
import { logError } from "@/lib/logging/logError";



// =========================================================
// SSR PAGE — NO DATABASE WRITES
// =========================================================
export default async function ChoosePathPage() {

try {

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

  // 3️⃣ Ensure at least one kid exists
  const { data: kids } = await supabase
    .from("kids")
    .select("id")
    .eq("parent_id", parentRecord.id);

  if (!kids || kids.length === 0) {
    redirect("/parent/manage-kids/add");
  }

  } catch (error) {
    await logError("SSR: app/(public)/choose-path", error);
    throw error;
  }

  return <ChoosePathClient />;
}
