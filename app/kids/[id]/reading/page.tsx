// kidsreadingquest/app/kids/[id]/reading/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import ReadingClient from "./ReadingClient";

export default async function KidReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: kidId } = await params;

  const supabase = await createServerSupabaseClient();

  // ✅ Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // ✅ Parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  // ✅ Kid record
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name, reading_level")
    .eq("id", kidId)
    .eq("parent_id", parentRecord.id)
    .single();

  if (!kid) redirect("/parent/manage-kids");

  // ✅ Progress record
  const { data: progress } = await supabase
    .from("progress")
    .select("site_id, passage_index, band")
    .eq("kid_id", kidId)
    .single();

  if (!progress) throw new Error("No progress record found for kid: " + kidId);

  // ✅ Default language
  const language = "en";

  // ✅ Passage lookup
  const { data: passage } = await supabase
    .from("passages")
    .select("text")
    .eq("band", progress.band)
    .eq("site_id", progress.site_id)
    .eq("passage_index", progress.passage_index)
    .eq("language", language)
    .single();

  if (!passage)
    throw new Error(
      `Passage not found for band=${progress.band}, site=${progress.site_id}, index=${progress.passage_index}, language=${language}`
    );

  const passageText = passage.text ?? "";

  // ✅ Restore original appearance (same as assessment)
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

          <ReadingClient
            kidId={kid.id}
            kidName={kid.name}
            band={progress.band}
            passage={passageText}
          />
        </AuthCard>
      </div>
    </div>
  );
}
