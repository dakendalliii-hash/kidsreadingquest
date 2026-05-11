import { createClient } from "@/lib/supabase/server";
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
