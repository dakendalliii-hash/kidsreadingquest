import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
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

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-4xl font-bold text-sky-900 mb-10 text-center">
        Admin Dashboard
      </h1>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Welcome Box */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-xl text-slate-200">
            Welcome, <span className="font-semibold">{user.email}</span>
          </p>
          <p className="text-slate-400 text-sm mt-2">
            You have full administrative access.
          </p>
        </div>

        {/* Main Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/admin/users/dashboard"
            className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
          >
            <h2 className="text-xl font-semibold text-slate-100">
              User Management
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Manage all users, roles, and authentication.
            </p>
          </a>

          <a
            href="/admin/parents"
            className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
          >
            <h2 className="text-xl font-semibold text-slate-100">
              Parent Management
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              View, edit, or delete parent accounts.
            </p>
          </a>

          <a
            href="/admin/kids"
            className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
          >
            <h2 className="text-xl font-semibold text-slate-100">
              Kid Management
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Manage all kids in the system.
            </p>
          </a>

          <a
            href="/admin/settings"
            className="block bg-slate-900 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
          >
            <h2 className="text-xl font-semibold text-slate-100">
              System Settings
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Configure system‑wide admin settings.
            </p>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <a
            href="/"
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Return to Main Site
          </a>
        </div>
      </div>
    </main>
  );
}
