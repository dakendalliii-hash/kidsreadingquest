"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard from "@/components/AuthCard";

export default function SignupOptionsPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<
    | "options"
    | "trainingPlans"
    | "assessment"
    | "founderSelected"
    | "monthlySelected"
    | "launchFitnessTest"
  >("options");

  const [kidId, setKidId] = useState<string | null>(null);

  // Read new_kid_id from cookies on the client
  useEffect(() => {
    try {
      const all = document.cookie.split(";").map((c) => c.trim());
      const entry = all.find((c) => c.startsWith("new_kid_id="));
      if (entry) {
        const value = entry.split("=")[1];
        if (value) {
          setKidId(value);
        }
      }
    } catch (err) {
      console.error("Error reading new_kid_id cookie:", err);
    }
  }, []);

  const launchAssessment = () => {
    if (!kidId) {
      console.error("No kidId found for assessment launch.");
      return;
    }
    router.push(`/kids/${kidId}/assessment`);
  };

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
      <div className="page-container text-black">
        {/* SCREEN 1 — TWO SIDE-BY-SIDE OPTION CARDS */}
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
                className="btn-blue full-card-button"
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
                className="btn-blue full-card-button"
              >
                Select Training Plan
              </button>
            </AuthCard>
          </div>
        )}

        {/* SCREEN 2 — TRAINING PROGRAM TWO-CARD SCREEN */}
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
                Limited early-access plan for the first 50 families.
              </p>

              <button
                className="btn-blue full-card-button"
                onClick={() => setScreen("founderSelected")}
              >
                Select Founder Plan
              </button>
            </AuthCard>

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
                className="btn-blue full-card-button"
                onClick={() => setScreen("monthlySelected")}
              >
                Select Monthly Plan
              </button>
            </AuthCard>
          </div>
        )}

        {/* SCREEN 3 — ASSESSMENT FLOW ENTRY */}
        {screen === "assessment" && (
          <AuthCard>
            <h2
              style={{
                color: "black",
                fontSize: "1.6rem",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Ready to Start the Fitness Test
            </h2>
            <p
              style={{
                color: "black",
                fontSize: "1rem",
                marginBottom: "20px",
              }}
            >
              We’ll guide your kid through a short reading assessment to find the
              right starting band.
            </p>
            <button
              className="btn-green full-card-button"
              onClick={launchAssessment}
            >
              Launch Fitness Test
            </button>
          </AuthCard>
        )}

        {/* SCREEN 4 — FOUNDER SELECTED */}
        {screen === "founderSelected" && (
          <AuthCard>
            <h2
              style={{
                color: "black",
                fontSize: "1.6rem",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Founder Plan Selected
            </h2>
            <button
              className="btn-blue full-card-button"
              onClick={() => setScreen("launchFitnessTest")}
            >
              Take the Fitness Test Now
            </button>
          </AuthCard>
        )}

        {/* SCREEN 5 — MONTHLY SELECTED */}
        {screen === "monthlySelected" && (
          <AuthCard>
            <h2
              style={{
                color: "black",
                fontSize: "1.6rem",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Monthly Plan Selected
            </h2>
            <button
              className="btn-blue full-card-button"
              onClick={() => setScreen("launchFitnessTest")}
            >
              Take the Fitness Test Now
            </button>
          </AuthCard>
        )}

        {/* SCREEN 6 — LAUNCH FITNESS TEST */}
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
              className="btn-green full-card-button"
              onClick={launchAssessment}
            >
              Take the Fitness Test Now
            </button>
          </AuthCard>
        )}
      </div>
    </div>
  );
}
