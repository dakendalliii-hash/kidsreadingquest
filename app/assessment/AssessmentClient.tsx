"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MicReader from "@/components/MicReader";

export default function AssessmentClient() {
  const searchParams = useSearchParams();
  const band = searchParams.get("band") || "";
  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const age = Number(searchParams.get("age")) || null;

  const hasPassage = band && text;
  const [startAssessment, setStartAssessment] = useState(false);
  const router = useRouter();

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
        {!hasPassage && (
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

        {hasPassage && (
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

            {!startAssessment && (
              <button
                onClick={() => setStartAssessment(true)}
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
                Read Aloud
              </button>
            )}

            {startAssessment && (
              <MicReader
                passageText={text}
                kidId="assessment"
                language="english"
                onSuccessRedirect={(url: string) => {
                  router.push(`${url}&age=${age}&band=${band}`);
                }}
              />
            )}

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
  );
}
