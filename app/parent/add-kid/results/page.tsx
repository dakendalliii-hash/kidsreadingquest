export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddKidResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Next.js 16 requires awaiting searchParams
  const params = await searchParams;

  // Extract metrics from query params
  const wpm = params.wpm ?? "";
  const accuracy = params.accuracy ?? "";
  const errors = params.errors ?? "";
  const totalWords = params.totalWords ?? "";
  const totalSeconds = params.totalSeconds ?? "";
  const placement = params.placement ?? "";
  const reason = params.reason ?? "";

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
            Your child’s reading assessment is complete.  
            Here are the results:
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
              <li><strong>Placement Band:</strong> {placement}</li>
              <li><strong>Reason:</strong> {reason}</li>
            </ul>
          </div>

          <div style={{ marginTop: "32px" }}>
            <a
              href="/signup/options"
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
              Continue Setup
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
