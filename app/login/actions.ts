"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const cookieStore = await cookies();

  const attempts = Number(cookieStore.get("login_attempts")?.value || "0");
  const cooldown = Number(cookieStore.get("login_cooldown")?.value || "0");
  const now = Date.now();

  // COOLDOWN CHECK
  if (cooldown && now < cooldown) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Let's try again together!"
      )}&attempts=${attempts}`
    );
  }

  // AUTHENTICATE
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const newAttempts = attempts + 1;

    cookieStore.set("login_attempts", String(newAttempts), {
      path: "/",
      maxAge: 3600,
    });

    if (newAttempts >= 5) {
      const cooldownUntil = now + 10 * 60 * 1000;
      cookieStore.set("login_cooldown", String(cooldownUntil), {
        path: "/",
        maxAge: 10 * 60,
      });

      redirect(
        `/login?error=${encodeURIComponent(
          "Let's try again together!"
        )}&attempts=${newAttempts}`
      );
    }

    redirect(
      `/login?error=${encodeURIComponent(
        "Invalid Password!"
      )}&attempts=${newAttempts}`
    );
  }

  // RESET COOKIES ON SUCCESS
  cookieStore.set("login_attempts", "0", { path: "/", maxAge: 3600 });
  cookieStore.set("login_cooldown", "0", { path: "/", maxAge: 3600 });

  // FLOW LOGIC
  const signupFlow = cookieStore.get("signup_flow")?.value;

  // If this is a new user flow, force Add Kid first
  if (signupFlow === "new-user") {
    cookieStore.set("signup_flow", "", { path: "/", maxAge: 0 });
    redirect("/parent/add-kid");
  }

  // Otherwise, check if parent has kids
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) {
    redirect("/unauthorized");
  }

  const { data: kids } = await supabase
    .from("kids")
    .select("id")
    .eq("parent_id", parentRecord.id);

  if (!kids || kids.length === 0) {
    redirect("/parent/add-kid");
  }

  // FIX: Dashboard route is /parent, not /parent/dashboard
  redirect("/parent");
}
