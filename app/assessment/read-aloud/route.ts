import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transcript = body.transcript || "";
    const passageText = body.passageText || "";
    const language = body.language || "english";

    if (!transcript || !passageText) {
      return NextResponse.json(
        { success: false, message: "Missing transcript or passage text." },
        { status: 400 }
      );
    }

    // Basic scoring logic
    const spokenWords = transcript.split(/\s+/).length;
    const expectedWords = passageText.split(/\s+/).length;

    const accuracy = Math.min(
      100,
      Math.round((spokenWords / expectedWords) * 100)
    );
    const errors = Math.max(0, expectedWords - spokenWords);
    const wpm = Math.round(spokenWords / 0.5);

    // Always return valid JSON
    return NextResponse.json({
      success: true,
      wpm,
      accuracy,
      errors,
    });
  } catch (err) {
    console.error("Assessment read-aloud error:", err);
    return NextResponse.json(
      { success: false, message: "Server error processing assessment audio." },
      { status: 500 }
    );
  }
}
