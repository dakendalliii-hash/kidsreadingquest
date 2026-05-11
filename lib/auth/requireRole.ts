import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";

export async function requireRole(requiredRole: "admin" | "parent" | "kid") {
  const user = await getUser();

  if (!user) redirect("/login");

  const role = user.user_metadata?.role;

  if (role !== requiredRole) redirect("/");

  return user;
}
