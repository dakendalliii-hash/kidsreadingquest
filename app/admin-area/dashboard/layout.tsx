import { createClient } from "@/lib/supabase/server";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  return <>{children}</>;
}
