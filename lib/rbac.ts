// lib/rbac.ts
import { createSSRClient } from "@/lib/auth/createSSRClient";

/**
 * Checks if the current user is an admin.
 * Returns { allowed, user } for SSR gating.
 */
export async function requireAdmin() {
  const supabase = await createSSRClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { allowed: false, user: null };
  }

  // Query the roles table for this user
  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
//
console.log("RBAC check:", { userId: user.id, roleRow });
//

  if (roleError || !roleRow) {
    return { allowed: false, user };
  }

  // Validate against role_codes table
  const { data: roleCode } = await supabase
    .from("role_codes")
    .select("code")
    .eq("code", roleRow.role)
    .single();

  const isAdmin = roleRow.role === "admin" && !!roleCode;

  return { allowed: isAdmin, user };
}

/**
 * Retrieves all valid role codes from the role_codes table.
 */
export async function getAllRoleCodes() {
  const supabase = await createSSRClient();
  const { data, error } = await supabase.from("role_codes").select("code, label");

  if (error) throw new Error(`Failed to fetch role codes: ${error.message}`);
  return data ?? [];
}

/**
 * Updates a user's role in the roles table.
 */
export async function setUserRole(userId: string, newRole: string) {
  const supabase = await createSSRClient();

  const { error } = await supabase
    .from("roles")
    .update({ role: newRole })
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to update role: ${error.message}`);
  return { success: true };
}
