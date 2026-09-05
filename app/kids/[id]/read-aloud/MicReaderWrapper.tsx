"use client";

import { useState } from "react";
import MicReader from "@/components/MicReader";
import { createClient } from "@supabase/supabase-js";

export default function MicReaderWrapper({
  passageLocalized,
  passageEnglish,
  band,
  kidId,
  siteId,
  passageIndex,
}: {
  passageLocalized: string;
  passageEnglish: string;
  band: string;
  kidId: string;
  siteId: number;
  passageIndex: number;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [retry, setRetry] = useState(false);

  async function handleComplete(results: any) {
    console.log("[MicReaderWrapper] onComplete results:", results);

    const { metrics, server } = results;

    // ⭐ FIX #1 — serverResponse shadowing bug caused fluencyPassed to always be false
    const fluencyPassed = server?.fluencyPassed === true;

    // ⭐ FIX #2 — MicReader already POSTED when mode === "existing"
    // So we ONLY POST here when MicReader did NOT (assessment mode)
    if (!server) {
      const response = await fetch(`/kids/${kidId}/read-aloud/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics,
          band,
          siteId,
          passageIndex,
        }),
      });

      const apiResult = await response.json();
      console.log("[MicReaderWrapper] API result:", apiResult);

      if (!apiResult || apiResult.error) {
        console.error("[MicReaderWrapper] API error:", apiResult?.error);
        setRetry(true);
        return;
      }
    }

    // ⭐ Fluency failure → retry
    if (!fluencyPassed) {
      setRetry(true);
      return;
    }

    // ⭐ Fluency passed → navigate to comprehension
    window.location.href = `/kids/${kidId}/reading/comprehension`;
  }

  return (
    <div style={{ width: "100%" }}>
      <p className="bg-gray-50 p-5 rounded-lg mb-8 leading-relaxed whitespace-pre-wrap text-center text-lg">
        {passageEnglish}
      </p>

      {retry && (
        <div className="text-center mt-5">
          <p className="text-red-600 font-bold">
            Try again — read the passage more clearly.
          </p>
          <button
            onClick={() => setRetry(false)}
            className="btn btn-primary mt-3"
          >
            Retry Read-Aloud
          </button>
        </div>
      )}

      {!retry && (
        <MicReader
          passageEnglish={passageEnglish}
          passageLocalized={passageLocalized}
          language="en"
          band={band}
          kidId={kidId}
          siteId={siteId}
          passageIndex={passageIndex}
          onComplete={handleComplete}
          mode="existing"
        />
      )}
    </div>
  );
}
