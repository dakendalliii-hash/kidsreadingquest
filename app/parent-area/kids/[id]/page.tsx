import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function KidDetailPage({
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

  // 2️⃣ Parent RBAC check
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // 3️⃣ Kid ownership check
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name, reading_level, age, created_at, parent_id")
    .eq("id", params.id)
    .single();

  if (!kid || kid.parent_id !== parentRecord.id) {
    redirect("/not-authorized");
  }

  // 4️⃣ Server Action: Update Kid (RPC)
  async function updateKid(formData: FormData) {
    "use server";

    const supabase = await createSSRClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Parent check
    const { data: parentRecord } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!parentRecord) redirect("/not-authorized");

    // Kid ownership check
    const { data: kid } = await supabase
      .from("kids")
      .select("id, parent_id")
      .eq("id", params.id)
      .single();

    if (!kid || kid.parent_id !== parentRecord.id) {
      redirect("/not-authorized");
    }

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

    revalidatePath(`/parent/kids/${params.id}`);
    redirect("/parent/kids");
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

    // Parent check
    const { data: parentRecord } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!parentRecord) redirect("/not-authorized");

    // Kid ownership check
    const { data: kid } = await supabase
      .from("kids")
      .select("id, parent_id")
      .eq("id", params.id)
      .single();

    if (!kid || kid.parent_id !== parentRecord.id) {
      redirect("/not-authorized");
    }

    // RPC delete
    await supabase.rpc("delete_kid", {
      kid_id: params.id,
    });

    revalidatePath("/parent/kids");
    redirect("/parent/kids");
  }

  // 6️⃣ Render page
  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-sky-900 text-center">
        Edit Kid
      </h1>

      <form
        action={updateKid}
        className="space-y-6 max-w-md mx-auto bg-slate-900 p-6 rounded-xl border border-slate-700"
      >
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

      <div className="max-w-md mx-auto mt-10 p-6 bg-red-900/40 border border-red-700 rounded-xl">
        <p className="text-red-300 font-semibold mb-4 text-center">
          All history related to your child on the system will be deleted!
        </p>

        <form action={deleteKid}>
          <button
            type="submit"
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
          >
            Delete Kid
          </button>
        </form>
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Added on {new Date(kid.created_at).toLocaleDateString()}
      </p>
    </main>
  );
}
