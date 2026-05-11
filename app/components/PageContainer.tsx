"use client"
import { supabase } from "@/lib/supabase/client";
export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="page-container">{children}</div>;
}
