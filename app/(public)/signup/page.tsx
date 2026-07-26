"use client";

export const runtime = "nodejs";

import { useState, useEffect } from "react";
import FormContainer from "@/components/FormContainer";
import AuthCard from "@/components/AuthCard";
import { handleSignUp } from "./actions";
import AssessmentClient from "@/app/assessment/AssessmentClient";

export default function SignUpPage() {
  const [screen, setScreen] = useState<
    | "signup"
    | "options"
    | "assessment"
    | "trainingPlans"
    | "founderSelected"
    | "monthlySelected"
    | "launchFitnessTest"
  >("signup");

  const [errorMessage, setErrorMessage] = useState("");

  // Temporary local count until Supabase integration
  const [founderCount] = useState(0);
  const founderLimitReached = founderCount >= 55;

  // Redirect founderSelected/monthlySelected to launchFitnessTest safely
  useEffect(() => {
    if (screen === "founderSelected" || screen === "monthlySelected") {
      setScreen("launchFitnessTest");
    }
  }, [screen]);

  async function handleClientSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await handleSignUp(formData);

    if (!result || result.success !== true) {
      setErrorMessage(result?.error || "Signup failed.");
      return;
    }

    setScreen("options");
  }

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
          {/* SCREEN 1 — SIGN UP FORM */}
          {screen === "signup" && (
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

              {errorMessage && (
                <p style={{ color: "red", marginBottom: "15px" }}>
                  {errorMessage}
                </p>
              )}

              <form onSubmit={handleClientSignUp}>
                {/* Email */}
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
                    Password must be at least <strong>10 characters</strong>. You
                    may use <strong>letters, numbers, spaces, and symbols</strong>.
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
          )}

          {/* SCREEN 2 — TWO SIDE-BY-SIDE OPTION CARDS */}
          {screen === "options" && (
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* LEFT CARD — FREE FITNESS TEST */}
              <AuthCard>
                <h2
                  style={{
                    color: "black",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Take a FREE Reading Fitness Test
                </h2>

                <p
                  style={{
                    color: "black",
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }}
                >
                  Find out your kid’s reading level and get a free evaluation.
                </p>

                <button
                  onClick={() => setScreen("assessment")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    width: "95%",
                    whiteSpace: "nowrap",
                  }}
                >
                  Start Free Fitness Test
                </button>
              </AuthCard>

              {/* RIGHT CARD — TRAINING PLAN */}
              <AuthCard>
                <h2
                  style={{
                    color: "black",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Choose a Reading Training Plan
                </h2>

                <p
                  style={{
                    color: "black",
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }}
                >
                  Unlock daily reading workouts and progress tracking.
                </p>

                <button
                  onClick={() => setScreen("trainingPlans")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    width: "95%",
                    whiteSpace: "nowrap",
                  }}
                >
                  Select Training Plan
                </button>
              </AuthCard>
            </div>
          )}

          {/* SCREEN 3 — TRAINING PROGRAM TWO-CARD SCREEN */}
          {screen === "trainingPlans" && (
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* LEFT CARD — FOUNDER PLAN */}
              <div style={{ position: "relative" }}>
                <AuthCard>
                  <h2
                    style={{
                      color: "black",
                      fontSize: "1.6rem",
                      fontWeight: "bold",
                      marginBottom: "10px",
                    }}
                  >
                    Founder Plan ($0/month for life)
                  </h2>

                  <p
                    style={{
                      color: "black",
                      fontSize: "1rem",
                      marginBottom: "20px",
                    }}
                  >
                    Limited early-access plan for the first 50 families. (Will
                    grey out automatically once 50 parents select it.)
                  </p>

                  <button
                    disabled={founderLimitReached}
                    onClick={() => {
                      if (!founderLimitReached) setScreen("founderSelected");
                    }}
                    style={{
                      backgroundColor: founderLimitReached ? "#999" : "#4CAF50",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: founderLimitReached ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      width: "95%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {founderLimitReached
                      ? "Founder Plan Full"
                      : "Select Founder Plan"}
                  </button>
                </AuthCard>

                {founderLimitReached && <div className="card-disabled-overlay" />}
              </div>

              {/* RIGHT CARD — MONTHLY PLAN */}
              <AuthCard>
                <h2
                  style={{
                    color: "black",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Monthly Plan ($50/month)
                </h2>

                <p
                  style={{
                    color: "black",
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }}
                >
                  Standard Reading Gym membership.
                </p>

                <button
                  onClick={() => setScreen("monthlySelected")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    width: "95%",
                    whiteSpace: "nowrap",
                  }}
                >
                  Select Monthly Plan
                </button>
              </AuthCard>
            </div>
          )}

          {/* SCREEN 4 — ASSESSMENT FLOW */}
          {screen === "assessment" && <AssessmentClient />}

          {/* SCREEN 5 — FOUNDER SELECTED */}
          {screen === "founderSelected" && (
            <AuthCard>
              <>
                {/* Redirect handled by useEffect */}
              </>
            </AuthCard>
          )}

          {/* SCREEN 6 — MONTHLY SELECTED */}
          {screen === "monthlySelected" && (
            <AuthCard>
              <>
                {/* Redirect handled by useEffect */}
              </>
            </AuthCard>
          )}

          {/* SCREEN 7 — LAUNCH FITNESS TEST */}
          {screen === "launchFitnessTest" && (
            <AuthCard>
              <h2
                style={{
                  color: "black",
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                }}
              >
                Plan Is Set
              </h2>

              <button
                onClick={() => setScreen("assessment")}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  width: "95%",
                  whiteSpace: "nowrap",
                }}
              >
                Take the Fitness Test Now
              </button>
            </AuthCard>
          )}
        </div>
      </FormContainer>
    </div>
  );
}
