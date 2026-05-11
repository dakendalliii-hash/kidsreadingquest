import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function redirectIfUnauthorized(requiredRole?: "admin" | "parent" | "kid") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login page
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;

  // If a role is required and doesn't match → home
  if (requiredRole && role !== requiredRole) redirect("/");

  return user;
}
