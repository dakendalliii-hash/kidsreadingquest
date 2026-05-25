// app/admin-area/layout.tsx
import { createSSRClient } from "@/lib/auth/createSSRClient";
import { getUserRole } from "@/lib/auth/getRole";
import Sidebar from "@/app/components/Sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const supabase = await createSSRClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getUserRole(supabase);

  if (role !== "admin") redirect("/unauthorized");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} role={role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
