import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminParentListPage() {
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

  // 3️⃣ Load all parents
  const { data: parents } = await supabase
    .from("parents")
    .select("id, auth_id, created_at")
    .order("created_at", { ascending: false });

  // 4️⃣ Fetch parent emails
  const parentEmails: Record<string, string> = {};

  if (parents && parents.length > 0) {
    for (const p of parents) {
      if (p.auth_id) {
        const { data: parentUser } = await supabase.auth.admin.getUserById(
          p.auth_id
        );
        parentEmails[p.id] = parentUser?.user?.email || "Unknown";
      }
    }
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-900">All Parents</h1>
      </div>

      {(!parents || parents.length === 0) && (
        <p className="text-slate-400 mt-10 text-center italic">
          No parents found in the system.
        </p>
      )}

      {parents && parents.length > 0 && (
        <div className="space-y-4">
          {parents.map((parent) => (
            <a
              key={parent.id}
              href={`/admin/parents/${parent.id}`}
              className="block p-4 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
            >
              <p className="text-xl font-semibold text-slate-100">
                {parentEmails[parent.id] || "Unknown Email"}
              </p>

              <p className="text-slate-400 text-sm">
                Parent ID: {parent.id}
              </p>

              <p className="text-slate-500 text-xs mt-1">
                Joined: {new Date(parent.created_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
