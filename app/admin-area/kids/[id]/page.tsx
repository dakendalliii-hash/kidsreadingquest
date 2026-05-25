import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminKidDetailPage({
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

  // 3️⃣ Load kid
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name, reading_level, age, created_at, parent_id")
    .eq("id", params.id)
    .single();

  if (!kid) redirect("/admin-area/kids");

  // 4️⃣ Load parent info
  const { data: parent } = await supabase
    .from("parents")
    .select("id, auth_id")
    .eq("id", kid.parent_id)
    .single();

  let parentEmail = "Unknown";

  if (parent?.auth_id) {
    const { data: parentUser } = await supabase.auth.admin.getUserById(
      parent.auth_id
    );
    parentEmail = parentUser?.user?.email || "Unknown";
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Kid Details
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
        <p className="text-xl font-semibold text-slate-100">{kid.name}</p>

        <p className="text-slate-400">
          <strong className="text-slate-300">Reading Level:</strong>{" "}
          {kid.reading_level || "Not set"}
        </p>

        <p className="text-slate-400">
          <strong className="text-slate-300">Age:</strong>{" "}
          {kid.age || "Unknown"}
        </p>

        <p className="text-slate-400">
          <strong className="text-slate-300">Parent Email:</strong>{" "}
          {parentEmail}
        </p>

        <p className="text-slate-500 text-sm">
          Added: {new Date(kid.created_at).toLocaleDateString()}
        </p>

        <div className="flex gap-4 mt-6">
          <a
            href={`/admin/kids/${kid.id}/edit`}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
          >
            Edit Kid
          </a>

          <a
            href={`/admin/kids/${kid.id}/delete`}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
          >
            Delete Kid
          </a>
        </div>
      </div>
    </main>
  );
}
