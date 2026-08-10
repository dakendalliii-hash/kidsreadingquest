export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function KidLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: kidId } = await params;

  const supabase = await createServerSupabaseClient();

  // Validate session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  // Fetch role
  const { data: roleRecord } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = roleRecord?.role;

  // Parents can access all kids pages
  const allowAccess =
    role === "parent"
      ? true
      : role === "kid"
      ? await supabase
          .from("kids")
          .select("id")
          .eq("id", kidId)
          .eq("auth_id", user.id)
          .single()
          .then((res) => !!res.data)
      : false;

  if (!allowAccess) redirect("/unauthorized");

  // ⭐ Apply the SAME formatting as app/kids/layout.tsx
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
      {/* Soft dark overlay */}
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

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 1, color: "white" }}>
        {children}
      </div>
    </div>
  );
}
