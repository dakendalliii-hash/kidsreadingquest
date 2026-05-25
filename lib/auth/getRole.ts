// lib/auth/getRole.ts
import { createClient } from "@supabase/supabase-js"; // if needed elsewhere

export async function getUserRole(supabase: any) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("auth.getUser error:", userError);
    return null;
  }

  if (!user) {
    console.error("No user found in getUserRole");
    return null;
  }

  const { data, error } = await supabase.rpc("get_role_by_identity", {
    p_user_id: user.id,      // ✅ must match function param
    p_email: user.email,     // ✅ must match function param
  });

//
console.log("SSR user:", user);
console.log("RPC error:", error);
console.log("RPC data:", data);
//

  if (error) {
    console.error("Role lookup error:", error);
    return null;
  }

  console.log("RPC role result:", user.id, user.email, data);

  return data as string | null;
}
