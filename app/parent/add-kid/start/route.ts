export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function bandFromAge(age: number): string {
  if (age >= 4 && age <= 5) return "A 4-5";
  if (age >= 6 && age <= 7) return "B 6-7";
  return "C 8-9";
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Add Kid Start: user not authenticated.", userError);
    redirect("/login");
  }

  const formData = await req.formData();

  const parentId = formData.get("parent_id") as string;
  const kidName = formData.get("kid_name") as string;
  const ageStr = formData.get("age") as string;

  const age = parseInt(ageStr, 10);
  const band = bandFromAge(age);

  if (!parentId || !kidName || Number.isNaN(age)) {
    console.error("Add Kid Start: invalid form data");
    redirect("/parent/add-kid");
  }

  const { data: newKidId, error: rpcError } = await supabase.rpc(
    "create_kid_parent_records",
    {
      p_parent_record_id: parentId,
      p_name: kidName,
      p_reading_level: band,
      p_age: age,
    }
  );

  if (rpcError || !newKidId) {
    console.error("Add Kid Start: RPC error", rpcError);
    redirect("/parent/add-kid");
  }

  // Store newly created kid ID in a cookie for the options flow
  const cookieStore = await cookies();
  cookieStore.set("new_kid_id", String(newKidId), {
    path: "/",
    maxAge: 60 * 30,
    httpOnly: false, // readable by client for options page
  });

  // Redirect to signup options (path selection)
  console.log(
    `✅ Kid created (${newKidId}). Redirecting to /signup/options for path selection.`
  );
  redirect("/signup/options");
}
