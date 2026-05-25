import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminKidDeletePage({
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

  // 5️⃣ Server Action: Delete Kid (RPC)
  async function deleteKid() {
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

    // RPC delete
    await supabase.rpc("delete_kid", {
      kid_id: params.id,
    });

    revalidatePath("/admin-area/kids");
    redirect("/admin-area/kids");
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
        Delete Kid (Admin)
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-xl font-semibold text-slate-100 text-center">
          {kid.name}
        </p>

        <p className="text-slate-400 text-center">
          Parent: <span className="text-slate-200">{parentEmail}</span>
        </p>

        <p className="text-red-300 font-semibold text-center mt-4">
          This action cannot be undone.
        </p>

        <p className="text-slate-400 text-center">
          All history related to this child will be permanently deleted.
        </p>

        <form action={deleteKid} className="text-center mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white font-semibold"
          >
            Confirm Delete
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href={`/admin/kids/${kid.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancel and Go Back
          </a>
        </div>
      </div>
    </main>
  );
}
