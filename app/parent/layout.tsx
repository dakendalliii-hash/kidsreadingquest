export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import NavBarWrapper from "@/components/NavBarWrapper";
import { logError } from "@/lib/logging/logError";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createServerSupabaseClient();

    // ⭐ FIX: use getSession() instead of getUser()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // ⭐ FIX: check session instead of user
    if (error || !session) redirect("/login");

    const { data: roleRecord } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleRecord?.role !== "parent") redirect("/unauthorized");

    return (
      <div>
        {/* ⭐ NavBarWrapper handles auth; NavBar handles Back button */}
        {children}
      </div>
    );
  } catch (error) {
    await logError("SSR: app/parent/layout", error);
    throw error;
  }
}
