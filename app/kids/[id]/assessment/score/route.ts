import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();

  const wpm = Number(formData.get("wpm"));
  const accuracy = Number(formData.get("accuracy"));
  const errors = Number(formData.get("errors"));
  const age = Number(formData.get("age"));
  const band = formData.get("band") as string;

  let expectedBand = "";
  if (age <= 5) expectedBand = "A 4-5";
  else if (age <= 7) expectedBand = "B 6-7";
  else expectedBand = "C 8-9";

  let placement = expectedBand;
  let reason = "This is the correct starting band.";

  if (accuracy < 85 || errors > 10) {
    reason = "Below expected fluency for this band.";
  } else if (band !== expectedBand) {
    placement = band;
    reason = "Ready for a higher band.";
  }

  redirect(
    `/assessment/results?placement=${encodeURIComponent(
      placement
    )}&reason=${encodeURIComponent(reason)}&wpm=${wpm}&accuracy=${accuracy}&errors=${errors}`
  );
}
