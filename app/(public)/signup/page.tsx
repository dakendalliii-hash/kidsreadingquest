export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FormContainer from "@/components/FormContainer";

async function handleSignUp(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  if (!password || password.length < 10) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Password must be at least 10 characters."
      )}`
    );
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData?.user) {
    const friendly =
      authError?.message || "Signup failed while creating the account.";
    redirect(`/signup?error=${encodeURIComponent(friendly)}`);
  }

  const userId = authData.user.id;

  const { error: rpcError } = await supabase.rpc(
    "create_auth_user_with_role",
    {
      p_user_id: userId,
      p_email: email,
      p_role: "parent",
    }
  );

  if (rpcError) {
    const friendly =
      rpcError.message ||
      "Signup succeeded, but role setup failed. Please contact support.";
    redirect(`/signup?error=${encodeURIComponent(friendly)}`);
  }

  // ✅ After successful signup, go to email confirmation screen
  redirect("/signup/confirm");
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const errorMessage = params?.error;

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
            Create Account
          </h1>

          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >
            Join Kids Reading Quest today!
          </p>

          {errorMessage && (
            <p style={{ color: "red", marginBottom: "15px" }}>{errorMessage}</p>
          )}

          <form action={handleSignUp}>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label
                htmlFor="email"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@email_provider.com"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>

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
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                required
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
                Password must be at least <strong>10 characters</strong>. You
                may use <strong>letters, numbers, spaces, and symbols</strong>.
              </p>
            </div>

            <div style={{ marginBottom: "25px", textAlign: "left" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
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
              Sign Up
            </button>
          </form>

          <div style={{ marginTop: "20px" }}>
            <span style={{ color: "black" }}>
              Already have an account?{" "}
              <a
                href="/login"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                Log In
              </a>
            </span>
          </div>
        </div>
      </FormContainer>
    </div>
  );
}
