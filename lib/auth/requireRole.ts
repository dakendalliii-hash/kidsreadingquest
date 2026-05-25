import { redirect } from "next/navigation";
import { createSSRClient } from "./createSSRClient";

export async function requireRole(requiredRole: "admin" | "parent" | "kid") {
  const supabase = await createSSRClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    console.log("No user found — redirecting to /login");
    return redirect("/login");
  }

  const { data: roleRow, error } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();
//
console.log("REQUIRE ROLE:", requiredRole, "FOUND:", roleRow?.role);
//

  if (error) {
    console.error("Role lookup error:", error.message);
    return redirect("/unauthorized");
  }

  if (!roleRow) {
    console.log("User has no role assigned — redirecting to /unauthorized");
    return redirect("/unauthorized");
  }

  if (roleRow.role !== requiredRole) {
    console.log(
      `Role mismatch — expected ${requiredRole}, got ${roleRow.role}`
    );
    return redirect("/unauthorized");
  }

  return userData.user;
}
