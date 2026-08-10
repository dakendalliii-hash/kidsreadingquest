export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function handleConfirmationReceived() {
  "use server";

  const cookieStore = await cookies();

  // Mark this as a NEW USER signup flow
  cookieStore.set("signup_flow", "new-user", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 30,
  });

  // User must log in before seeing authenticated content
  redirect("/login");
}

export default async function SignupConfirmPage() {
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
            Check Your Email
          </h1>

          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >
            We’ve sent a confirmation link to your email. Please click the link
            to verify your account.
          </p>

          <form action={handleConfirmationReceived} style={{ marginTop: "20px" }}>
            <button
              type="submit"
              className="btn-primary form-single-button"
              style={{
                width: "100%",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Confirmation Email Received
            </button>
          </form>

          <div style={{ marginTop: "20px" }}>
            <span style={{ color: "black" }}>
              Already confirmed and logged in?{" "}
              <a
                href="/login"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                Go to Login
              </a>
            </span>
          </div>
        </div>
      </FormContainer>
    </div>
  );
}
