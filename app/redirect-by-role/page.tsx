import { redirect } from "next/navigation";
import { createSSRClient } from "@/lib/auth/createSSRClient";

export default async function RedirectByRolePage() {
  const supabase = await createSSRClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return redirect("/login");

  const { data: roleRow } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();
//
console.log("ROLE ROW:", roleRow);
//
  if (!roleRow) return redirect("/unauthorized");

  if (roleRow.role === "admin") return redirect("/admin-area/dashboard");
  if (roleRow.role === "parent") return redirect("/parent-area/dashboard");
  if (roleRow.role === "kid") return redirect("/kid-area/dashboard");

  return redirect("/unauthorized");
}
