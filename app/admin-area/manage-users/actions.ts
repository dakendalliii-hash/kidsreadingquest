"use server";

import { setUserRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  await setUserRole(userId, newRole);
  revalidatePath("/admin-area/manage-users");
}
