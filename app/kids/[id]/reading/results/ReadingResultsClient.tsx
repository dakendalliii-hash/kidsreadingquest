"use client";

import React, { useState } from "react";

interface ReadingResultsClientProps {
  kidId: string;
  band: string;
  siteId: number;
  passageIndex: number;
  fluencyAttempt: any;
  comprehensionAttempt: any;
  vocabularyAttempt: any;
}

function buttonStyle(
  backgroundColor: string,
  color: string,
  disabled = false
): React.CSSProperties {
  return {
    backgroundColor,
    color,
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.7 : 1,
    fontWeight: "bold",
    fontSize: "1rem",
    flex: 1,
    minWidth: "160px",
  };
}

export default function ReadingResultsClient({
  kidId,
  band,
  siteId,
  passageIndex,
  fluencyAttempt,
  comprehensionAttempt,
  vocabularyAttempt,
}: ReadingResultsClientProps) {
  // Results stay hidden until the kid (or parent) asks to see them
  const [showResults, setShowResults] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ All attempts share the same unified metrics object
  const metrics = fluencyAttempt?.metrics || {};

  const {
    accuracy,
    wpm,
    errors,
    totalWords,
    totalSeconds,
    transcript,
    comprehensionScore,
    vocabularyScore,
    fluencyPassed,
    comprehensionPassed,
    vocabularyPassed,
  } = metrics;

  async function handleNextWorkout() {
    setError(null);
    setAdvancing(true);

    console.log("[RESULTS CLIENT] Next Workout clicked, calling advance API");
    console.log("[RESULTS CLIENT] current:", { band, siteId, passageIndex });

    try {
      const res = await fetch(`/kids/${kidId}/reading/api/progress/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "en" }),
      });

      const next = await res.json();

      // ✅ Fallback if redirect missing
      const redirectUrl =
        next?.redirect ||
        `/kids/${kidId}/reading?band=${band}&siteId=${siteId}&passageIndex=${passageIndex}`;

      window.location.href = redirectUrl;
    } catch (err) {
      console.error("[RESULTS CLIENT] advance API error:", err);
      setError("Could not start the next workout. Please try again.");
      setAdvancing(false);
    }
  }

  function handleEndSession() {
    console.log("[RESULTS CLIENT] End Session clicked");
    window.location.href = "/parent";
  }

  return (
<div style={{ paddingTop: "60px", paddingBottom: "10px" }}>

    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        maxWidth: "900px",
        margin: "0 auto",
        color: "black",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          fontSize: "1.6rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Congratulations!!  You finished a workout 😊
      </h2>

      {/* ⭐ Buttons are shown first */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setShowResults((prev) => !prev)}
          style={buttonStyle("#2196F3", "white")}
        >
          {showResults ? "Hide Results" : "Show Results"}
        </button>

        <button
          onClick={handleNextWorkout}
          disabled={advancing}
          style={buttonStyle("#4CAF50", "white", advancing)}
        >
          {advancing ? "Loading..." : "Next Workout"}
        </button>

        <button onClick={handleEndSession} style={buttonStyle("#ccc", "black")}>
          End Session
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffe6e6",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "black",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}

      {/* ⭐ Results appear only after "Show Results" is clicked */}
      {showResults && (
        <>
          {/* ⭐ Fluency Section */}
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#e8f5fe",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>
              Fluency Results
            </h3>

            <p><strong>Accuracy:</strong> {accuracy ?? "N/A"}%</p>
            <p><strong>Words Per Minute:</strong> {wpm ?? "N/A"}</p>
            <p><strong>Total Words:</strong> {totalWords ?? "N/A"}</p>
            <p><strong>Total Seconds:</strong> {totalSeconds ?? "N/A"}</p>
            <p><strong>Errors:</strong> {errors ?? "N/A"}</p>

            <p style={{ marginTop: "10px" }}>
              <strong>Fluency Passed:</strong> {fluencyPassed ? "Yes" : "No"}
            </p>
          </div>

          {/* ⭐ Comprehension Section */}
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#fefce8",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>
              Comprehension Results
            </h3>

            <p>
              <strong>Score:</strong> {comprehensionScore ?? "N/A"}%
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>Comprehension Passed:</strong>{" "}
              {comprehensionPassed ? "Yes" : "No"}
            </p>
          </div>

          {/* ⭐ Vocabulary Section */}
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#e8ffe8",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>
              Vocabulary Results
            </h3>

            <p>
              <strong>Score:</strong> {vocabularyScore ?? "N/A"}%
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>Vocabulary Passed:</strong>{" "}
              {vocabularyPassed ? "Yes" : "No"}
            </p>
          </div>

          {/* ⭐ Transcript (optional) */}
          {transcript && (
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f0f0f0",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ fontWeight: "bold", marginBottom: "12px" }}>
                Read‑Aloud Transcript
              </h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  backgroundColor: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                {transcript}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
</div>
  );
}
