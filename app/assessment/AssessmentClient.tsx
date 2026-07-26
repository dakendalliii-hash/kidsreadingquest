"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MicReader from "@/components/MicReader";

export default function AssessmentClient() {
  const searchParams = useSearchParams();
  const kidId = searchParams.get("kid_id") || "";
  const band = searchParams.get("band") || "";
  const title = searchParams.get("title") || "Reading Fitness Test";
  const text = searchParams.get("text") || "Read the passage out loud when ready.";

  const hasKid = Boolean(kidId);
  const router = useRouter();

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [redirectUrl, router]);

  // Screens: "age", "before", "welcome", "instructions", "passage"
  const [screen, setScreen] = useState(hasKid ? "before" : "age");

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
          {/* SCREEN 1 — NAME + AGE                                    */}
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
                Enter your kid’s name and age to begin the assessment.
              </p>

              <form action="/assessment/start" method="POST">
                <input
                  type="text"
                  name="kid_name"
                  required
                  placeholder="Kid’s name"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }}
                />

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
          {screen === "before" && hasKid && (
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
              </p>

              <p
                style={{
                  color: "black",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Before continuing:
              </p>

              <ul
                style={{
                  color: "black",
                  fontSize: "1rem",
                  marginBottom: "25px",
                  paddingLeft: "20px",
                  listStyleType: "disc",
                  textAlign: "left",
                }}
              >
                <li>Make sure your microphone is working.</li>
                <li>Your kid should sit close to the screen.</li>
                <li>Background noise should be minimal.</li>
                <li>If you have questions, visit the FAQ.</li>
                <li>For microphone setup help, see Technical Instructions.</li>
              </ul>

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
                kidId={kidId}
                language="english"
                onSuccessRedirect={() => {
                  const nextUrl = `/kids/${kidId}/read-aloud?band=${band}&site_id=1&passage_index=1`;
                  setRedirectUrl(nextUrl);
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
