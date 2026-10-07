"use client";

import { useState } from "react";

interface ReadingVocabularyClientProps {
  kidId: string;
  band: string;
  siteId: number;
  passageIndex: number;
  isFinalWorkout: boolean; // true when the workout decimal is .3
  questions: {
    question: string;
    choices: string[];
    correctIndex: number;
  }[];
}

export default function ReadingVocabularyClient({
  kidId,
  band,
  siteId,
  passageIndex,
  isFinalWorkout,
  questions,
}: ReadingVocabularyClientProps) {
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasQuestions = questions.length > 0;

  function selectAnswer(qIndex: number, choiceIndex: number) {
    const updated = [...answers];
    updated[qIndex] = choiceIndex;
    setAnswers(updated);
  }

  async function handleSubmit() {
    setError(null);

    if (hasQuestions && answers.includes(-1)) {
      setError("Please answer all questions.");
      return;
    }

    setSubmitting(true);

    try {
      // Compute score. If a workout has no vocab questions, count it as a
      // pass so the kid isn't stuck.
      const correctCount = questions.reduce((acc, q, i) => {
        return acc + (answers[i] === q.correctIndex ? 1 : 0);
      }, 0);

      const scorePercent = hasQuestions
        ? Math.round((correctCount / questions.length) * 100)
        : 100;

      const vocabularyPassed = scorePercent >= 70;

      console.log("[VOCAB CLIENT] submitting:", {
        band,
        siteId,
        passageIndex,
        answers,
        scorePercent,
        vocabularyPassed,
        isFinalWorkout,
      });

      // Submit to API
      const res = await fetch(`/kids/${kidId}/reading/vocabulary/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabularyScore: scorePercent,
          vocabularyPassed,
          band,
          siteId,
          passageIndex,
        }),
      });

      const result = await res.json();
      console.log("[VOCAB CLIENT] API result:", result);

      if (result.error) {
        console.log("[VOCAB CLIENT] error from API:", result.error);
        setError(result.error);
        setSubmitting(false);
        return;
      }

      // Final workout (.3) passed, or API says the workout is complete → results
      if (result.workoutComplete || (vocabularyPassed && isFinalWorkout)) {
        console.log("[VOCAB CLIENT] workout complete → redirect to results");
        window.location.href = `/kids/${kidId}/reading/results`;
        return;
      }

      // Otherwise → go wherever the API says to go next
      const next = result.redirect;
      console.log("[VOCAB CLIENT] next redirect:", next);

      if (!next) {
        setError("Could not determine the next step. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.href =
        `/kids/${kidId}/reading?` +
        `band=${next.band}&` +
        `siteId=${next.siteId}&` +
        `passageIndex=${next.passageIndex}`;
    } catch (err) {
      console.error("[VOCAB CLIENT] unexpected error:", err);
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

      {!hasQuestions && (
        <p style={{ marginBottom: "20px" }}>
          There are no vocabulary questions for this lesson yet. Let&apos;s
          keep going!
        </p>
      )}

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
        {submitting ? "Submitting..." : hasQuestions ? "Submit Answers" : "Continue"}
      </button>
    </div>
  );
}
