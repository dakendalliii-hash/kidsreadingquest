export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import Celebration from "@/components/Celebration";
import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

// ------------------------------
// Client-only Celebration Wrapper
// ------------------------------
function CelebrationClientWrapper({ kidId, language }: { kidId: string; language: string }) {
  "use client";
  return <Celebration kidId={kidId} language={language} />;
}

export default async function KidDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; celebrate?: string; bandCompleted?: string }>;
}) {
  const { id } = await params;
  const { lang: qLang, celebrate } = await searchParams;

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

  const { data: ownershipCheck } = await supabase
    .from("kids")
    .select("parent_id, name")
    .eq("id", id)
    .single();

  if (!ownershipCheck || ownershipCheck.parent_id !== parentRecord.id) {
    redirect("/not-authorized");
  }

  const kid = { id, name: ownershipCheck.name };

  const { data: progressRecord } = await supabase
    .from("progress")
    .select("band, site_id, passage_index")
    .eq("kid_id", id)
    .single();

  if (!progressRecord) {
    return <p>No progress record found.</p>;
  }

  const currentBand = progressRecord.band;
  const currentSite = progressRecord.site_id;
  const currentIndex = progressRecord.passage_index;

  const langCode = qLang === "hindi" ? "hindi" : "en";
  const languageName = langCode === "hindi" ? "Hindi" : "English";

  const { data: passageRow } = await supabase
    .from("passages")
    .select("text")
    .eq("band", currentBand)
    .eq("site_id", currentSite)
    .eq("passage_index", currentIndex)
    .eq("language", langCode)
    .single();

  const passageText =
    passageRow?.text ??
    `No passage found for band ${currentBand}, site ${currentSite}, passage ${currentIndex} (${languageName}).`;

  return (
    <>
      {/* Celebration now rendered ONLY on the client → hydration-safe */}
      {celebrate === "1" && (
        <CelebrationClientWrapper kidId={kid.id} language={langCode} />
      )}

      <div
        style={{
          backgroundImage: "url('/DiverseKids.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
          }}
        >
          <FormContainer>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
                padding: "40px",
                width: "85%",
                maxWidth: "800px",
                margin: "0 auto",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                position: "relative",
              }}
            >
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                {kid.name}
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1.2rem",
                  marginBottom: "25px",
                }}
              >
                Band {currentBand} — Site {currentSite} — Passage {currentIndex}
              </p>

              <KidDetailClientWrapper
                passageText={passageText}
                kidId={kid.id}
                initialLanguage={languageName}
                band={currentBand}
                siteId={currentSite}
                passageIndex={currentIndex}
              />
            </div>
          </FormContainer>
        </div>
      </div>
    </>
  );
}
