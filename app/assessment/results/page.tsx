"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import MetricsChart from "./MetricsChart";

export default function AssessmentResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = use(searchParams);

  const wpm = Number(params.wpm);
  const accuracy = Number(params.accuracy);
  const errors = Number(params.errors);
  const age = params.age;
  const band = params.band;
  const reason = params.reason || "";

  const hasResults =
    !isNaN(wpm) && !isNaN(accuracy) && !isNaN(errors) && age && band;

  let message = "";
  if (!hasResults) {
    message = "No assessment results available.";
  } else if (accuracy >= 95 && errors === 0) {
    message = "Outstanding";
  } else if (accuracy >= 80) {
    message = "Nice job";
  } else {
    message = "Do you want to try again?";
  }

  useEffect(() => {
    if (message === "Outstanding") {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [message]);

  const [screen, setScreen] = useState<
    | "celebration"
    | "Results"
    | "resultsNext"
    | "resultsFitnessProgram"
    | "trainingProgramOverview"
  >("celebration");

  useEffect(() => {
    if (screen === "celebration") {
      setScreen("Results");
    }
  }, [screen]);

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
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "16px",
          padding: "40px",
          width: "85%",
          maxWidth: "600px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {!hasResults && (
          <p
            style={{
              color: "black",
              fontSize: "1.1rem",
              textAlign: "center",
            }}
          >
            No assessment results available.
          </p>
        )}

        {/* ========================================================= */}
        {/* SCREEN — FIRST CARD: Reading Fitness Test Results         */}
        {/* ========================================================= */}
        {hasResults && screen === "Results" && (
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
              Reading Fitness Test Results
            </h1>

            <p
              style={{
                color: "black",
                fontSize: "1.2rem",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Your kid’s Reading Fitness Score is ready.  
              This score determines the correct Reading Fitness Program.
            </p>

            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#F1F3F5",
                border: "1px solid #CED4DA",
                fontSize: "0.95rem",
                color: "#212529",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <strong>Reading Fitness Score:</strong> {wpm}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Speed Range:</strong>{" "}
                {wpm < 60 ? "Developing" : wpm < 100 ? "Strong" : "Advanced"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Accuracy Range:</strong>{" "}
                {accuracy < 80 ? "Developing" : accuracy < 95 ? "Strong" : "Advanced"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Error Types Detected:</strong>{" "}
                {errors === 0 ? "None" : `${errors} total`}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Recommended Band Level:</strong> {band}
              </p>
            </div>

            <button
              onClick={() => setScreen("resultsNext")}
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
                marginTop: "10px",
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* SCREEN — ORIGINAL RESULTS CARD                            */}
        {/* ========================================================= */}
        {hasResults && screen === "resultsNext" && (
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
              Assessment Results
            </h1>

            <p
              style={{
                color: "black",
                fontSize: "1.2rem",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Band: <strong>{band}</strong> | Age: <strong>{age}</strong>
            </p>

            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#F1F3F5",
                border: "1px solid #CED4DA",
                fontSize: "0.95rem",
                color: "#212529",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <strong>Raw WPM:</strong> {wpm}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Raw Accuracy:</strong> {accuracy}%
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Raw Errors:</strong> {errors}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Reason:</strong> {reason || "(no reason string provided)"}
              </p>
            </div>

            <h2 style={{ color: "black", fontSize: "1.4rem", marginBottom: "10px" }}>
              Fluency Metrics
            </h2>

            <p style={{ color: "black", fontSize: "1rem" }}>
              Words Per Minute (WPM): <strong>{wpm}</strong>
            </p>
            <p style={{ color: "black", fontSize: "1rem" }}>
              Accuracy: <strong>{accuracy}%</strong>
            </p>
            <p style={{ color: "black", fontSize: "1rem" }}>
              Errors: <strong>{errors}</strong>
            </p>

            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
              <MetricsChart wpm={wpm} accuracy={accuracy} errors={errors} />
            </div>

            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor:
                  message === "Outstanding"
                    ? "#D4EDDA"
                    : message === "Nice job"
                    ? "#FFF3CD"
                    : "#F8D7DA",
                border:
                  message === "Outstanding"
                    ? "2px solid #28A745"
                    : message === "Nice job"
                    ? "2px solid #FFC107"
                    : "2px solid #DC3545",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                  color:
                    message === "Outstanding"
                      ? "#155724"
                      : message === "Nice job"
                      ? "#856404"
                      : "#721C24",
                }}
              >
                {message}
              </h3>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "1rem",
                  color:
                    message === "Outstanding"
                      ? "#155724"
                      : message === "Nice job"
                      ? "#856404"
                      : "#721C24",
                }}
              >
                {message === "Outstanding" &&
                  "You read amazingly well! You're ready for a bigger challenge!"}

                {message === "Nice job" &&
                  "You’re right on track. Keep practicing and you’ll grow even more!"}

                {message === "Do you want to try again?" &&
                  "Let’s give it another shot together. You can do this!"}
              </p>

              {message === "Do you want to try again?" && (
                <button
                  onClick={() => {
                    window.location.href = "/assessment";
                  }}
                  style={{
                    marginTop: "15px",
                    backgroundColor: "#DC3545",
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
                  Try Again
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: "35px",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "#E8F0FE",
                border: "2px solid #3B4A63",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  color: "#1A2A40",
                  textAlign: "center",
                }}
              >
                Parent Guidance
              </h3>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "1rem",
                  color: "#1A2A40",
                  lineHeight: "1.5",
                }}
              >
                • Celebrate your kid’s effort — progress grows with encouragement.  
                • If the score is lower, try reading together slowly and clearly.  
                • If the score is strong, explore stories in the recommended band.  
                • Keep sessions short and fun — consistency matters more than length.  
              </p>
            </div>

            <button
              onClick={() => setScreen("resultsFitnessProgram")}
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
                marginTop: "25px",
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* SCREEN — NEW CARD: Your Reading Fitness Program           */}
        {/* ========================================================= */}
        {hasResults && screen === "resultsFitnessProgram" && (
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
              Your Reading Fitness Program
            </h1>

            <p
              style={{
                color: "black",
                fontSize: "1.2rem",
                marginBottom: "20px",
                textAlign: "center",
                whiteSpace: "pre-wrap",
              }}
            >
              We’ve built a reading workout plan based on your kid’s Fitness Test results.  
              This program includes daily passages designed to strengthen reading skills step by step.
            </p>

            <button
              onClick={() => setScreen("trainingProgramOverview")}
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
                marginTop: "10px",
              }}
            >
              View Program
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* SCREEN — Reading Fitness Program Overview                 */}
        {/* ========================================================= */}
        {hasResults && screen === "trainingProgramOverview" && (
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
              Reading Fitness Program Overview
            </h1>

            <p
              style={{
                color: "black",
                fontSize: "1.2rem",
                marginBottom: "20px",
                textAlign: "center",
                whiteSpace: "pre-wrap",
              }}
            >
              Your kid’s program includes a sequence of reading workouts matched to their Band level and reading fitness.
              {"\n"}
              Program Includes:
              {"\n"}• Daily reading workouts
              {"\n"}• Three passages per workout
              {"\n"}• Vocabulary questions
              {"\n"}• Comprehension questions
              {"\n"}• Band-specific difficulty
              {"\n"}• Automatic difficulty adjustments
              {"\n"}• Progress tracking
              {"\n"}• Weekly summaries
            </p>

            <button
              onClick={() => {
                // Placeholder — next screen will be added after your confirmation
                setScreen("trainingProgramOverview");
              }}
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
                marginTop: "10px",
              }}
            >
              Start First Workout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
