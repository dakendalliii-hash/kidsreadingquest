export const runtime = "nodejs";

import FormContainer from "@/components/FormContainer";
import AuthCard from "@/components/AuthCard";
import { handleSignUp } from "./actions"; // ✔ moved out of page file

export default function SignUpPage() {
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
        <div className="page-container">
          <AuthCard>
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

              {/* Password */}
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
                  Password must be at least <strong>10 characters</strong>. You may
                  use <strong>letters, numbers, spaces, and symbols</strong>.
                </p>
              </div>

              {/* Confirm Password */}
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
          </AuthCard>
        </div>
      </FormContainer>
    </div>
  );
}
