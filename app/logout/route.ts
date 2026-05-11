import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Clear Supabase auth cookies
  await supabase.auth.signOut();

  redirect("/login");
}
