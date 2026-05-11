import NavBar from "@/app/components/NavBar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function PublicDashboardLayout({ children }: LayoutProps) {
  return (
    <div>
      <NavBar />
      <main className="p-6">{children}</main>
    </div>
  );
}
