// =========================================================
// FILE: app/parent/manage-kids/page.tsx
// PURPOSE: Server-side Manage Kids Page (SSR + Server Actions)
// =========================================================

import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import ManageKidsClient from "./ManageKidsClient";
import { revalidatePath } from "next/cache";

export default async function ManageKidsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch parent record
  const { data: parentRecord, error: parentError } = await supabase
    .from("parents")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (parentError || !parentRecord) {
    console.error("❌ Parent record not found:", parentError);
    redirect("/login");
  }

  // Fetch kids for this parent
  const { data: kids, error: kidsError } = await supabase
    .from("kids")
    .select("*")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

  if (kidsError) {
    console.error("❌ Failed to fetch kids:", kidsError);
  }

  // =========================================================
  // SERVER ACTION: ADD KID (must return string)
  // =========================================================
  async function addKid(formData: FormData): Promise<string> {
    "use server";

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const name = formData.get("name") as string;
    const age = Number(formData.get("age"));
    const parentId = formData.get("parentId") as string;

    // Compute band
    let band = "";
    if (age >= 4 && age <= 5) band = "A 4-5";
    else if (age >= 6 && age <= 7) band = "B 6-7";
    else if (age >= 8 && age <= 9) band = "C 8-9";

    const { data: newKidId, error } = await supabase.rpc(
      "create_kid_parent_records",
      {
        p_parent_record_id: parentId,
        p_name: name,
        p_reading_level: band,
        p_age: age,
      }
    );

    if (error) {
      console.error("❌ RPC create_kid_parent_records failed:", error);
      throw new Error("Failed to add kid.");
    }

    revalidatePath("/parent/manage-kids");

    // Return the new kid ID
    return newKidId;
  }

  // =========================================================
  // SERVER ACTION: DELETE KID
  // =========================================================
  async function deleteKid(formData: FormData): Promise<void> {
    "use server";

    const supabase = await createServerSupabaseClient();

    const kidId = formData.get("kidId") as string;

    const { error } = await supabase.from("kids").delete().eq("id", kidId);

    if (error) {
      console.error("❌ Failed to delete kid:", error);
      throw new Error("Failed to delete kid.");
    }

    revalidatePath("/parent/manage-kids");
  }

  // =========================================================
  // SERVER ACTION: UNIFIED UPDATE KID (Name + Band + Progress Reset)
  // =========================================================
  async function updateKid(formData: FormData): Promise<void> {
    "use server";

    const supabase = await createServerSupabaseClient();

    const kidId = formData.get("kidId") as string;
    const name = formData.get("name") as string;
    const band = formData.get("level") as string;

    // 1️⃣ Update kid name
    const { error: nameError } = await supabase.rpc("update_kid_records", {
      p_kid_id: kidId,
      p_name: name,
    });

    if (nameError) {
      console.error("❌ RPC update_kid_records failed:", nameError);
      throw new Error("Failed to update kid name.");
    }

    // 2️⃣ Update kid band + reset progress
    const { error: bandError } = await supabase.rpc("update_kid_band", {
      p_kid_id: kidId,
      p_band: band,
    });

    if (bandError) {
      console.error("❌ RPC update_kid_band failed:", bandError);
      throw new Error("Failed to update kid band.");
    }

    // 3️⃣ Revalidate page
    revalidatePath("/parent/manage-kids");
  }

  // =========================================================
  // RENDER CLIENT COMPONENT
  // =========================================================
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
