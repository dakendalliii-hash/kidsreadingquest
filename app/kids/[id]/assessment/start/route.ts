import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const formData = await request.formData();

    const kidName = formData.get("kid_name") as string;
    const age = Number(formData.get("age"));

    // ------------------------------------------------------------
    // 1. AUTH USER (PARENT MUST BE LOGGED IN)
    // ------------------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ------------------------------------------------------------
    // 2. FETCH EXISTING PARENT RECORD (NO CREATION HERE)
    // ------------------------------------------------------------
    const { data: parentRecord, error: parentLookupError } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (parentLookupError || !parentRecord) {
      console.error("Parent record missing:", parentLookupError);
      return NextResponse.redirect(new URL("/auth/callback", request.url));
    }

    const parentId = parentRecord.id;

    // ------------------------------------------------------------
    // 3. DETERMINE READING BAND
    // ------------------------------------------------------------
    const band = age <= 5 ? "A 4-5" : age <= 7 ? "B 6-7" : "C 8-9";

    // ------------------------------------------------------------
    // 4. CALL UPDATED RPC (NO AUTH USER CREATION)
    // ------------------------------------------------------------
    const { data: newKidId, error: rpcError } = await supabase.rpc(
      "create_kid_parent_records",
      {
        p_parent_record_id: parentId,
        p_name: kidName,
        p_reading_level: band,
        p_age: age,
      }
    );

    if (rpcError) {
      console.error("RPC ERROR:", rpcError);
      return NextResponse.redirect(new URL("/assessment?error=rpc", request.url));
    }

    // ------------------------------------------------------------
    // 5. FETCH PASSAGE (English + Hindi) — passage_index = 1
    // ------------------------------------------------------------
    const { data: passageRow, error: passageError } = await supabase
      .from("passages")
      .select("title, entext, text")
      .eq("band", band)
      .eq("site_id", 1)
      .eq("passage_index", 1)
      .single();

    if (passageError) {
      console.error("Passage fetch error:", passageError);
    }

    const passageTitle = passageRow?.title || "Reading Passage";

    const passageEnglish =
      passageRow?.entext || "Something went wrong retrieving the passage!";
    const passageHindi =
      passageRow?.text || "कुछ गलत हो गया! पाठ प्राप्त नहीं हो सका।";

    // ------------------------------------------------------------
    // 6. REDIRECT TO ASSESSMENT WITH KID_ID + BAND + PASSAGES
    // ------------------------------------------------------------
    const redirectUrl = new URL(
      `/assessment?kid_id=${newKidId}` +
        `&band=${encodeURIComponent(band)}` +
        `&title=${encodeURIComponent(passageTitle)}` +
        `&text_en=${encodeURIComponent(passageEnglish)}` +
        `&text_hi=${encodeURIComponent(passageHindi)}`,
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Unhandled route error:", err);
    return NextResponse.redirect(new URL("/assessment?error=server", request.url));
  }
}
