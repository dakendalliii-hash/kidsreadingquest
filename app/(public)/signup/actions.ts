"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function handleSignUp(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("❌ Signup failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
