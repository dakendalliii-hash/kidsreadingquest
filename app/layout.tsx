export const runtime = "nodejs";

export const dynamic = "force-dynamic";

import "./globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import NavBarWrapper from "@/components/NavBarWrapper";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  let role: string | null = null;
  let landingPage = "/";

  if (user) {
    const { data: roleRow } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    role = roleRow?.role ?? null;

    landingPage =
      role === "admin"
        ? "/admin"
        : role === "parent"
        ? "/parent"
        : "/";
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>

<NavBarWrapper />

        <div
          style={{
            position: "relative",
            minHeight: "100vh",
            width: "100%",
            backgroundImage: "url('/DiverseKids.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 0,
            }}
          />

{/* GLOBAL WELCOME TEXT — anchored inside DiverseKids background */}
<div
  style={{
    position: "absolute",
    top: "20px", // nestles into the top-left corner of the graphic
    left: "30px",
    zIndex: 9999,
    color: "white",
    textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
    pointerEvents: "none",
  }}
>
  <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>
    Welcome to Kids Reading Quest
  </h1>

  {/* Only show this line on the login page */}
  {typeof window !== "undefined" &&
    window.location.pathname === "/login" && (
      <p style={{ margin: 0, fontSize: "1.2rem" }}>
        Please log in or sign up to continue.
      </p>
    )}
</div>

          <div style={{ position: "relative", zIndex: 1, color: "white" }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
