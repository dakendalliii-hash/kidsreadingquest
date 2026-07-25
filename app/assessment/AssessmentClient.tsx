"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MicReader from "@/components/MicReader";

export default function AssessmentClient() {
  const searchParams = useSearchParams();
  const band = searchParams.get("band") || "";
  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const age = Number(searchParams.get("age")) || null;

  const hasPassage = band && text;
  const router = useRouter();

  // ⭐ NEW: Safe redirect state
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // ⭐ NEW: Hydration-safe navigation
  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [redirectUrl, router]);

  // ⭐ Screen flow state
  // Screens: "age", "before", "welcome", "instructions", "passage"
  const [screen, setScreen] = useState(hasPassage ? "before" : "age");

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      {/* ⭐ FIX: Add missing dark overlay layer */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        {/* ⭐ Existing white card preserved exactly */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "600px",
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* ========================================================= */}
          {/* SCREEN 1 — AGE SELECTION                                 */}
          {/* ========================================================= */}
          {screen === "age" && (
            <>
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Assessment Test
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                  textAlign: "center",
                }}
              >
                Enter your kid’s age to begin the assessment.
              </p>

              <form action="/assessment/start" method="POST">
                <select
                  name="age"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }}
                >
                  <option value="">Select age</option>
                  {[4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="btn-primary form-single-button"
                  style={{
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Begin Assessment
                </button>
              </form>
            </>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2 — BEFORE YOU BEGIN                              */}
          {/* ========================================================= */}
          {screen === "before" && hasPassage && (
            <>
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Before You Begin
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1rem",
                  marginBottom: "25px",
                  whiteSpace: "pre-wrap",
                }}
              >
                This short test measures your kid’s reading fitness so we can
                build the right training program.

                {"\n\n"}Before continuing:
                {"\n"}Make sure your microphone is working.
                {"\n"}Your kid should sit close to the screen.
                {"\n"}Background noise should be minimal.
                {"\n"}If you have questions, visit the FAQ.
                {"\n"}For microphone setup help, see Technical Instructions.
              </p>

              <button
                onClick={() => setScreen("welcome")}
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
                  marginTop: "20px",
                }}
              >
                Continue to Fitness Test
              </button>
            </>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3 — WELCOME                                        */}
          {/* ========================================================= */}
          {screen === "welcome" && (
            <>
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Welcome
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                }}
              >
                Welcome to your Reading Fitness Test! You’ll read a short
                passage out loud. Just do your best.
              </p>

              <button
                onClick={() => setScreen("instructions")}
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
                  marginTop: "20px",
                }}
              >
                Start
              </button>
            </>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4 — INSTRUCTIONS                                   */}
          {/* ========================================================= */}
          {screen === "instructions" && (
            <>
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Instructions
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                }}
              >
                You’ll see a short story on the screen. Read it out loud from
                start to finish. If you get stuck, keep going.
              </p>

              <button
                onClick={() => setScreen("passage")}
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
                  marginTop: "20px",
                }}
              >
                Begin Reading
              </button>
            </>
          )}

          {/* ========================================================= */}
          {/* SCREEN 5 — PASSAGE + MICREADER                            */}
          {/* ========================================================= */}
          {screen === "passage" && (
            <>
              <h1
                style={{
                  color: "black",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  color: "black",
                  fontSize: "1rem",
                  marginBottom: "25px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {text}
              </p>

              <MicReader
                passageText={text}
                kidId="assessment"
                language="english"
                onSuccessRedirect={(url: string) => {
                  setRedirectUrl(`${url}&age=${age}&band=${band}`);
                }}
              />

              <p
                style={{
                  color: "black",
                  fontSize: "0.95rem",
                  marginTop: "30px",
                  opacity: 0.85,
                  textAlign: "center",
                }}
              >
                (Recording is deleted for privacy after scoring.)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
