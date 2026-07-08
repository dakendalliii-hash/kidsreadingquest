export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/login");

  const { data: roleRecord } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();

  const role = roleRecord?.role;

  if (role !== "parent") redirect("/unauthorized");

  // ⭐ Git version: NO background, NO header, NO spacing — just children
  return <div>{children}</div>;
}
