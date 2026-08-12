export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssessmentResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id: kidId } = await params;
  const query = await searchParams;

  // Extract metrics EXACTLY as AssessmentClient sends them
  const wpm = query.wpm ?? "";
  const accuracy = query.accuracy ?? "";
  const errors = query.errors ?? "";

  const totalWords = query.totalWords ?? "";
  const totalSeconds = query.totalSeconds ?? "";

  const mispronounced = query.mispronounced ?? "";
  const skipped = query.skipped ?? "";
  const inserted = query.inserted ?? "";
  const repeated = query.repeated ?? "";

  const placement = query.placement ?? "";
  const reason = query.reason ?? "";

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
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Assessment Results
          </h1>

          <p style={{ marginBottom: "24px", fontSize: "1.1rem" }}>
            Here are the reading metrics for this assessment.
          </p>

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
            </ul>
          </div>

          <div style={{ marginTop: "32px" }}>
            <a
              href={`/kids/${kidId}`}
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
