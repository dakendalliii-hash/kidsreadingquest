"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateReadingStatusAction(formData: FormData) {
  const kidId = formData.get("kidId") as string;
  const newStatus = formData.get("newStatus") as string;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.rpc("update_kid_reading_status", {
    p_kid_id: kidId,
    p_status: newStatus,
  });

  if (error) {
    console.error("❌ RPC update_kid_reading_status failed:", error);
    throw new Error("Failed to update reading status.");
  }

  revalidatePath("/parent/progress");
}
