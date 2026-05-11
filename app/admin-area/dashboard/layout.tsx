import NavBar from "@/app/components/NavBar";
import { ReactNode } from "react";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <div>
      <NavBar />
      <main className="p-6">{children}</main>
    </div>
  );
}
