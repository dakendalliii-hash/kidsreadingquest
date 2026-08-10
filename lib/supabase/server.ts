// kidsreadingquest/lib/supabase/server.ts

export const runtime = "nodejs";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies(); // must await

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  console.log("SUPABASE SERVER ENV", {
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY_PRESENT: !!anon,
  });

  return createServerClient(url!, anon!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // ignore write errors in RSC
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch {
          // ignore write errors in RSC
        }
      },
    },
  });
}
