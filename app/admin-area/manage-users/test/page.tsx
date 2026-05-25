import { createSSRClient } from "@/lib/auth/createSSRClient";
import { requireAdmin, getAllRoleCodes } from "@/lib/rbac";

export default async function AdminTestPage() {
  // 1. Check admin access
  const { allowed, user } = await requireAdmin();

  if (!allowed || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-8 border border-red-500 rounded-xl bg-slate-800 text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p>You are not authorized to view this page.</p>
        </div>
      </main>
    );
  }

  // 2. ✅ Await Supabase client
  const supabase = await createSSRClient();

  // 3. Fetch all users using Admin API (no .from())
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

  // 4. Fetch all role codes using your RBAC helper
  const roleCodesData = await getAllRoleCodes();

  // 5. Map role codes to string array for display
  const roleCodes = roleCodesData?.map((r: { code: string }) => r.code) ?? [];

  return (
    <main className="min-h-screen p-8 bg-slate-900 text-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Admin Test Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Authenticated User</h2>
        <pre className="bg-slate-800 p-4 rounded-lg border border-slate-700">
{JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Users (Admin API)</h2>
        {usersError && (
          <p className="text-red-400">Error fetching users: {usersError.message}</p>
        )}
        {!usersError && (
          <pre className="bg-slate-800 p-4 rounded-lg border border-slate-700">
{JSON.stringify(usersData?.users ?? [], null, 2)}
          </pre>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Role Codes (RBAC)</h2>
        <pre className="bg-slate-800 p-4 rounded-lg border border-slate-700">
{JSON.stringify(roleCodes, null, 2)}
        </pre>
      </div>
    </main>
  );
}
