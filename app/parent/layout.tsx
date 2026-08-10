export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import NavBarWrapper from "@/components/NavBarWrapper";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: roleRecord } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "parent") redirect("/unauthorized");

  return (
    <div>
      {/* ⭐ NavBarWrapper handles auth; NavBar handles Back button */}

      {children}
    </div>
  );
}
