// =========================================================
// SECTION 1 — Imports
// =========================================================
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FormContainer from "@/components/FormContainer";

// =========================================================
// SECTION 2 — Types
// =========================================================
interface ParentKidProgress {
  kid_id: string;
  kid_name: string;
  band: string;
  passage_index: number;
  status: string;
}

// =========================================================
// SECTION 3 — Server Action: Update Reading Status
// =========================================================
export async function updateReadingStatusAction(formData: FormData) {
  "use server";

  const kidId = formData.get("kidId") as string;
  const newStatus = formData.get("newStatus") as string;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.rpc("update_kid_reading_status", {
    p_kid_id: kidId,
    p_status: newStatus,
  });

  if (error) {
    console.error("❌ RPC update_kid_reading_status failed:", error);
    throw new Error("Failed to update reading status.");
  }

  revalidatePath("/parent/progress");
}

// =========================================================
// SECTION 4 — Page Component
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
  // Fetch total passages per band
  // ------------------------------
  const totals: Record<string, number> = {};

  if (progressData) {
    for (const kid of progressData) {
      if (!totals[kid.band]) {
        const { data: totalRows } = await supabase.rpc(
          "get_total_passages_for_band",
          { p_band: kid.band, p_site_id: 1 }
        );
        totals[kid.band] = totalRows ?? 1;
      }
    }
  }

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
              const total = totals[kid.band] ?? 1;
              const percent = Math.round((kid.passage_index / total) * 100);

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
                  <p><strong>Passage Index:</strong> {kid.passage_index} / {total}</p>
                  <p><strong>Status:</strong> {kid.status}</p>

                  {/* ========================================================= */}
                  {/* SECTION 6 — Progress Bar */}
                  {/* ========================================================= */}
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

                  {/* ========================================================= */}
                  {/* SECTION 7 — Status Update Form */}
                  {/* ========================================================= */}
                  <form action={updateReadingStatusAction} style={{ marginTop: "15px" }}>
                    <input type="hidden" name="kidId" value={kid.kid_id} />

                    <label style={{ marginRight: "10px" }}>
                      Change Status:
                    </label>

                    <select
                      name="newStatus"
                      defaultValue={kid.status}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        marginRight: "10px",
                      }}
                    >
                      <option value="not started">Not Started</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#4A90E2",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Update
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
