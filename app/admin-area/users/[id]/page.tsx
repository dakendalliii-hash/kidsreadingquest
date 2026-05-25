import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
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

  const role = userRole?.role || "No role assigned";

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        User Details
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-xl font-semibold text-slate-100">
          {u.email || "No Email"}
        </p>

        <p className="text-slate-400 text-sm">
          User ID: {u.id}
        </p>

        <p className="text-slate-400 text-sm">
          Role: <span className="text-slate-200">{role}</span>
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

        <div className="space-y-3 mt-6">
          <a
            href="/admin/users"
            className="block text-slate-400 hover:text-slate-200 text-sm"
          >
            Back to User List
          </a>

          <a
            href={`/admin/users/${u.id}/edit`}
            className="block text-sky-400 hover:text-sky-300 text-sm"
          >
            Edit Role
          </a>

          <a
            href={`/admin/users/${u.id}/delete`}
            className="block text-red-400 hover:text-red-300 text-sm"
          >
            Delete User
          </a>
        </div>
      </div>
    </main>
  );
}
