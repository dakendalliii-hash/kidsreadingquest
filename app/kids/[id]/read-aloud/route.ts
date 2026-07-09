import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function computeSimilarity(transcript: string, passage: string): number {
  const cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const cleanPassage = passage.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  const tWords = cleanTranscript.split(/\s+/).filter(Boolean);
  const pWords = cleanPassage.split(/\s+/).filter(Boolean);

  if (tWords.length === 0) return 0;

  let matches = 0;
  const pSet = new Set(pWords);

  for (const w of tWords) {
    if (pSet.has(w)) matches++;
  }

  return matches / Math.max(tWords.length, pWords.length);
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const { transcript, passageText, kidId, language } = JSON.parse(raw);

    if (!transcript || !passageText || !kidId) {
      console.error("Missing transcript or passage:", { transcript, passageText, kidId });
      return NextResponse.json({
        success: false,
        message: "Missing transcript or passage.",
      });
    }

    const similarity = computeSimilarity(transcript, passageText);
    console.log("Similarity:", similarity);

    if (similarity < 0.2) {
      console.log("Similarity too low, rejecting.");
      return NextResponse.json({
        success: false,
        message: "Reading accuracy too low. Try again.",
      });
    }

    const supabase = await createServerSupabaseClient();

    //------------------------------------------------------------------
    // CALL RPC: advance_kid_progress
    //------------------------------------------------------------------
    console.log("Calling RPC advance_kid_progress for kid:", kidId);

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "advance_kid_progress",
      { p_kid_id: kidId }
    );

    console.log("RPC result:", rpcData);
    console.log("RPC error:", rpcError);

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json({
        success: false,
        message: "Server error advancing progress.",
      });
    }

    if (!rpcData || rpcData.length === 0) {
      console.error("RPC returned no data. Progress not updated.");
      return NextResponse.json({
        success: false,
        message: "Could not advance progress.",
      });
    }

    const result = rpcData[0];

    //------------------------------------------------------------------
    // Band completed
    //------------------------------------------------------------------
    if (result.band_completed) {
      console.log("Band completed for kid:", kidId);
      return NextResponse.json({
        success: true,
        celebrate: true,
        bandCompleted: true,
        message: `Band ${result.new_band} completed!`,
      });
    }

    //------------------------------------------------------------------
    // Normal progression
    //------------------------------------------------------------------
    console.log("Progress advanced:", result);

    return NextResponse.json({
      success: true,
      celebrate: true,
      bandCompleted: false,
      newBand: result.new_band,
      newSite: result.new_site_id,
      newIndex: result.new_passage_index,
      newPassageId: result.new_passage_id,
      message: "Passage complete!",
    });
  } catch (err) {
    console.error("read-aloud route error:", err);
    return NextResponse.json({
      success: false,
      message: "Unexpected server error.",
    });
  }
}
