export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import Celebration from "@/components/Celebration";
import { markPassageCompleteAction } from "./actions";

export default async function KidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // Parent record
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // Ownership check
  const { data: ownershipCheck } = await supabase
    .from("kids")
    .select("parent_id, name")
    .eq("id", id)
    .single();

  if (!ownershipCheck || ownershipCheck.parent_id !== parentRecord.id) {
    redirect("/not-authorized");
  }

  const kid = { id, name: ownershipCheck.name };

  // Progress record
  const { data: progressRecord } = await supabase
    .from("progress")
    .select("passage_index, band, site_id, status")
    .eq("kid_id", id)
    .single();

  if (!progressRecord) {
    return <p>No progress record found.</p>;
  }

  // Fetch passage text
  const { data: passageText, error: passageError } = await supabase.rpc(
    "get_passage_text_for_progress",
    {
      p_band: progressRecord.band,
      p_site_id: progressRecord.site_id,
      p_passage_index: progressRecord.passage_index,
    }
  );

  console.log("RPC passageText:", passageText);
  console.log("RPC error:", passageError);

  // Render page
  return (
    <>
      {/* 🎉 Celebration animation */}
      <Celebration />

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
              {/* Kid name and passage number */}
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
                Passage {progressRecord.passage_index}
              </p>

              {/* Passage text */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "left",
                  color: "black",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
              >
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {passageText ??
                    `No passage found for passage ${progressRecord.passage_index}.`}
                </p>
              </div>

              {/* Complete button */}
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
    </>
  );
}
