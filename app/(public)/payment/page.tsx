// kidsreadingquest/app/(public)/payment/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AuthCard from "@/components/AuthCard";
import PaymentClient from "./PaymentClient";

// =========================================================
// SERVER ACTION — UPDATE PLAN TYPE
// =========================================================
async function updatePlanType(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const plan = formData.get("plan") as string;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not authenticated.");

  const { error } = await supabase
    .from("parents")
    .update({ plan_type: plan })
    .eq("auth_id", user.id);

  if (error) {
    console.error("❌ Failed to update plan_type:", error);
    throw new Error("Failed to update plan.");
  }

  // ⭐ Matches your pattern: no redirect inside server action
  revalidatePath("/parent/manage-kids/add");
}

// =========================================================
// SSR PAGE
// =========================================================
export default async function PaymentPage() {
  const supabase = await createServerSupabaseClient();

  // 1️⃣ Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // 2️⃣ Count founder plan parents
  const { count, error } = await supabase
    .from("parents")
    .select("*", { count: "exact", head: true })
    .eq("plan_type", "founder");

  if (error) {
    console.error("❌ Failed to count founder parents:", error);
  }

  const founderFull = (count ?? 0) >= 50;

  return (
    <PaymentClient
      updatePlanType={updatePlanType}
      founderFull={founderFull}
    />
  );
}
