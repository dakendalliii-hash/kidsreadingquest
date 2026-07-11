// =========================================================
// SECTION 1 — Imports
// =========================================================

export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";

// =========================================================
// SECTION 2 — Types
// =========================================================
interface ParentKidProgress {
  kid_id: string;
  kid_name: string;
  band: string;
  band_id: number;
  site_id: number;
  passage_index: number;
  status: string;
  updated_at: string;
}

// =========================================================
// SECTION 3 — Page Component
// =========================================================
export default async function ParentProgressReportPage() {
  const supabase = await createServerSupabaseClient();

  // ------------------------------
  // Auth check
  // ------------------------------
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // ------------------------------
  // Verify parent
  // ------------------------------
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // ------------------------------
  // Fetch progress for all kids
  // ------------------------------
  const { data: progressData, error } = await supabase.rpc(
    "get_parent_kid_progress",
    { p_parent_auth_id: user.id }
  );

  if (error) {
    console.error("❌ get_parent_kid_progress failed:", error);
  }

  // ------------------------------
  // Total passages per band (across all sites)
  // ------------------------------
  const bandTotals: Record<string, number> = {};

  if (progressData) {
    for (const kid of progressData) {
      const bandKey = kid.band;

      if (!bandTotals[bandKey]) {
        const { data: totalBandRows, error: totalBandError } = await supabase.rpc(
          "get_all_passages_for_band",
          { p_band: kid.band }
        );

        if (totalBandError) {
          console.error("❌ get_all_passages_for_band failed:", totalBandError);
          bandTotals[bandKey] = 1;
        } else {
          bandTotals[bandKey] = totalBandRows ?? 1;
        }
      }
    }
  }

  // ------------------------------
  // Completed passages per kid (band-wide)
  // ------------------------------
  const completedCounts: Record<string, number> = {};

  if (progressData) {
    for (const kid of progressData) {
      const key = `${kid.band}-${kid.site_id}-${kid.passage_index}`;

      if (!completedCounts[key]) {
        const { data: completedRows, error: completedError } = await supabase.rpc(
          "get_completed_passages_for_band_position",
          {
            p_band: kid.band,
            p_site_id: kid.site_id,
            p_passage_index: kid.passage_index,
          }
        );

        if (completedError) {
          console.error("❌ get_completed_passages_for_band_position failed:", completedError);
          completedCounts[key] = 0;
        } else {
          completedCounts[key] = completedRows ?? 0;
        }
      }
    }
  }

  // =========================================================
  // SECTION 4 — Render
  // =========================================================
  return (
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
            }}
          >
            <h1
              style={{
                color: "black",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "25px",
              }}
            >
              Reading Progress Report
            </h1>

            {(!progressData || progressData.length === 0) && (
              <p style={{ color: "black", fontSize: "1.1rem" }}>
                No progress records found.
              </p>
            )}

            {/* ========================================================= */}
            {/* SECTION 5 — Kid Progress Cards */}
            {/* ========================================================= */}
            {progressData?.map((kid: ParentKidProgress) => {
              const totalBand = bandTotals[kid.band] ?? 1;
              const key = `${kid.band}-${kid.site_id}-${kid.passage_index}`;
              const completed = completedCounts[key] ?? 0;

              // Derived status
              let derivedStatus: string;
              if (completed <= 0) {
                derivedStatus = "Not Started";
              } else if (completed >= totalBand) {
                derivedStatus = "Completed";
              } else {
                derivedStatus = "Reading";
              }

              const percent = Math.round((completed / totalBand) * 100);

              return (
                <div
                  key={kid.kid_id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                    textAlign: "left",
                    color: "black",
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <p><strong>Name:</strong> {kid.kid_name}</p>
                  <p><strong>Band:</strong> {kid.band}</p>
                  <p><strong>Site:</strong> {kid.site_id}</p>
                  <p><strong>Passage Index:</strong> {kid.passage_index}</p>
                  <p><strong>Status:</strong> {derivedStatus}</p>

                  {/* Band-wide progress bar */}
                  <div
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      height: "20px",
                      backgroundColor: "#ddd",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        backgroundColor: "#4A90E2",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  <p style={{ marginTop: "5px", fontWeight: "bold" }}>
                    {percent}% Complete
                  </p>
                </div>
              );
            })}
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
