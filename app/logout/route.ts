import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// ---------------------------------------------------------
// Unified logout handler (used for both GET and POST)
// ---------------------------------------------------------
async function handleLogout(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/post-logout", req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Sign out on the server
  await supabase.auth.signOut();

  // Explicitly remove Supabase cookies
  res.cookies.delete("sb-access-token");
  res.cookies.delete("sb-refresh-token");

  return res;
}

// ---------------------------------------------------------
// Export GET and POST without redeclaration
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  return handleLogout(req);
}

export async function GET(req: NextRequest) {
  return handleLogout(req);
}
