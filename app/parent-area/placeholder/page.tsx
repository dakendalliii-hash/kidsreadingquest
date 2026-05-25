// THIS FILE MUST BE A SERVER COMPONENT
import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // ensures server execution

export default async function ParentPlaceholderPage() {
  const supabase = await createSSRClient();

  // 1️⃣ Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2️⃣ Verify this user is a parent (RBAC check)
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // 3️⃣ Render placeholder content
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-sky-900">Parent Area</h1>

      <p className="mt-4 text-lg text-sky-800">
        This section is under construction.
      </p>

      <p className="mt-2 text-gray-700">
        You are logged in as: <strong>{user.email}</strong>
      </p>
    </main>
  );
}
