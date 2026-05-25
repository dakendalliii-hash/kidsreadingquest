import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminParentKidsPage({
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

  // 3️⃣ Load parent record
  const { data: parent } = await supabase
    .from("parents")
    .select("id, auth_id, created_at")
    .eq("id", params.id)
    .single();

  if (!parent) redirect("/admin-area/parents");

  // 4️⃣ Load parent email
  let parentEmail = "Unknown";

  if (parent.auth_id) {
    const { data: parentUser } = await supabase.auth.admin.getUserById(
      parent.auth_id
    );
    parentEmail = parentUser?.user?.email || "Unknown";
  }

  // 5️⃣ Load kids belonging to this parent
  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, reading_level, age, created_at")
    .eq("parent_id", parent.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Kids for Parent
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4 mb-10">
        <p className="text-xl font-semibold text-slate-100">
          {parentEmail}
        </p>

        <p className="text-slate-400 text-sm">
          Parent ID: {parent.id}
        </p>

        <p className="text-slate-500 text-sm">
          Joined: {new Date(parent.created_at).toLocaleDateString()}
        </p>

        <div className="text-center mt-4">
          <a
            href={`/admin/parents/${parent.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Back to Parent Details
          </a>
        </div>
      </div>

      <section className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-sky-800 mb-4">
          Kids Belonging to This Parent
        </h2>

        {(!kids || kids.length === 0) && (
          <p className="text-slate-400 italic">
            This parent has not added any kids yet.
          </p>
        )}

        {kids && kids.length > 0 && (
          <ul className="space-y-4">
            {kids.map((kid) => (
              <a
                key={kid.id}
                href={`/admin/kids/${kid.id}`}
                className="block p-4 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
              >
                <p className="text-lg font-semibold text-slate-100">
                  {kid.name}
                </p>

                <p className="text-slate-400 text-sm">
                  Reading Level: {kid.reading_level || "Not set"}
                </p>

                <p className="text-slate-400 text-sm">
                  Age: {kid.age || "Unknown"}
                </p>

                <p className="text-slate-500 text-xs mt-1">
                  Added: {new Date(kid.created_at).toLocaleDateString()}
                </p>
              </a>
            ))}
          </ul>
        )}
      </section>

      <div className="text-center mt-10">
        <a
          href="/admin/parents"
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Back to Parent List
        </a>
      </div>
    </main>
  );
}
