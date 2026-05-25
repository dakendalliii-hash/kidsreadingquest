"use server";

import { redirect } from "next/navigation";
import { createSSRClient } from "@/lib/auth/createSSRClient";

export async function signup(formData: FormData) {
  const supabase = await createSSRClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleCode = formData.get("roleCode") as string;

  const { data: codeRow } = await supabase
    .from("role_codes")
    .select("role")
    .eq("code", roleCode)
    .single();

  if (!codeRow) {
    console.log("Invalid role code");
    return;
  }

  const { data: signupData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !signupData.user) {
    console.error("Signup error:", error?.message);
    return;
  }

  await supabase.from("roles").insert({
    user_id: signupData.user.id,
    role: codeRow.role,
  });

  return redirect("/login");
}
