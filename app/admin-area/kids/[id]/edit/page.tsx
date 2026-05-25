import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminKidEditPage({
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
    .select("id, name, reading_level, age, parent_id, created_at")
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

  // 5️⃣ Server Action: Update Kid (RPC)
  async function updateKid(formData: FormData) {
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

    // Extract form data
    const name = formData.get("name") as string;
    const readingLevel = formData.get("reading_level") as string;
    const age = formData.get("age") as string;

    // RPC update
    await supabase.rpc("update_kid", {
      kid_id: params.id,
      new_name: name,
      new_reading_level: readingLevel || null,
      new_age: age ? Number(age) : null,
    });

    revalidatePath(`/admin-area/kids/${params.id}`);
    redirect(`/admin-area/kids/${params.id}`);
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Edit Kid (Admin)
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-slate-300 text-sm">
          <strong>Parent:</strong> {parentEmail}
        </p>

        <form action={updateKid} className="space-y-5">
          <div>
            <label className="block mb-1 text-slate-300">Kid Name</label>
            <input
              type="text"
              name="name"
              defaultValue={kid.name}
              required
              className="p-2 bg-slate-800 border border-slate-700 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">Reading Level</label>
            <input
              type="text"
              name="reading_level"
              defaultValue={kid.reading_level || ""}
              className="p-2 bg-slate-800 border border-slate-700 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">Age</label>
            <input
              type="number"
              name="age"
              defaultValue={kid.age || ""}
              className="p-2 bg-slate-800 border border-slate-700 rounded"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
          >
            Save Changes
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href={`/admin/kids/${kid.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Back to Kid Details
          </a>
        </div>
      </div>
    </main>
  );
}
