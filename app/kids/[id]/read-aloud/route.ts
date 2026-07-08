import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ---------------------------
// Route segment config (Next.js 16)
// ---------------------------
export const maxBodySize = "1mb";       // replaces deprecated bodyParser.sizeLimit
export const runtime = "nodejs";        // required for Supabase server client
export const dynamic = "force-dynamic"; // ensures POST handler is never statically optimized

// ---------------------------
// Utility: similarity scoring
// ---------------------------
function computeSimilarity(transcript: string, passage: string): number {
  const cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const cleanPassage = passage.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  const transcriptWords = cleanTranscript.split(/\s+/).filter(Boolean);
  const passageWords = cleanPassage.split(/\s+/).filter(Boolean);

  if (transcriptWords.length === 0) return 0;

  let matches = 0;
  const passageSet = new Set(passageWords);

  for (const w of transcriptWords) {
    if (passageSet.has(w)) matches++;
  }

  return matches / Math.max(transcriptWords.length, passageWords.length);
}

// ---------------------------
// POST handler
// ---------------------------
export async function POST(req: Request) {
  try {
    console.log("Incoming request size:", req.headers.get("content-length"));

    // SAFER JSON PARSE
    const raw = await req.text();
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const { transcript, passageText, kidId } = parsed;

    if (!transcript || !passageText || !kidId) {
      return NextResponse.json({
        success: false,
        message: "Missing transcript or passage.",
      });
    }

    // Compute similarity
    const similarity = computeSimilarity(transcript, passageText);
    const threshold = 0.5;

    if (similarity < threshold) {
      return NextResponse.json({
        success: false,
        message: "Reading accuracy too low. Try again.",
      });
    }

    // ---------------------------
    // Auto‑advance logic
    // ---------------------------
    const supabase = await createServerSupabaseClient();

    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("band, site_id, passage_index, streak")
      .eq("kid_id", kidId)
      .single();

    if (progressError || !progress) {
      return NextResponse.json({
        success: false,
        message: "Could not load progress.",
      });
    }

    const currentBand = progress.band;
    const currentSite = progress.site_id;
    const currentIndex = progress.passage_index;

    // Try next passage in same site
    const { data: nextPassageSameSite } = await supabase
      .from("passages")
      .select("id")
      .eq("language", "en")
      .eq("band", currentBand)
      .eq("site_id", currentSite)
      .eq("passage_index", currentIndex + 1)
      .maybeSingle();

    if (nextPassageSameSite) {
      await supabase
        .from("progress")
        .update({
          passage_index: currentIndex + 1,
          status: "not started",
          streak: progress.streak + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("kid_id", kidId);

      return NextResponse.json({
        success: true,
        redirectTo: `/kids/${kidId}?celebrate=1`,
      });
    }

    // Try next site
    const { data: nextSiteFirstPassage } = await supabase
      .from("passages")
      .select("id")
      .eq("language", "en")
      .eq("band", currentBand)
      .eq("site_id", currentSite + 1)
      .eq("passage_index", 1)
      .maybeSingle();

    if (nextSiteFirstPassage) {
      await supabase
        .from("progress")
        .update({
          site_id: currentSite + 1,
          passage_index: 1,
          status: "not started",
          streak: progress.streak + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("kid_id", kidId);

      return NextResponse.json({
        success: true,
        redirectTo: `/kids/${kidId}?celebrate=1`,
      });
    }

    // Graduate to next band
    const nextBand =
      currentBand === "A"
        ? "B"
        : currentBand === "B"
        ? "C"
        : "C"; // stays at C

    const { data: nextBandFirstPassage } = await supabase
      .from("passages")
      .select("id")
      .eq("language", "en")
      .eq("band", nextBand)
      .eq("site_id", 1)
      .eq("passage_index", 1)
      .maybeSingle();

    if (nextBandFirstPassage) {
      await supabase
        .from("progress")
        .update({
          band: nextBand,
          site_id: 1,
          passage_index: 1,
          status: "not started",
          streak: progress.streak + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("kid_id", kidId);

      return NextResponse.json({
        success: true,
        redirectTo: `/kids/${kidId}?celebrate=1`,
      });
    }

    // No more passages anywhere
    return NextResponse.json({
      success: true,
      redirectTo: `/kids/${kidId}?celebrate=1`,
    });
  } catch (err) {
    console.error("read‑aloud route error:", err);
    return NextResponse.json({
      success: false,
      message: "Unexpected server error.",
    });
  }
}
