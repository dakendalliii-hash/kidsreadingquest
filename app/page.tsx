import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function HomePage() {
  // Next.js 16.2.6: cookies() returns an async iterable, not a Map
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = (await cookieStore).get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: any) {
          // SSR cannot set cookies; no-op
        },
        async remove(name: string, options: any) {
          // SSR cannot remove cookies; no-op
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return (
      <div style={{ padding: "40px" }}>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1></h1>
    </div>
  );
}
