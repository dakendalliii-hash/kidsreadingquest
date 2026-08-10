export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const supabase = await createServerSupabaseClient();

  // 1️⃣ Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Callback: user not authenticated.", userError);
    redirect("/login");
  }

  console.log("Callback user context:", {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
  });

  // 2️⃣ Email confirmation check
  const emailConfirmed =
    (user as any).email_confirmed_at ?? (user as any).confirmed_at;

  if (!emailConfirmed) {
    console.error("Callback: email not confirmed yet.");
    redirect("/login");
  }

  // 3️⃣ Lookup parent record (created during signup RPC)
  const { data: parentRecord, error: parentLookupError } = await supabase
    .from("parents")
    .select("id, auth_id, email")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (parentLookupError) {
    console.error("Callback: parent lookup error:", parentLookupError);
  }

  if (!parentRecord) {
    console.error("Callback: parent record missing — signup RPC failed?");
    redirect("/error");
  }

  console.log("Callback parent record found:", parentRecord);

  // 4️⃣ Redirect to Add Kid
  console.log("Callback complete — redirecting to /parent/add-kid");
  redirect("/parent/add-kid");
}
