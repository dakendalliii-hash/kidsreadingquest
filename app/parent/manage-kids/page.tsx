export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ManageKidsClient from "./ManageKidsClient";

// =========================================================
// SERVER ACTIONS
// =========================================================

// ------------------------------
// ADD KID — RPC FUNCTION
// ------------------------------
async function addKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const name = formData.get("name") as string;
  const age = Number(formData.get("age"));
  const parentId = formData.get("parentId") as string;

  // Compute band from age
  let band = "";
  if (age >= 4 && age <= 5) band = "A 4-5";
  else if (age >= 6 && age <= 7) band = "B 6-7";
  else if (age >= 8 && age <= 9) band = "C 8-9";
  else throw new Error("Invalid age.");

  const { data, error } = await supabase.rpc("create_kid_parent_records", {
    p_parent_record_id: parentId,
    p_name: name,
    p_reading_level: band,
    p_age: age,
    p_email: `${crypto.randomUUID()}@kid.local`,
    p_password: crypto.randomUUID(),
  });

  if (error) {
    console.error("❌ RPC create_kid_parent_records failed:", error);
    throw new Error("Failed to add kid.");
  }

  const newKidId = data;

  // ⭐ NEW BEHAVIOR: Immediately redirect to assessment page
  redirect(`/kids/${newKidId}/assessment`);
}

// ------------------------------
// UPDATE KID — FUNCTION CALL
// ------------------------------
async function updateKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const kidId = formData.get("kidId") as string;
  const name = formData.get("name") as string;
  const level = formData.get("level") as string;

  // 1️⃣ Update name via FUNCTION
  const { error: updateError } = await supabase.rpc("update_kid_records", {
    p_kid_id: kidId,
    p_name: name,
  });

  if (updateError) {
    console.error("❌ RPC update_kid_records failed:", updateError);
    throw new Error("Failed to update kid.");
  }

  // 2️⃣ Update band + progress via existing RPC
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
// DELETE KID — still direct (allowed by your rules)
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
