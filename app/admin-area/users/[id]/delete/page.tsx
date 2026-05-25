import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUserDeletePage({
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

  // 4️⃣ Load role
  const { data: userRole } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", params.id)
    .single();

  const role = userRole?.role || "No role assigned";

  // 5️⃣ Server Action: RPC Delete
  async function deleteUserRPC() {
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

    // RPC delete
    await supabase.rpc("delete_user_admin", {
      target_user_id: params.id,
    });

    revalidatePath("/admin-area/users");
    redirect("/admin-area/users");
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
        Delete User (Admin)
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-xl font-semibold text-slate-100 text-center">
          {u.email || "No Email"}
        </p>

        <p className="text-slate-400 text-center">
          User ID: <span className="text-slate-200">{u.id}</span>
        </p>

        <p className="text-slate-400 text-center">
          Role: <span className="text-slate-200">{role}</span>
        </p>

        <p className="text-red-300 font-semibold text-center mt-4">
          This action cannot be undone.
        </p>

        <form action={deleteUserRPC} className="text-center mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white font-semibold"
          >
            Confirm Delete
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href={`/admin/users/${u.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancel and Go Back
          </a>
        </div>
      </div>
    </main>
  );
}
