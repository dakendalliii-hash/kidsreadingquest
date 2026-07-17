"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function handleSignUp(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("❌ Signup failed:", error);
    throw new Error("Signup failed.");
  }

  redirect("/login");
}
