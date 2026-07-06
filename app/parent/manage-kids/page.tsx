export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ManageKidsClient from "./ManageKidsClient";

// =========================================================
// SERVER ACTIONS
// =========================================================

// ------------------------------
// ADD KID
// ------------------------------
async function addKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const name = formData.get("name") as string;
  const level = formData.get("level") as string;
  const age = formData.get("age") as string;
  const parentId = formData.get("parentId") as string;

  // Insert kid record
  const { data: kidInsert, error: kidError } = await supabase
    .from("kids")
    .insert({
      name,
      reading_level: level,
      age: age ? Number(age) : null,
      parent_id: parentId,
    })
    .select("id")
    .single();

  if (kidError || !kidInsert) {
    console.error("❌ Failed to insert kid:", kidError);
    throw new Error("Failed to add kid.");
  }

  // Initialize progress record
  const kidId = kidInsert.id;
  const { error: progressError } = await supabase
    .from("progress")
    .insert({
      kid_id: kidId,
      status: "not started",
      band: level,
    });

  if (progressError) {
    console.error("❌ Failed to insert progress:", progressError);
  }

  revalidatePath("/parent/manage-kids");
}

// ------------------------------
// UPDATE KID
// ------------------------------
async function updateKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const kidId = formData.get("kidId") as string;
  const name = formData.get("name") as string;
  const level = formData.get("level") as string;
  const age = formData.get("age") as string;

  // Update name + age
  const { error: kidError } = await supabase
    .from("kids")
    .update({
      name,
      age: age ? Number(age) : null,
    })
    .eq("id", kidId);

  if (kidError) {
    console.error("❌ Failed to update kid:", kidError);
    throw new Error("Failed to update kid.");
  }

// Update band + progress via RPC
const { error: rpcError } = await supabase.rpc("update_kid_band", {
  p_kid_id: kidId,
  p_band: level,
});


  if (rpcError) {
    console.error("❌ RPC update_kid_band failed:", rpcError);
    throw new Error("Failed to update progress.");
  }

  revalidatePath("/parent/manage-kids");
}

// ------------------------------
// DELETE KID
// ------------------------------
async function deleteKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const kidId = formData.get("kidId") as string;

  await supabase.from("progress").delete().eq("kid_id", kidId);
  await supabase.from("kids").delete().eq("id", kidId);

  revalidatePath("/parent/manage-kids");
}

// =========================================================
// SSR PAGE
// =========================================================

export default async function ManageKidsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  const { data: kids } = await supabase
    .from("kids")
    .select("*")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

  return (
    <ManageKidsClient
      kids={kids || []}
      parentId={parentRecord.id}
      addKid={addKid}
      deleteKid={deleteKid}
      updateKid={updateKid}
    />
  );
}
