// ============================================================================
// FILE: /app/kids/[id]/assessment/results/page.tsx
// PURPOSE:
//   Server-rendered page that displays the results of a kid's reading assessment.
//   Metrics are passed via URL query parameters from the AssessmentClient.
//   This page extracts those metrics, displays them in a styled results card,
//   and provides navigation back to the parent dashboard.
//
// NOTES:
//   - This page is dynamic and never cached.
//   - All metrics shown here come directly from the assessment flow.
//   - No database writes occur in this file (display-only).
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssessmentResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  // --------------------------------------------------------------------------
  // Extract kid ID from dynamic route parameters
  // --------------------------------------------------------------------------
  const { id: kidId } = await params;

  // --------------------------------------------------------------------------
  // Extract all assessment metrics from query parameters.
  // These values were appended by the AssessmentClient after scoring.
  // --------------------------------------------------------------------------
  const query = await searchParams;

  // Core reading metrics
  const wpm = query.wpm ?? "";
  const accuracy = query.accuracy ?? "";
  const errors = query.errors ?? "";

  const totalWords = query.totalWords ?? "";
  const totalSeconds = query.totalSeconds ?? "";

  // Detailed error categories
  const mispronounced = query.mispronounced ?? "";
  const skipped = query.skipped ?? "";
  const inserted = query.inserted ?? "";
  const repeated = query.repeated ?? "";

  // Placement recommendation
  const placement = query.placement ?? "";
  const reason = query.reason ?? "";

  const transcript = query.transcript ?? "";



  // --------------------------------------------------------------------------
  // RENDER RESULTS PAGE
  // This section displays all assessment metrics in a styled card.
  // --------------------------------------------------------------------------
  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            color: "black",
          }}
        >
          {/* --------------------------------------------------------------
              Header Section
              -------------------------------------------------------------- */}
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Assessment Results
          </h1>

          <p style={{ marginBottom: "24px", fontSize: "1.1rem" }}>
            Here are the reading metrics for this assessment.
          </p>

          {/* --------------------------------------------------------------
              Metrics Display Section
              -------------------------------------------------------------- */}
          <div
            style={{
              textAlign: "left",
              backgroundColor: "#fefce8",
              borderRadius: "12px",
              padding: "24px",
              fontFamily: "Arial, sans-serif",
              color: "black",
              lineHeight: "1.6",
            }}
          >
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              <li><strong>Words per Minute:</strong> {wpm}</li>
              <li><strong>Accuracy:</strong> {accuracy}%</li>
              <li><strong>Errors:</strong> {errors}</li>

              <li><strong>Total Words:</strong> {totalWords}</li>
              <li><strong>Total Time:</strong> {totalSeconds} seconds</li>

              <li><strong>Mispronounced:</strong> {mispronounced}</li>
              <li><strong>Skipped:</strong> {skipped}</li>
              <li><strong>Inserted:</strong> {inserted}</li>
              <li><strong>Repeated:</strong> {repeated}</li>

              <li><strong>Placement Band:</strong> {placement}</li>
              <li><strong>Reason:</strong> {reason}</li>
              <li><strong>What we heard you say:</strong> {transcript}</li>
            </ul>
          </div>

          {/* --------------------------------------------------------------
              Navigation Section
              -------------------------------------------------------------- */}
          <div style={{ marginTop: "32px" }}>
            <a
              href={`/kids/${kidId}/kid-profile/from-existing`}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Back to Kid Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
