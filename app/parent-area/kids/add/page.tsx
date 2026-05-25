// app/parent/kids/add/page.tsx
import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";
import AddKidForm from "./AddKidForm";

export default async function AddKidPage() {
  const supabase = await createSSRClient();

  // 1. Auth check
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Fetch parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  // 3. Pass parentId to client component (guaranteed non-null)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-sky-900 mb-6">Add Kid</h1>
      <AddKidForm parentId={parentRecord.id} />
    </div>
  );
}
