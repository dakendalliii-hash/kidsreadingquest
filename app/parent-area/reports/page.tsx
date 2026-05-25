import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export default async function ParentReportsPage() {
  const supabase = await createSSRClient();

  // 1️⃣ Auth check
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2️⃣ Ensure user is a parent
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // 3️⃣ Run all four reports

  // Full Parent–Kid Relationship Report
  const { data: fullReport } = await supabase.rpc("run_full_parent_kid_report");

  // Kids with missing parents
  const { data: orphanKids } = await supabase.rpc("run_orphan_kid_report");

  // Parents with no kids
  const { data: parentsNoKids } = await supabase.rpc("run_parents_no_kids_report");

  // Parents missing auth users
  const { data: parentsMissingAuth } = await supabase.rpc("run_parents_missing_auth_report");

  return (
    <main className="min-h-screen p-8 text-slate-100 space-y-12">
      <h1 className="text-3xl font-bold text-center text-sky-900">
        Parent & Kid Relationship Reports
      </h1>

      {/* 1️⃣ Full Parent–Kid Relationship Report */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">
          Full Parent–Kid Relationship Report
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-slate-700 bg-slate-900">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-2 border border-slate-700">Kid Name</th>
                <th className="p-2 border border-slate-700">Parent Email</th>
                <th className="p-2 border border-slate-700">Parent Auth Email</th>
                <th className="p-2 border border-slate-700">Reading Level</th>
                <th className="p-2 border border-slate-700">Age</th>
              </tr>
            </thead>
            <tbody>
              {fullReport?.map((row: any) => (
                <tr key={row.kid_id}>
                  <td className="p-2 border border-slate-700">{row.kid_name}</td>
                  <td className="p-2 border border-slate-700">{row.parent_email}</td>
                  <td className="p-2 border border-slate-700">{row.parent_auth_email}</td>
                  <td className="p-2 border border-slate-700">{row.reading_level || "—"}</td>
                  <td className="p-2 border border-slate-700">{row.age || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2️⃣ Orphan Kids */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-500">
          Kids With Missing Parent Records (Orphans)
        </h2>

        {orphanKids?.length === 0 ? (
          <p className="text-slate-400">No orphaned kids found.</p>
        ) : (
          <ul className="space-y-2">
            {orphanKids.map((kid: any) => (
              <li
                key={kid.kid_id}
                className="p-3 bg-red-900/40 border border-red-700 rounded"
              >
                <strong>{kid.kid_name}</strong> — parent_id: {kid.parent_id}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3️⃣ Parents With No Kids */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
          Parents With No Kids
        </h2>

        {parentsNoKids?.length === 0 ? (
          <p className="text-slate-400">All parents have at least one kid.</p>
        ) : (
          <ul className="space-y-2">
            {parentsNoKids.map((p: any) => (
              <li
                key={p.parent_id}
                className="p-3 bg-yellow-900/40 border border-yellow-700 rounded"
              >
                {p.parent_email}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4️⃣ Parents Missing Auth Users */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-orange-500">
          Parents Missing Auth Users
        </h2>

        {parentsMissingAuth?.length === 0 ? (
          <p className="text-slate-400">All parents have valid auth accounts.</p>
        ) : (
          <ul className="space-y-2">
            {parentsMissingAuth.map((p: any) => (
              <li
                key={p.parent_id}
                className="p-3 bg-orange-900/40 border border-orange-700 rounded"
              >
                {p.parent_email} — missing auth_id: {p.auth_id}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
