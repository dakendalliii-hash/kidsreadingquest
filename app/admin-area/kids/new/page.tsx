import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminKidCreatePage() {
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

  // 3️⃣ Load all parents for dropdown
  const { data: parents } = await supabase
    .from("parents")
    .select("id, auth_id")
    .order("id", { ascending: true });

  // Fetch parent emails
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

  // 4️⃣ Server Action: Create Kid (Admin RPC)
  async function createKid(formData: FormData) {
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
    const parentId = formData.get("parent_id") as string;
    const name = formData.get("name") as string;
    const readingLevel = formData.get("reading_level") as string;
    const age = formData.get("age") as string;

    // RPC call
    const { data: newKidId, error } = await supabase.rpc(
      "create_kid_admin",
      {
        parent_id: parentId,
        kid_name: name,
        reading_level: readingLevel || null,
        kid_age: age ? Number(age) : null,
      }
    );

    if (error) {
      console.error("Admin create kid error:", error.message);
      redirect("/admin-area/kids/new");
    }

    revalidatePath("/admin-area/kids");
    redirect(`/admin-area/kids/${newKidId}`);
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Add Kid (Admin)
      </h1>

      <form
        action={createKid}
        className="space-y-6 max-w-xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-700"
      >
        <div>
          <label className="block mb-1 text-slate-300">Kid Name</label>
          <input
            type="text"
            name="name"
            required
            className="p-2 bg-slate-800 border border-slate-700 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">Reading Level</label>
          <input
            type="text"
            name="reading_level"
            className="p-2 bg-slate-800 border border-slate-700 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">Age</label>
          <input
            type="number"
            name="age"
            className="p-2 bg-slate-800 border border-slate-700 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">Assign to Parent</label>
          <select
            name="parent_id"
            required
            className="p-2 bg-slate-800 border border-slate-700 rounded"
          >
            <option value="">Select a parent</option>
            {parents?.map((p) => (
              <option key={p.id} value={p.id}>
                {parentEmails[p.id] || "Unknown Email"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
        >
          Create Kid
        </button>
      </form>

      <div className="text-center mt-6">
        <a
          href="/admin/kids"
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Back to Kids List
        </a>
      </div>
    </main>
  );
}
