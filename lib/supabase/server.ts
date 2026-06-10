import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set(name, value, options);
          } catch {
            // ignore write errors in RSC
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).set(name, "", { ...options, maxAge: 0 });
          } catch {
            // ignore write errors in RSC
          }
        },
      },
    }
  );
}
