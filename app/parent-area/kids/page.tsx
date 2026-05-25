import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ParentKidsListPage() {
  const supabase = await createSSRClient();

  // 1️⃣ Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2️⃣ Parent RBAC check
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // 3️⃣ Fetch kids belonging to this parent
  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, reading_level, age, created_at")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-900">Your Kids</h1>

        <a
          href="/parent/kids/new"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
        >
          Add Kid
        </a>
      </div>

      {(!kids || kids.length === 0) && (
        <p className="text-slate-400 mt-10 text-center italic">
          You haven’t added any kids yet.
        </p>
      )}

      {kids && kids.length > 0 && (
        <div className="space-y-4">
          {kids.map((kid) => (
            <a
              key={kid.id}
              href={`/parent/kids/${kid.id}`}
              className="block p-4 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
            >
              <p className="text-xl font-semibold text-slate-100">
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
        </div>
      )}
    </main>
  );
}
