// =========================================================
// LOGIN PAGE — COLORS ALIGNED WITH PARENT DASHBOARD
// =========================================================

export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import AuthCard from "@/components/AuthCard";


// =========================================================
// SECTION 1 — SERVER ACTION: LOGIN (TOP LEVEL)
// =========================================================
export async function handleLogin(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login failed:", error);
    throw new Error("Login failed.");
  }

  redirect("/parent");
}

// =========================================================
// SECTION 2 — PAGE COMPONENT
// =========================================================
export default function LoginPage() {
  return (
<div
  style={{
    backgroundImage: "url('/DiverseKids.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    padding: "80px 40px 40px 40px", // UPDATED
  }}
>
      <FormContainer>
	<div className="page-container">
	<AuthCard>
        {/* ========================================================= */}
        {/* SECTION 3 — FORM CARD (MATCHES PARENT CONTAINER) */}
        {/* ========================================================= */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)", // same as Parent Dashboard container
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "500px",
            margin: "0 auto",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* ========================================================= */}
          {/* SECTION 4 — HEADERS */}
          {/* ========================================================= */}
          <h1
            style={{
              color: "black",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Log In to Your Account
          </h1>

          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >
            Welcome back!
          </p>

          {/* ========================================================= */}
          {/* SECTION 5 — LOGIN FORM */}
          {/* ========================================================= */}
          <form action={handleLogin}>
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
                placeholder="name@company.com"
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
                placeholder="••••••••"
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

            {/* ========================================================= */}
            {/* APPLY GLOBAL WIDTH RULE — SINGLE BUTTON ON ROW           */}
            {/* ========================================================= */}
            <button
              type="submit"
              className="btn-primary form-single-button"
              style={{
                width: "100%", // your original width preserved
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Login
            </button>
          </form>

          {/* ========================================================= */}
          {/* SECTION 6 — LINKS (Forgot Password / Sign Up) */}
          {/* ========================================================= */}
          <div style={{ marginTop: "20px" }}>
            <a
              href="#"
              style={{
                color: "black",
                textDecoration: "underline",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Forgot Password?
            </a>

            <span style={{ color: "black" }}>
              Don’t have an account?{" "}
              <a
                href="/signup"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                Sign Up
              </a>
            </span>
          </div>
        </div>
	</AuthCard>
	</div>
      </FormContainer>
    </div>
  );
}
