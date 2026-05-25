import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUserEditPage({
  params,
}: {
  params: { id: string };
}) {
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

  // 3️⃣ Load target user
  const { data: targetUser } = await supabase.auth.admin.getUserById(
    params.id
  );

  if (!targetUser?.user) redirect("/admin-area/users");

  const u = targetUser.user;

  // 4️⃣ Load role from roles table
  const { data: userRole } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", params.id)
    .single();

  const currentRole = userRole?.role || "";

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

    const newRole = formData.get("role") as string;

    await supabase.from("roles").upsert(
      {
        user_id: params.id,
        role: newRole,
      },
      { onConflict: "user_id" }
    );

    revalidatePath(`/admin-area/users/${params.id}`);
    redirect(`/admin-area/users/${params.id}`);
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Edit User Role
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-xl font-semibold text-slate-100">
          {u.email || "No Email"}
        </p>

        <p className="text-slate-400 text-sm">
          User ID: {u.id}
        </p>

        <p className="text-slate-500 text-sm">
          Created:{" "}
          {u.created_at
            ? new Date(u.created_at).toLocaleString()
            : "Unknown"}
        </p>

        <p className="text-slate-500 text-sm">
          Last Sign-In:{" "}
          {u.last_sign_in_at
            ? new Date(u.last_sign_in_at).toLocaleString()
            : "Never"}
        </p>

        <form action={updateRole} className="space-y-5 mt-4">
          <div>
            <label className="block mb-1 text-slate-300">Role</label>
            <select
              name="role"
              defaultValue={currentRole}
              className="p-2 bg-slate-800 border border-slate-700 rounded"
            >
              <option value="">No Role Assigned</option>
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>
              <option value="kid">Kid</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
          >
            Save Changes
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href={`/admin/users/${u.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Back to User Details
          </a>
        </div>
      </div>
    </main>
  );
}
