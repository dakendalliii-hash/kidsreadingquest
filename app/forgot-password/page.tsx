export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import FormContainer from "@/components/FormContainer";

async function handleReset(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  });
}

export default function ForgotPasswordPage() {
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
            Reset Password
          </h1>

          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >

Enter your email and we’ll send you a reset link. 
Then after opening the email, click on reset link.  
You will receive another email with a verification code from Vercel. 
After entering the code, you will then be able to enter a new password. 

          </p>


          <form action={handleReset}>
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

            <button
              type="submit"
              className="btn-primary form-single-button"
              style={{
                width: "100%",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </FormContainer>
    </div>
  );
}
