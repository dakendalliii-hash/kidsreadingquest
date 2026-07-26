export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";

/* ============================================================
   SERVER ACTION — FIXED SIGNATURE + SSR REDIRECT
   ============================================================ */
async function handleReset(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`;

  console.log("RESET-PW redirectTo:", redirectUrl);
  console.log("RESET-PW email:", email);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("RESET-PW ERROR:", error);

    if (error.code === "over_email_send_rate_limit") {
      return redirect("/forgot-password?status=throttle");
    }

    return redirect("/forgot-password?status=error");
  }

  console.log("RESET-PW: Email request sent.");
  return redirect("/forgot-password?status=success");
}

/* ============================================================
   PAGE COMPONENT — SHOWS CARD INSTEAD OF FORM
   ============================================================ */
export default async function ForgotPasswordPage(
  { searchParams }: { searchParams: Promise<Record<string, string | undefined>> }
) {
  const params = await searchParams;
  const status = params.status;

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
          className="card-container"
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

          {status === "success" && (
            <>
              <h1 style={{ color: "black", fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
                Check Your Email
              </h1>
              <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "25px" }}>
                A password reset link has been sent.
              </p>

              <a href="/login" className="btn-primary form-single-button full-card-button">
                Return to Login
              </a>
            </>
          )}

          {status === "throttle" && (
            <>
              <h1 style={{ color: "black", fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
                Too Many Requests
              </h1>
              <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "25px" }}>
                You’ve requested too many password resets.  
                Try resetting the password at least 24 hours later.
              </p>

              <a href="/login" className="btn-primary form-single-button full-card-button">
                Return to Login
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <h1 style={{ color: "black", fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
                Error Sending Reset Link
              </h1>
              <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "25px" }}>
                Something went wrong. Please try again later.
              </p>

              <a href="/login" className="btn-primary form-single-button full-card-button">
                Return to Login
              </a>
            </>
          )}

          {!status && (
            <>
              <h1 style={{ color: "black", fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
                Reset Password
              </h1>
              <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "25px" }}>
                Enter your email and click the button.
                <b> Supabase</b> will send you a reset link.
              </p>

              <form action={handleReset}>
                <div style={{ marginBottom: "20px", textAlign: "left" }}>
                  <label
                    htmlFor="email"
                    style={{ color: "black", fontWeight: "bold", display: "block", marginBottom: "5px" }}
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

                <button
                  type="submit"
                  className="btn-primary form-single-button full-card-button"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          )}

        </div>
      </FormContainer>
    </div>
  );
}
