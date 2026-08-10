export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createServerSupabaseClient } from "@/lib/supabase/server";
import AssessmentClientShell from "@/components/AssessmentClientShell";
import FormContainer from "@/components/FormContainer";
import AssessmentClientWrapper from "@/components/AssessmentClientWrapper";

export default async function AssessmentPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: kidId } = await params;

  const supabase = await createServerSupabaseClient();

  // 1️⃣ Auth check
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You must be logged in to access this page.</p>
      </div>
    );
  }

  // 2️⃣ Ensure user is a parent
  const { data: roleRecord } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "parent") {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // 3️⃣ Fetch kid record (reading_level only)
  const { data: kidData, error: kidError } = await supabase
    .from("kids")
    .select("reading_level")
    .eq("id", kidId)
    .single();

  if (kidError || !kidData) {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold">Kid Not Found</h1>
        <p>Unable to retrieve kid information for assessment.</p>
      </div>
    );
  }

  // 4️⃣ Fetch the FIRST passage for this kid's reading level (English, site 1, passage 1)
  const { data: passageObj, error: passageError } = await supabase
    .from("passages")
    .select("*")
    .eq("language", "en")
    .eq("band", kidData.reading_level)
    .eq("site_id", 1)
    .eq("passage_index", 1)
    .maybeSingle();

  if (passageError || !passageObj) {
    return (
      <div className="text-white p-6">
        <h1 className="text-2xl font-bold">No Passage Found</h1>
        <p>No reading passage is available for this kid.</p>
      </div>
    );
  }

  // ⭐ Pass stable props into the client shell
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

  <AssessmentClientWrapper
    kidId={kidId}
    passage={passageObj}
    band={passageObj.band}
  />
        </div>
      </FormContainer>
    </div>
  </div>
);
}
