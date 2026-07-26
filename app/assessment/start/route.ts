import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // ✅ Include cookies from the incoming request
    const supabase = await createServerSupabaseClient();

    const formData = await request.formData();
    const kidName = formData.get("kid_name") as string;
    const age = Number(formData.get("age"));

    // ✅ Get parent auth user safely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Calculate band from age
    const band = age <= 5 ? "A" : age <= 7 ? "B" : "C";

    // ✅ Generate kid email + password
    const kidEmail = `${kidName.toLowerCase().replace(/\s+/g, "")}.${user.id}@kidsreadingquest.local`;
    const kidPassword = `Kid${Math.floor(Math.random() * 90000 + 10000)}`;

    // ✅ Call your RPC to create kid + progress
    const { data: newKidId, error: rpcError } = await supabase.rpc(
      "create_kid_parent_records",
      {
        p_parent_record_id: user.id,
        p_name: kidName,
        p_reading_level: band,
        p_age: age,
        p_email: kidEmail,
        p_password: kidPassword,
      }
    );

    if (rpcError) {
      console.error("RPC ERROR:", rpcError);
      return NextResponse.redirect(new URL("/assessment?error=rpc", request.url));
    }

    // ✅ Redirect back to AssessmentClient with kid_id + band
    const redirectUrl = new URL(`/assessment?kid_id=${newKidId}&band=${band}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Unhandled route error:", err);
    return NextResponse.redirect(new URL("/assessment?error=server", request.url));
  }
}
