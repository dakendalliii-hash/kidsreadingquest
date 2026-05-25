// app/parent-area/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createSSRClient } from "@/lib/auth/createSSRClient";
import { getUserRole } from "@/lib/auth/getRole";
import Sidebar from "@/app/components/Sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata = {
  title: "Parent Area",
};

interface LayoutProps {
  children: ReactNode;
}

export default async function ParentLayout({ children }: LayoutProps) {
  const supabase = await createSSRClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SSR user:", user); // will now appear

  if (!user) redirect("/login");

  const role = await getUserRole(supabase);

  console.log("SSR role:", role); // will now appear

  if (role !== "parent") redirect("/unauthorized");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} role={role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
