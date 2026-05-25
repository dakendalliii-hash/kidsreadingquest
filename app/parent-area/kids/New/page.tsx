import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function CreateKidPage() {
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

  // 3️⃣ Server Action: Create Kid (RPC)
  async function createKid(formData: FormData) {
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

    // Extract form data
    const name = formData.get("name") as string;
    const readingLevel = formData.get("reading_level") as string;
    const age = formData.get("age") as string;

    // RPC call
    const { data: newKidId, error } = await supabase.rpc("create_kid", {
      parent_id: parentRecord.id,
      kid_name: name,
      reading_level: readingLevel || null,
      kid_age: age ? Number(age) : null,
    });

    if (error) {
      console.error("Kid creation error:", error.message);
      redirect("/parent/kids/new");
    }

    revalidatePath("/parent/kids");
    redirect(`/parent/kids/${newKidId}`);
  }

  // 4️⃣ Render page
  return (
    <main className="min-h-screen p-8 text-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-sky-900 text-center">
        Add a New Kid
      </h1>

      <form
        action={createKid}
        className="space-y-6 max-w-md mx-auto bg-slate-900 p-6 rounded-xl border border-slate-700"
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

        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
        >
          Create Kid
        </button>
      </form>
    </main>
  );
}
