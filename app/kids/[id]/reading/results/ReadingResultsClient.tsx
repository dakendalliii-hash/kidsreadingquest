"use client";

import React from "react";

interface ReadingResultsClientProps {
  kidId: string;
  band: string;
  siteId: number;
  passageIndex: number;
  fluencyAttempt: any;
  comprehensionAttempt: any;
  vocabularyAttempt: any;
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

  return (
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
        }}
      >
        Reading Results
      </h2>

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
          <strong>Fluency Passed:</strong>{" "}
          {fluencyPassed ? "Yes" : "No"}
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
          <strong>Score:</strong>{" "}
          {comprehensionScore ?? "N/A"}%
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
          <strong>Score:</strong>{" "}
          {vocabularyScore ?? "N/A"}%
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
    </div>
  );
}
