import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUserDashboardPage() {
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

  if (roleRecord?.role !== "admin") redirect("/not-authorized");

  // 3️⃣ Load counts for dashboard metrics
  const { data: roles } = await supabase.from("roles").select("role");

  const totalAdmins = roles?.filter((r) => r.role === "admin").length || 0;
  const totalParents = roles?.filter((r) => r.role === "parent").length || 0;
  const totalKids = roles?.filter((r) => r.role === "kid").length || 0;

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-8 text-center">
        User Management Dashboard
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-sky-400">{totalAdmins}</p>
          <p className="text-slate-300 mt-2">Admins</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-green-400">{totalParents}</p>
          <p className="text-slate-300 mt-2">Parents</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-yellow-400">{totalKids}</p>
          <p className="text-slate-300 mt-2">Kids</p>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <a
          href="/admin/users"
          className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
        >
          <h2 className="text-xl font-semibold text-slate-100">All Users</h2>
          <p className="text-slate-400 text-sm mt-2">
            View all Supabase auth users and their roles.
          </p>
        </a>

        <a
          href="/admin/users/roles"
          className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
        >
          <h2 className="text-xl font-semibold text-slate-100">Role Manager</h2>
          <p className="text-slate-400 text-sm mt-2">
            Assign or update user roles.
          </p>
        </a>

        <a
          href="/admin/parents"
          className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
        >
          <h2 className="text-xl font-semibold text-slate-100">Parents</h2>
          <p className="text-slate-400 text-sm mt-2">
            View, edit, or delete parent accounts.
          </p>
        </a>

        <a
          href="/admin/kids"
          className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
        >
          <h2 className="text-xl font-semibold text-slate-100">Kids</h2>
          <p className="text-slate-400 text-sm mt-2">
            Manage all kids in the system.
          </p>
        </a>
      </div>

      <div className="text-center mt-10">
        <a
          href="/admin"
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Back to Admin Dashboard
        </a>
      </div>
    </main>
  );
}
