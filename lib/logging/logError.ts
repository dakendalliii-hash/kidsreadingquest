"use client";

import { supabase } from "@/lib/supabase/client";

export async function logError(context: string, error: any) {
  try {
    await supabase.from("logs").insert({
      context,
      message: error?.message ?? String(error),
      stack: error?.stack ?? null,
    });
  } catch (loggingError) {
    console.error("Failed to log error:", loggingError);
  }
}
