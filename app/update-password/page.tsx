export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";

async function handleUpdate(formData: FormData) {
  "use server";

  const newPassword = formData.get("password") as string;
  const code = formData.get("code") as string;

  const supabase = await createServerSupabaseClient();

  // ⭐ REQUIRED STEP: Activate the reset session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    throw new Error("Password update failed.");
  }

  // ⭐ Now the session is active — update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (!updateError) {
    redirect("/login");
  }

  throw new Error("Password update failed.");
}

export default async function UpdatePasswordPage(
  { searchParams }: { searchParams: Promise<Record<string, string | undefined>> }
) {
  const params = await searchParams;
  const code = params.code;

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        padding: "80px 40px 40px 40px",
      }}
    >
      <FormContainer>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "500px",
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
              marginBottom: "10px",
            }}
          >
            Set New Password
          </h1>

          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >
            Enter your new password below.
          </p>

          <form action={handleUpdate}>
            {/* ⭐ Hidden input to pass reset code to server action */}
            <input type="hidden" name="code" value={code} />

            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <label
                htmlFor="password"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />

              <p
                style={{
                  color: "black",
                  fontSize: "0.9rem",
                  marginTop: "6px",
                  opacity: 0.85,
                }}
              >
                Password must be at least <strong>10 characters</strong>.  
                You may use <strong>letters, numbers, spaces, and any standard symbols</strong>.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary form-single-button"
              style={{
                width: "100%",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </FormContainer>
    </div>
  );
}
