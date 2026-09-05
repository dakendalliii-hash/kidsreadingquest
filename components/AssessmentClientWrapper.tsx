"use client";

import { useState } from "react";
import MicReader from "@/components/MicReader";
import FormContainer from "@/components/FormContainer";

export default function AssessmentClientWrapper({
  kidId,
  passage,
  band,
  siteId,
  passageIndex,
}: {
  kidId: string;
  passage: any;
  band: string;
  siteId: number;
  passageIndex: number;
}) {
  const [language] = useState<"en">("en");
  const [currentPassage, setCurrentPassage] = useState(passage.text);
  const [loadingPassage, setLoadingPassage] = useState(false);

  async function fetchPassageForLanguage(newLang: "en" | "hindi") {
    try {
      setLoadingPassage(true);
      const res = await fetch(`/kids/${kidId}/reading/api/passage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          band,
          siteId,
          passageIndex,
          language: "en",
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) setCurrentPassage(data.text);
    } finally {
      setLoadingPassage(false);
    }
  }

  /**
   * MicReader unified return shape:
   * { metrics: { ... } }
   * MicReader no longer calls /assessment/score.
   * We call it here to compute placement + reason.
   */
  async function handleSuccessRedirect(results: any) {
    if (!results || typeof results !== "object") {
      console.error("Invalid results object:", results);
      return;
    }

    const { metrics } = results;
    if (!metrics) {
      console.error("Missing metrics:", { metrics });
      return;
    }

    // ⭐ Call assessment/score route to compute placement + reason
    let placement = "";
    let reason = "";
    try {
      const response = await fetch(`/kids/${kidId}/assessment/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidId, band, metrics }),
      });
      const data = await response.json();
      placement = data.placement ?? "";
      reason = data.reason ?? "";
    } catch (err) {
      console.error("Score route error:", err);
    }

    // Safe numeric defaults
    const safeMetrics = {
      wpm: metrics.wpm ?? 0,
      accuracy: metrics.accuracy ?? 0,
      errors: metrics.errors ?? 0,
      totalWords: metrics.totalWords ?? 0,
      totalSeconds: metrics.totalSeconds ?? 0,
    };

    const params = new URLSearchParams({
      wpm: safeMetrics.wpm.toString(),
      accuracy: safeMetrics.accuracy.toString(),
      errors: safeMetrics.errors.toString(),
      totalWords: safeMetrics.totalWords.toString(),
      totalSeconds: safeMetrics.totalSeconds.toString(),
      placement,
      reason,
      transcript: metrics.transcript ?? "",
      mispronounced: metrics.mispronounced?.toString() ?? "0",
      skipped: metrics.skipped?.toString() ?? "0",
      inserted: metrics.inserted?.toString() ?? "0",
      repeated: metrics.repeated?.toString() ?? "0",
    });

    window.location.href = `/kids/${kidId}/assessment/results?${params.toString()}`;
  }

  return (
    <FormContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px 0",
        }}
      >
        {/* ⭐ Passage Display */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            color: "black",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            marginBottom: "20px",
            width: "95%",
            maxWidth: "1000px",
          }}
        >
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
            {loadingPassage ? "Loading passage..." : currentPassage}
          </p>
        </div>

        {/* ⭐ MicReader (assessment mode) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MicReader
            passageEnglish={currentPassage}
            passageLocalized={currentPassage}
            kidId={kidId}
            language="en"
            band={band}
            siteId={1}
            passageIndex={1}
            onComplete={handleSuccessRedirect}
            mode="assessment"
          />
        </div>
      </div>
    </FormContainer>
  );
}
