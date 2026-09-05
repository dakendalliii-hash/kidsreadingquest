"use client";

import { useState } from "react";

export default function ReadingComprehensionClient({
  kidId,
  passageText,
  band,
  siteId,
  passageIndex,
  questions,
}: {
  kidId: string;
  passageText: string;
  band: string;
  siteId: number;
  passageIndex: number;
  questions: {
    question: string;
    choices: string[];
    correctIndex: number;
  }[];
}) {
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectAnswer(qIndex: number, choiceIndex: number) {
    const updated = [...answers];
    updated[qIndex] = choiceIndex;
    setAnswers(updated);
  }

  async function handleSubmit() {
    setError(null);

    if (answers.includes(-1)) {
      setError("Please answer all questions.");
      return;
    }

    setSubmitting(true);

    try {
      // ⭐ Score comprehension
      let correctCount = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctIndex) correctCount++;
      });

      const comprehensionScore = Math.round(
        (correctCount / questions.length) * 100
      );
      const comprehensionPassed = comprehensionScore === 100;

      // ⭐ POST to server API route (RLS-safe)
      const res = await fetch(`/kids/${kidId}/reading/comprehension/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comprehensionScore,
          comprehensionPassed,
          band,
          siteId,
          passageIndex,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "Error saving comprehension results.");
        setSubmitting(false);
        return;
      }

      // ⭐ Redirect logic
      if (!comprehensionPassed) {
        window.location.href = `/kids/${kidId}/read-aloud?lang=en`;
        return;
      }

      window.location.href = `/kids/${kidId}/reading/vocabulary`;
    } catch (err) {
      console.error("[Comprehension] Error:", err);
      setError("Error saving comprehension results.");
    } finally {
      setSubmitting(false);
    }
  }

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
        Comprehension Questions
      </h2>

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          style={{
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#fefce8",
            borderRadius: "10px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "12px" }}>
            {qIndex + 1}. {q.question}
          </p>

          {q.choices.map((choice, cIndex) => (
            <div key={cIndex} style={{ marginBottom: "8px" }}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`q-${qIndex}`}
                  checked={answers[qIndex] === cIndex}
                  onChange={() => selectAnswer(qIndex, cIndex)}
                  style={{ marginRight: "10px" }}
                />
                {choice}
              </label>
            </div>
          ))}
        </div>
      ))}

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

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          width: "100%",
        }}
      >
        {submitting ? "Submitting..." : "Submit Answers"}
      </button>
    </div>
  );
}
