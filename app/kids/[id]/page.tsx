// =========================================================
// SECTION 1 — Imports
// =========================================================
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FormContainer from "@/components/FormContainer";

// =========================================================
// SECTION 2 — Server Action: Mark Passage Complete
// =========================================================
export async function markPassageCompleteAction(formData: FormData) {
  "use server";

  const kidId = formData.get("kidId") as string;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.rpc("advance_kid_to_next_passage", {
    p_kid_id: kidId,
  });

  if (error) {
    console.error("❌ RPC advance_kid_to_next_passage failed:", error);
    throw new Error("Failed to advance to next passage.");
  }

  revalidatePath(`/kids/${kidId}`);
}

// =========================================================
// SECTION 3 — Page Component (SSR)
// =========================================================
export default async function KidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ unwrap params Promise (Next.js 16 requirement)
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  // ------------------------------
  // Auth check
  // ------------------------------
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // ------------------------------
  // Get parent record
  // ------------------------------
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // ------------------------------
  // Fetch kid + progress + passage text
  // ------------------------------
  const { data: kidData, error: kidError } = await supabase.rpc(
    "get_kid_with_progress",
    { p_kid_id: id }
  );

console.log("Kid data:", kidData);


  if (kidError || !kidData || kidData.length === 0) {
    console.error("❌ get_kid_with_progress failed:", kidError);
    redirect("/not-authorized");
  }

  const kid = kidData[0];

  // ------------------------------
  // Enforce parent ownership
  // ------------------------------
  const { data: ownershipCheck } = await supabase
    .from("kids")
    .select("parent_id")
    .eq("id", id)
    .single();

  if (!ownershipCheck || ownershipCheck.parent_id !== parentRecord.id) {
    redirect("/not-authorized");
  }

  // =========================================================
  // SECTION 4 — Render Page
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
            {/* ========================================================= */}
            {/* SECTION 5 — Kid Header */}
            {/* ========================================================= */}
            <h1
              style={{
                color: "black",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              {kid.name}
            </h1>

            <p style={{ color: "black", fontSize: "1.2rem" }}>
              <strong>Reading Level:</strong> {kid.reading_level}
            </p>

            <p style={{ color: "black", fontSize: "1.2rem" }}>
              <strong>Status:</strong> {kid.progress_status}
            </p>

            <p style={{ color: "black", fontSize: "1.2rem" }}>
              <strong>Passage Index:</strong> {kid.passage_index}
            </p>

{/* ========================================================= */}
{/* SECTION 6 — Passage Text */}
{/* ========================================================= */}
<div
  style={{
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "25px",
    textAlign: "left",
    color: "black",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  }}
>
  <h2
    style={{
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "15px",
    }}
  >
    Current Passage
  </h2>

  <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
    {kid.passage_text || "No passage text available."}
  </p>
</div>

            {/* ========================================================= */}
            {/* SECTION 7 — Mark Passage Complete Button */}
            {/* ========================================================= */}
            <form
              action={markPassageCompleteAction}
              style={{ marginTop: "25px" }}
            >
              <input type="hidden" name="kidId" value={kid.id} />

              <button
                type="submit"
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Mark Passage Complete
              </button>
            </form>
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
