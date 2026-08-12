export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { metrics, band } = body;

    const accuracy = Number(metrics.accuracy);
    const errors = Number(metrics.errors);

    // ⭐ Determine next band in sequence
    const bandOrder = ["A 4-5", "B 6-7", "C 8-9"];
    const currentIndex = bandOrder.indexOf(band);

    let placement = band;
    let reason = "Performance meets expectations for this band.";

    // ⭐ Rule 1: If kid is already in highest band → stay there
    if (band === "C 8-9") {
      placement = "C 8-9";
      reason = "This is the highest band. Continue here.";
    }
    // ⭐ Rule 2: If accuracy > 95 AND errors < 5 → recommend next band
    else if (accuracy > 95 && errors < 5) {
      const nextBand = bandOrder[currentIndex + 1];
      placement = nextBand;
      reason = "Strong fluency. Ready for a higher band.";
    }
    // ⭐ Rule 3: Otherwise → stay in current band
    else {
      placement = band;
      reason = "Start with this band to build fluency.";
    }

    return new Response(
      JSON.stringify({
        placement,
        reason,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Assessment score error:", err);

    return new Response(
      JSON.stringify({
        placement: "",
        reason: "Server error processing assessment.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
