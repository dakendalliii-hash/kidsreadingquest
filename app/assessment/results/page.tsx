"use client";

import { use } from "react";

export default function AssessmentResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // ✅ unwrap the Promise using React.use()
  const params = use(searchParams);

  const wpm = Number(params.wpm);
  const accuracy = Number(params.accuracy);
  const errors = Number(params.errors);
  const age = params.age;
  const band = params.band;

  const hasResults =
    !isNaN(wpm) && !isNaN(accuracy) && !isNaN(errors) && age && band;

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

        {hasResults && (
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

            <h2
              style={{
                color: "black",
                fontSize: "1.4rem",
                fontWeight: "bold",
                marginTop: "30px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
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

            <div
              style={{
                marginTop: "35px",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor:
                  accuracy >= 85 ? "#D4EDDA" : "#F8D7DA",
                border:
                  accuracy >= 85
                    ? "2px solid #28A745"
                    : "2px solid #DC3545",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                  color: accuracy >= 85 ? "#155724" : "#721C24",
                }}
              >
                {accuracy >= 85
                  ? "Outstanding!"
                  : "Do you want to try again?"}
              </h3>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "1rem",
                  color: accuracy >= 85 ? "#155724" : "#721C24",
                }}
              >
                {accuracy >= 85
                  ? "You read amazingly well! You're ready for a bigger challenge!"
                  : "Let’s give it another shot together. You can do this!"}
              </p>

              {accuracy < 85 && (
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
          </>
        )}
      </div>
    </div>
  );
}
