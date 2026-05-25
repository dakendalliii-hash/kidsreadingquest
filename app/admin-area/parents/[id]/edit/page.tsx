import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminParentEditPage({
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

  // 3️⃣ Load parent
  const { data: parent } = await supabase
    .from("parents")
    .select("id, auth_id, created_at")
    .eq("id", params.id)
    .single();

  if (!parent) redirect("/admin-area/parents");

  // 4️⃣ Load current email (if any)
  let parentEmail = "Unknown";

  if (parent.auth_id) {
    const { data: parentUser } = await supabase.auth.admin.getUserById(
      parent.auth_id
    );
    parentEmail = parentUser?.user?.email || "Unknown";
  }

  // 5️⃣ Server Action: Update Parent (RPC)
  async function updateParent(formData: FormData) {
    "use server";

    const supabase = await createSSRClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: roleRecord } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleRecord?.role !== "admin") redirect("/unauthorized");

    const newAuthId = formData.get("auth_id") as string | null;

    await supabase.rpc("update_parent_admin", {
      parent_id: params.id,
      new_auth_id: newAuthId && newAuthId.length > 0 ? newAuthId : null,
    });

    revalidatePath(`/admin-area/parents/${params.id}`);
    redirect(`/admin-area/parents/${params.id}`);
  }

  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
        Edit Parent (Admin)
      </h1>

      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <p className="text-slate-300 text-sm">
          <strong>Parent ID:</strong> {parent.id}
        </p>
        <p className="text-slate-300 text-sm">
          <strong>Current Email:</strong> {parentEmail}
        </p>
        <p className="text-slate-500 text-sm">
          Joined: {new Date(parent.created_at).toLocaleDateString()}
        </p>

        <form action={updateParent} className="space-y-5 mt-4">
          <div>
            <label className="block mb-1 text-slate-300">
              Linked Auth User ID (auth_id)
            </label>
            <input
              type="text"
              name="auth_id"
              defaultValue={parent.auth_id || ""}
              className="p-2 bg-slate-800 border border-slate-700 rounded"
              placeholder="Paste Supabase auth user UUID or leave blank"
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
            href={`/admin/parents/${parent.id}`}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Back to Parent Details
          </a>
        </div>
      </div>
    </main>
  );
}
