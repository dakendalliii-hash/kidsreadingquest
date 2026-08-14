"use client";

import { useState } from "react";
import MicReader from "@/components/MicReader";
import FormContainer from "@/components/FormContainer";
import Celebration from "@/components/Celebration";

export default function KidDetailClientWrapper({
  passageText,
  kidId,
  initialLanguage,
  band,
  siteId,
  passageIndex,
}: {
  passageText: string;
  kidId: string;
  initialLanguage: string;
  band: string;
  siteId: number;
  passageIndex: number;
}) {
  /**
   * ENGLISH ONLY
   */
  const [language] = useState<"en">("en");

  const [currentPassage, setCurrentPassage] = useState(passageText);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const [showCelebration, setShowCelebration] = useState(false);

  const [currentBand, setCurrentBand] = useState(band);
  const [currentSiteId, setCurrentSiteId] = useState(siteId);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(passageIndex);

  // ⭐ Guard to prevent double advancement
  const [hasAdvanced, setHasAdvanced] = useState(false);

  // ⭐ NEW: retry counter to force MicReader remount
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Fetch ENGLISH passage only.
   */
  async function fetchPassage(newBand: string, newSiteId: number, newIndex: number) {
    try {
      setLoadingPassage(true);

      const res = await fetch(`/kids/${kidId}/reading/api/passage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          band: newBand,
          siteId: newSiteId,
          passageIndex: newIndex,
          language: "en",
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setCurrentPassage(data.text);
      }
    } finally {
      setLoadingPassage(false);
    }
  }

  /**
   * Fetch UPDATED progress (server already advanced it).
   */
  async function fetchUpdatedProgress() {
    const res = await fetch(`/kids/${kidId}/reading/api/progress`);
    const data = await res.json();

    setCurrentBand(data.band);
    setCurrentSiteId(data.site_id);
    setCurrentPassageIndex(data.passage_index);

    await fetchPassage(data.band, data.site_id, data.passage_index);
  }

  /**
   * MicReader completion handler
   */
  async function handleComplete(results: any) {
    console.log("[Wrapper] handleComplete fired");

    // Always clear old failure message
    setFailureMessage(null);

    const { metrics, server } = results;
    const { accuracy, wpm } = metrics;

    // Reset guard immediately so wrapper can respond to next read
    setHasAdvanced(false);

    // Backend is the source of truth
    if (server && server.fluencyPassed === true) {
      setShowCelebration(true);

      setTimeout(() => {
        fetchUpdatedProgress();
        setShowCelebration(false);
      }, 5000);

      return;
    }

    // ⭐ Backend says failure → force MicReader remount
    if (server && server.fluencyPassed === false) {
      setFailureMessage("Fluency not high enough. Try again!");

      // ⭐ Force MicReader to fully reset
      setRetryCount((c) => c + 1);

      return;
    }

    // Local fallback (optional)
    const acceptable = accuracy >= 90 && wpm >= 40;

    if (acceptable) {
      setShowCelebration(true);

      setTimeout(() => {
        fetchUpdatedProgress();
        setShowCelebration(false);
      }, 5000);

      return;
    }
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
        {/* Celebration Overlay */}
        {showCelebration && (
          <Celebration kidId={kidId} language="en" />
        )}

        {/* Passage Display */}
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

        {/* MicReader */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MicReader
            key={`${currentPassageIndex}-${retryCount}`}  // ⭐ forces full reset
            passageEnglish={currentPassage}
            passageLocalized={currentPassage}
            kidId={kidId}
            language="en"
            band={currentBand}
            onComplete={handleComplete}
            mode="existing"
          />
        </div>

        {/* Failure Message */}
        {failureMessage && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "#ffe6e6",
              padding: "12px 20px",
              borderRadius: "8px",
              color: "black",
              fontWeight: "bold",
              textAlign: "center",
              width: "95%",
              maxWidth: "1000px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            {failureMessage}
          </div>
        )}
      </div>
    </FormContainer>
  );
}
