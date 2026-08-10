export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FormContainer from "@/components/FormContainer";
import ActionButton from "@/components/ActionButton";

export default async function AddKidPage() {
  const supabase = await createServerSupabaseClient();

  // Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Add Kid: user not authenticated.", userError);
    redirect("/login");
  }

  console.log("Add Kid: looking up parent record by:", {
    auth_id: user.id,
    email: user.email,
  });

  // Try to find parent record (auth_id or email)
  let parentRecord: { id: string } | null = null;
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error } = await supabase
      .from("parents")
      .select("id, auth_id, email")
      .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    console.log(`Add Kid: lookup attempt ${attempt}`, {
      data,
      error,
    });

    if (data && !error) {
      parentRecord = data;
      break;
    }

    lastError = error;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!parentRecord) {
    console.error("Add Kid: parent record missing after retries.", lastError);
    redirect("/auth/callback");
  }

  const parentId = parentRecord.id;
  console.log("Add Kid: parent record found:", parentRecord);

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      <div className="floating-slate">Welcome Parent</div>

      <FormContainer>
        <div className="page-container">
          <h2 className="section-header">Add Kid</h2>

          <form action="/parent/add-kid/start" method="POST">
            <input type="hidden" name="parent_id" value={parentId} />

            <input
              type="text"
              name="kid_name"
              placeholder="Kid's name"
              required
              className="input-field"
            />

            <select name="age" required className="input-field">
              <option value="">Select age</option>
              {[4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <ActionButton label="Add Kid" />
          </form>
        </div>
      </FormContainer>
    </div>
  );
}
