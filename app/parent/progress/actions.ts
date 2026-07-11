"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * updateReadingStatusAction
 *
 * Updates the reading status for a kid in the `progress` table
 * using the RPC: update_kid_reading_status
 *
 * After updating, it revalidates the parent progress page
 * so the SSR page reflects the latest data.
 */
export async function updateReadingStatusAction(formData: FormData) {
  const kidId = formData.get("kidId") as string;
  const newStatus = formData.get("newStatus") as string;

  const supabase = await createServerSupabaseClient();

  // Update via RPC
  const { error } = await supabase.rpc("update_kid_reading_status", {
    p_kid_id: kidId,
    p_status: newStatus,
  });

  if (error) {
    console.error("❌ RPC update_kid_reading_status failed:", error);
    throw new Error("Failed to update reading status.");
  }

  // Revalidate parent progress page
  revalidatePath("/parent/progress");
}
