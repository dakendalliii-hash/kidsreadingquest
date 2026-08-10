// app/kids/[id]/read-aloud/page.tsx
export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Celebration from "@/components/Celebration";
import MicReaderWrapper from "./MicReaderWrapper";

export default async function ReadAloudPage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const kidId = params.id;
  const celebrate = searchParams?.celebrate === "1";
  const bandComplete = searchParams?.bandComplete === "1";

  // ⭐ Language selected by user (default English)
  const selectedLanguage =
    searchParams?.lang === "hindi" ? "hindi" : "en";

  console.log("[READ-ALOUD PAGE] kidId:", kidId);
  console.log("[READ-ALOUD PAGE] celebrate:", celebrate);
  console.log("[READ-ALOUD PAGE] bandComplete:", bandComplete);
  console.log("[READ-ALOUD PAGE] selectedLanguage:", selectedLanguage);

  const supabase = await createServerSupabaseClient();

  // Auth
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // Parent
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  // Kid
  const { data: kid } = await supabase
    .from("kids")
    .select("id, name")
    .eq("id", kidId)
    .eq("parent_id", parentRecord.id)
    .single();

  if (!kid) redirect("/parent/manage-kids");

  // Progress
  const { data: progress } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", kidId)
    .single();

  if (!progress) throw new Error("No progress record found");

  // ⭐ Fetch passage EXACTLY like assessment:
  //    - match band/site/passage_index
  //    - match selected language
  const { data: passage } = await supabase
    .from("passages")
    .select("text, entext")
    .eq("band", progress.band)
    .eq("site_id", progress.site_id)
    .eq("passage_index", progress.passage_index)
    .eq("language", selectedLanguage)
    .single();

  if (!passage) {
    console.error("[READ-ALOUD PAGE] No passage found for:", {
      band: progress.band,
      site_id: progress.site_id,
      passage_index: progress.passage_index,
      language: selectedLanguage,
    });
    throw new Error("Passage not found");
  }

  const passageLocalized = passage.text ?? "";
  const passageEnglish = passage.entext ?? "";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div className="page-container text-black">
        {celebrate && (
          <Celebration kidId={kidId} language={selectedLanguage} />
        )}

        {bandComplete && (
          <div
            style={{
              backgroundColor: "#f0fff4",
              padding: "24px",
              borderRadius: "10px",
              border: "2px solid #38a169",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#2f855a" }}>🎉 Congratulations!</h2>
            <p>You are ready to move to the next band!</p>
          </div>
        )}

        <AuthCard>
          <h1 className="section-header">
            Read Aloud — Band {progress.band}
          </h1>

          {/* ⭐ Language toggle + passage display handled inside wrapper */}
          <MicReaderWrapper
            passageLocalized={passageLocalized}
            passageEnglish={passageEnglish}
            band={progress.band}
            kidId={kidId}
          />
        </AuthCard>
      </div>
    </div>
  );
}
