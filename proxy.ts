import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log("🔍 Proxy triggered for:", pathname);

  // Public routes
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/unauthorized",
    "/post-logout",
    "/logout",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes — let layouts handle auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/parent/:path*",
    // ❌ Removed "/kids/:path*" — this was breaking page routing
  ],
};
