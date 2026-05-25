import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUserRoleManagerPage() {
  const supabase = await createSSRClient();

  // 1️⃣ Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2️⃣ Admin RBAC check
  const { data: roleRecord } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "admin") redirect("/unauthorized");

  // 3️⃣ Load all auth users
  const { data: usersList } = await supabase.auth.admin.listUsers();

  // 4️⃣ Load roles table
  const { data: roles } = await supabase.from("roles").select("user_id, role");

  const roleMap: Record<string, string> = {};
  roles?.forEach((r) => {
    roleMap[r.user_id] = r.role;
  });

  // 5️⃣ Server Action: Update Role
  async function updateRole(formData: FormData) {
    "use server";

    const supabase = await createSSRClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Admin check
    const { data: roleRecord } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleRecord?.role !== "admin") redirect("/unauthorized");

    const targetUserId = formData.get("user_id") as string;
    const newRole = formData.get("role") as string;

    // Upsert role
    await supabase.from("roles").upsert(
      {
        user_id: targetUserId,
        role: newRole,
      },
      { onConflict: "user_id" }
    );

    revalidatePath("/admin-area/users");
    redirect("/admin-area/users");
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        User Role Manager (Admin)
      </h1>

      <div className="space-y-6 max-w-3xl mx-auto">
        {usersList?.users?.map((u) => (
          <div
            key={u.id}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5"
          >
            <p className="text-lg font-semibold text-slate-100">
              {u.email || "No Email"}
            </p>

            <p className="text-slate-400 text-sm mb-3">
              User ID: {u.id}
            </p>

            <form action={updateRole} className="flex items-center gap-4">
              <input type="hidden" name="user_id" value={u.id} />

              <select
                name="role"
                defaultValue={roleMap[u.id] || ""}
                className="p-2 bg-slate-800 border border-slate-700 rounded"
              >
                <option value="">No Role Assigned</option>
                <option value="admin">Admin</option>
                <option value="parent">Parent</option>
                <option value="kid">Kid</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
              >
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
