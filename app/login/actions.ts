"use server";

import { createSSRClient } from "@/lib/auth/createSSRClient";

export async function loginAction(formData: FormData) {
  const supabase = await createSSRClient(); // ✅ must await

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
}
