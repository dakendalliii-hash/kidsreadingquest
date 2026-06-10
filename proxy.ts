import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  console.log("🔍 Proxy triggered for:", pathname);

  const supabase = createServerSupabaseClient();

  // Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("❌ Supabase user error:", userError);
  }

  if (!user) {
    console.log("❌ No user found — redirecting to /unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Get role
  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = roleRow?.role;
  console.log("🧩 User:", user.id, "Role:", role);

  if (roleError) {
    console.log("❌ Role query error:", roleError);
  }

  // Admins can access everything
  if (role === "admin") {
    console.log("✅ Admin access granted");
    return NextResponse.next();
  }

  // Parents can access parent dashboard and kids pages
  if (role === "parent") {
    if (pathname.startsWith("/parent")) {
      console.log("✅ Parent access granted for parent dashboard");
      return NextResponse.next();
    }
    if (pathname.startsWith("/kids")) {
      console.log("✅ Parent access granted for kids pages");
      return NextResponse.next();
    }
  }

  // Kids can access their own pages (optional)
  if (role === "kid" && pathname.startsWith("/kids")) {
    console.log("✅ Kid access granted");
    return NextResponse.next();
  }

  // Default: unauthorized
  console.log("🚫 Unauthorized access — redirecting");
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/parent/:path*",
    "/kids/:path*",
  ],
};
