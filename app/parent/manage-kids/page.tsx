// =========================================================
// SECTION 1 — Imports
// =========================================================

export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";

// =========================================================
// SECTION 2 — Server Actions
// =========================================================
export async function addKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const name = formData.get("name") as string;
  const readingLevel = formData.get("readingLevel") as string;
  const age = formData.get("age") as string;
  const parentId = formData.get("parentId") as string;

  const { data: kidInsert, error: kidError } = await supabase
    .from("kids")
    .insert({
      name,
      reading_level: readingLevel,
      age: age ? Number(age) : null,
      parent_id: parentId,
    })
    .select("id")
    .single();

  if (kidError || !kidInsert) {
    console.error("❌ Failed to insert kid:", kidError);
    throw new Error("Failed to add kid.");
  }

  const kidId = kidInsert.id;

  const { data: firstPassage, error: firstPassageError } = await supabase.rpc(
    "get_first_passage_for_band",
    { p_band: readingLevel, p_site_id: 1 }
  );

  if (firstPassageError || !firstPassage || firstPassage.length === 0) {
    console.error("❌ RPC get_first_passage_for_band failed:", firstPassageError);
    throw new Error("No passages found for this reading level.");
  }

  const passageId = firstPassage[0].id;

  const { error: progressError } = await supabase
    .from("progress")
    .insert({
      kid_id: kidId,
      passage_id: passageId,
      status: "not started",
    });

  if (progressError) {
    console.error("❌ Failed to initialize progress:", progressError);
    throw new Error("Failed to initialize reading progress.");
  }

  revalidatePath("/parent/manage-kids");
}

export async function updateKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const kidId = formData.get("kidId") as string;
  const name = formData.get("name") as string;
  const readingLevel = formData.get("readingLevel") as string;
  const age = formData.get("age") as string;

  const { error } = await supabase.rpc("update_kid", {
    p_kid_id: kidId,
    p_name: name,
    p_age: age ? Number(age) : null,
    p_reading_level: readingLevel,
  });

  if (error) {
    console.error("❌ RPC update_kid failed:", error);
    throw new Error("Failed to update kid.");
  }

  revalidatePath("/parent/manage-kids");
}

export async function deleteKid(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const kidId = formData.get("kidId") as string;

  const { error } = await supabase.from("kids").delete().eq("id", kidId);

  if (error) {
    console.error("❌ Failed to delete kid:", error);
    throw new Error("Failed to delete kid.");
  }

  revalidatePath("/parent/manage-kids");
}

// =========================================================
// SECTION 3 — Page Component
// =========================================================
export default async function ManageKidsPage() {
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

  const { data: kids } = await supabase
    .from("kids")
    .select("*")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

  return (
<div className="page-wrapper">
  <FormContainer>
    <div className="page-container">

          {/* ========================================================= */}
          {/* SECTION 4 — Header */}
          {/* ========================================================= */}
          <h2 style={{ marginBottom: "20px", color: "black" }}>Manage Kids</h2>

          {/* ========================================================= */}
          {/* SECTION 5 — Add Kid Form */}
          {/* ========================================================= */}
          <form action={addKid} style={{ marginBottom: "30px" }}>
            <input type="hidden" name="parentId" value={parentRecord.id} />

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label
                htmlFor="name"
                style={{ fontWeight: "bold", color: "black" }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter kid's name"
                required
                style={{
                  width: "95%",
                  maxWidth: "650px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label
                htmlFor="age"
                style={{ fontWeight: "bold", color: "black" }}
              >
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                placeholder="Enter age"
                style={{
                  width: "95%",
                  maxWidth: "650px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <label
                htmlFor="readingLevel"
                style={{ fontWeight: "bold", color: "black" }}
              >
                Reading Level (Band)
              </label>
              <input
                id="readingLevel"
                name="readingLevel"
                type="text"
                placeholder="Enter reading level band"
                required
                style={{
                  width: "95%",
                  maxWidth: "650px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#3b4a63", // EXACT login button color
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                display: "block",
                width: "95%",
                maxWidth: "650px",
              }}
            >
              Add Kid
            </button>
          </form>

          {/* ========================================================= */}
          {/* SECTION 6 — Kids List */}
          {/* ========================================================= */}
          {kids?.map((kid) => (
            <div
              key={kid.id}
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
              {/* Update Kid Form */}
              <form action={updateKid} style={{ marginBottom: "10px" }}>
                <input type="hidden" name="kidId" value={kid.id} />

                <div style={{ marginBottom: "10px" }}>
                  <label
                    htmlFor={`name-${kid.id}`}
                    style={{ fontWeight: "bold", color: "black" }}
                  >
                    Name
                  </label>
                  <input
                    id={`name-${kid.id}`}
                    name="name"
                    defaultValue={kid.name}
                    style={{
                      width: "95%",
                      maxWidth: "650px",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginTop: "5px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label
                    htmlFor={`age-${kid.id}`}
                    style={{ fontWeight: "bold", color: "black" }}
                  >
                    Age
                  </label>
                  <input
                    id={`age-${kid.id}`}
                    name="age"
                    defaultValue={kid.age}
                    style={{
                      width: "95%",
                      maxWidth: "650px",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginTop: "5px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    htmlFor={`readingLevel-${kid.id}`}
                    style={{ fontWeight: "bold", color: "black" }}
                  >
                    Reading Level (Band)
                  </label>
                  <input
                    id={`readingLevel-${kid.id}`}
                    name="readingLevel"
                    defaultValue={kid.reading_level}
                    style={{
                      width: "95%",
                      maxWidth: "650px",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginTop: "5px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#3b4a63", // EXACT login button color
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "block",
                    width: "95%",
                    maxWidth: "650px",
                    marginBottom: "10px",
                  }}
                >
                  Update
                </button>
              </form>

              {/* Delete Kid Form */}
              <form action={deleteKid}>
                <input type="hidden" name="kidId" value={kid.id} />

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "red", // stays red as requested
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "block",
                    width: "95%",
                    maxWidth: "650px",
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </FormContainer>
    </div>
  );
}
