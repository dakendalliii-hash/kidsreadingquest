// kidsreadingquest/app/kids/[id]/reading/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import ReadingClient from "./ReadingClient";

export default async function KidReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: kidId } = await params;
  console.log("[READING PAGE] kidId:", kidId);

  const supabase = await createServerSupabaseClient();

  // ⭐ Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // ⭐ Parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  // ⭐ Kid record
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name, reading_level")
    .eq("id", kidId)
    .eq("parent_id", parentRecord.id)
    .single();

  if (!kid) redirect("/parent/manage-kids");

  // ⭐ Load progress (band, site, passage_index)
  const { data: progress, error: progressError } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (progressError || !progress) {
    // New kid or missing progress → start at read‑aloud
    redirect(`/kids/${kidId}/read-aloud?lang=en`);
  }

  const { band, site_id, passage_index } = progress;

  // ⭐ Load passage text (English)
  const { data: passageData, error: passageError } = await supabase
    .from("passages")
    .select("text")
    .eq("band", band)
    .eq("site_id", site_id)
    .eq("passage_index", passage_index)
    .eq("language", "en")
    .single();

  if (passageError || !passageData) {
    throw new Error(
      `Passage not found for band=${band}, site=${site_id}, index=${passage_index}`
    );
  }

  const passageText = passageData.text ?? "";

  // ⭐ Render reading page
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div className="page-container text-black" style={{ marginTop: 0 }}>
        <AuthCard>
          <h1 className="section-header">Kid Reading Quest</h1>

          {/* ⭐ ReadingClient only accepts kidId */}
          <ReadingClient kidId={kid.id} />
        </AuthCard>
      </div>
    </div>
  );
}
