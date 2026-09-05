"use client";

import { useState } from "react";

export default function VocabularyQuiz({
  questions,
  onSubmit,
}: {
  questions: {
    id: string;
    question_type: string;
    question_text: string;
    correct_answer: string;
  }[];
  onSubmit: (answers: { questionId: string; kidAnswer: string; isCorrect: boolean }[]) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(questionId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleSubmit() {
    const formatted = questions.map((q) => {
      const kidAnswer = answers[q.id] || "";
      const isCorrect =
        kidAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

      return {
        questionId: q.id,
        kidAnswer,
        isCorrect,
      };
    });

    setSubmitted(true);
    onSubmit(formatted);
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "95%",
        maxWidth: "1000px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        marginTop: "20px",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Vocabulary Questions
      </h2>

      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            marginBottom: "20px",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              fontSize: "1.1rem",
            }}
          >
            {q.question_text}
          </p>

          <input
            type="text"
            value={answers[q.id] || ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Type your answer..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
            disabled={submitted}
          />
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            width: "100%",
            marginTop: "10px",
          }}
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Answers submitted!
        </p>
      )}
    </div>
  );
}
