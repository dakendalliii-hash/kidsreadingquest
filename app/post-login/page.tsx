// app/post-login/page.tsx
import { createSSRClient } from "@/lib/auth/createSSRClient";
import { getUserRole } from "@/lib/auth/getRole";
import { redirect } from "next/navigation";

export default async function PostLoginRouterPage() {
  const supabase = await createSSRClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ✅ Pass the Supabase client into getUserRole
  const role = await getUserRole(supabase);

  if (!role) {
    console.log("No role found for user:", user.email);
    redirect("/unauthorized");
  }

  if (role === "admin") redirect("/admin-area/dashboard");
  if (role === "parent") redirect("/parent-area/dashboard");

  redirect("/unauthorized");
}
