// app/components/Sidebar.tsx
"use client";

import ResponsiveSidebar from "./ResponsiveSidebar";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User | null;
  role: string | null;
}

export default function Sidebar({ user, role }: SidebarProps) {
  return <ResponsiveSidebar user={user} role={role} />;
}
