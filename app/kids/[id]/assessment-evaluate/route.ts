import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const { kidId, fluencyPassed } = JSON.parse(raw);

    if (!kidId) {
      return NextResponse.json(
        { passed: false, error: "Missing kidId" },
        { status: 400 }
      );
    }

    // Band A: fluencyPassed already means:
    // - WPM ≥ 20
    // - Accuracy ≥ 95%
    // - Errors ≤ 3
    // These thresholds are enforced in read-aloud.
    if (!fluencyPassed) {
      return NextResponse.json({ passed: false }, { status: 200 });
    }

    const supabase = await createServerSupabaseClient();

    // Auth: parent must be logged in
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json(
        { passed: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parent record
    const { data: parentRecord } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!parentRecord) {
      return NextResponse.json(
        { passed: false, error: "Parent not authorized" },
        { status: 403 }
      );
    }

    // Kid ownership check
    const { data: kidRecord } = await supabase
      .from("kids")
      .select("id, parent_id")
      .eq("id", kidId)
      .single();

    if (!kidRecord || kidRecord.parent_id !== parentRecord.id) {
      return NextResponse.json(
        { passed: false, error: "Kid not authorized" },
        { status: 403 }
      );
    }

    // If fluencyPassed is true, Band A assessment passes.
    return NextResponse.json({ passed: true }, { status: 200 });
  } catch (err) {
    console.error("assessment-evaluate error:", err);
    return NextResponse.json(
      { passed: false, error: "Server error" },
      { status: 500 }
    );
  }
}
