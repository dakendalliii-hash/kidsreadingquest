"use client";

import { useState } from "react";

interface ReadingVocabularyClientProps {
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
}

export default function ReadingVocabularyClient({
  kidId,
  passageText,
  band,
  siteId,
  passageIndex,
  questions,
}: ReadingVocabularyClientProps) {
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
    setSubmitting(true);
    setError(null);

    try {
      const correctCount = questions.reduce((acc, q, i) => {
        return acc + (answers[i] === q.correctIndex ? 1 : 0);
      }, 0);

      const scorePercent = Math.round(
        (correctCount / questions.length) * 100
      );

      const res = await fetch(`/kids/${kidId}/reading/vocabulary/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          questions,
          band,
          siteId,
          passageIndex,
        }),
      });

      const result = await res.json();

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      window.location.href = `/kids/${kidId}/reading/results`;
    } catch (err) {
      console.error(err);
      setError("Unexpected error submitting vocabulary.");
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
        Vocabulary Questions
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
