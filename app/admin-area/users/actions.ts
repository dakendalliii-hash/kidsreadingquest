"use server";

import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export async function updateUserRole(formData: FormData) {
  const supabase = await createSSRClient();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  // Delete old roles
  await supabase.rpc("delete_roles_for_user", { uid: userId });

  // Insert new role
  await supabase.rpc("insert_role", { uid: userId, role_code: role });

  redirect("/admin-area/users");
}
