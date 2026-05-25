// app/parent-area/dashboard/page.tsx
import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export default async function ParentDashboardPage() {
  const supabase = await createSSRClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, reading_level, age, created_at")
    .eq("parent_id", parentRecord.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 text-slate-900">
      <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>

      {kids?.length ? (
        <ul className="space-y-4">
          {kids.map((kid) => (
            <li
              key={kid.id}
              className="p-4 bg-white shadow rounded border border-slate-200"
            >
              <p className="font-semibold">{kid.name}</p>
              <p>Reading Level: {kid.reading_level}</p>
              <p>Age: {kid.age}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No kids found.</p>
      )}
    </main>
  );
}
