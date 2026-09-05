export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function KidLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  // Validate session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

 // if (error || !user) redirect("/login");

  // ⭐ No kid lookup here — child pages handle validation
  // ⭐ No role lookup here — child pages handle validation

  return (
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

      <div style={{ position: "relative", zIndex: 1, color: "white" }}>
        {children}
      </div>
    </div>
  );
}
