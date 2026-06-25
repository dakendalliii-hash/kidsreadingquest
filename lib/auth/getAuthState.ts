// kidsreadingquest/lib/auth/getAuthState.ts
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthState() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  return {
    isLoggedIn: !!data.user,
  };
}
