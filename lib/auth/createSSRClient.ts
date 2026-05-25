// lib/auth/createSSRClient.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for SSR compatible with Next.js 16.2.6 (Turbopack).
 * Uses the new async cookies() API.
 */
export async function createSSRClient() {
  // ✅ cookies() must be awaited
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookies();
          const cookie = store.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const store = await cookies();
            if ("set" in store) {
              (store as any).set({ name, value, ...options });
            }
          } catch {
            // Ignore write errors during SSR
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const store = await cookies();
            if ("delete" in store) {
              (store as any).delete({ name, ...options });
            }
          } catch {
            // Ignore delete errors during SSR
          }
        },
      },
    }
  );
}
