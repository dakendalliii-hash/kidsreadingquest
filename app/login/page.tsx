export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import FormContainer from "@/components/FormContainer";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const MAX_ATTEMPTS = 5;
const COOLDOWN_MINUTES = 10;

async function handleLogin(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ⭐ FIX: cookies() must be awaited in Next.js 14+
  const cookieStore = await cookies();

  const attemptCookie = cookieStore.get("login_attempts");
  const cooldownCookie = cookieStore.get("login_cooldown");

  const attempts = attemptCookie ? parseInt(attemptCookie.value, 10) : 0;
  const cooldownUntil = cooldownCookie ? parseInt(cooldownCookie.value, 10) : 0;
  const now = Date.now();

  // =========================================================
  // ACTIVE COOLDOWN
  // =========================================================
  if (cooldownUntil && now < cooldownUntil) {
    throw redirect(
      `/login?error=${encodeURIComponent("Let's try again together!")}&attempts=${attempts}`
    );
  }

  // =========================================================
  // ATTEMPT LOGIN
  // =========================================================
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const newAttempts = attempts + 1;

    // Save updated attempt count
    cookieStore.set("login_attempts", String(newAttempts), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
    });

    // =========================================================
    // TOO MANY ATTEMPTS → START COOLDOWN
    // =========================================================
    if (newAttempts >= MAX_ATTEMPTS) {
      const cooldownUntilTimestamp =
        now + COOLDOWN_MINUTES * 60 * 1000;

      cookieStore.set("login_cooldown", String(cooldownUntilTimestamp), {
        httpOnly: true,
        path: "/",
        maxAge: COOLDOWN_MINUTES * 60,
      });

      throw redirect(
        `/login?error=${encodeURIComponent("Let's try again together!")}&attempts=${newAttempts}`
      );
    }

    // =========================================================
    // NORMAL INVALID PASSWORD
    // =========================================================
    throw redirect(
      `/login?error=${encodeURIComponent("Invalid Password!")}&attempts=${newAttempts}`
    );
  }

  // =========================================================
  // SUCCESS → CLEAR ATTEMPTS + COOLDOWN
  // =========================================================
  cookieStore.set("login_attempts", "0", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60,
  });

  cookieStore.set("login_cooldown", "0", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60,
  });

  redirect("/parent");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const errorMessage = params?.error;
  const attempts = params?.attempts;

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
            Login
          </h1>

          <form action={handleLogin}>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
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
                required
                placeholder="name@email_provider.com"
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

              {errorMessage && (
                <p
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {errorMessage}
                </p>
              )}

              {attempts && (
                <p
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    marginTop: "4px",
                  }}
                >
                  Attempts: {attempts} / {MAX_ATTEMPTS}
                </p>
              )}
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
              Login
            </button>

            {/* ========================================================= */}
            {/* RESTORED LINKS — Forgot Password + Sign Up                */}
            {/* ========================================================= */}
            <div style={{ marginTop: "12px" }}>
              <a
                href="/forgot-password"
                style={{
                  color: "#2c3e50",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  fontSize: "0.95rem",
                }}
              >
                Forgot Password?
              </a>
            </div>

            <div style={{ marginTop: "8px" }}>
              <a
                href="/signup"
                style={{
                  color: "#2c3e50",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  fontSize: "0.95rem",
                }}
              >
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </FormContainer>
    </div>
  );
}
