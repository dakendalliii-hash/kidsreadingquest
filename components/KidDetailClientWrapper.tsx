"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // ⭐ ENGLISH ONLY
  const [language] = useState<"en">("en");

  const [currentPassage, setCurrentPassage] = useState(passageText);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const [showCelebration, setShowCelebration] = useState(false);

  const [currentBand, setCurrentBand] = useState(band);
  const [currentSiteId, setCurrentSiteId] = useState(siteId);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(passageIndex);

  // ⭐ Guards
  const [retryCount, setRetryCount] = useState(0);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
          selectedLanguage: "en",
        }),
      });

      const data = await res.json();

      if (!data.text) {
        console.error("[Wrapper] No passage text found:", data);
        setFailureMessage("Passage not found. Please try again later.");
        return;
      }

      setCurrentPassage(data.text);
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

    console.log("[Wrapper] Updated progress:", data);

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

    if (hasCompletedOnce) {
      console.log("[Wrapper] Ignoring duplicate onComplete");
      return;
    }
    setHasCompletedOnce(true);

    setFailureMessage(null);

    const { metrics, server } = results;
    const { accuracy, wpm } = metrics;

    // ⭐ Store workout attempt locally
    try {
      const workout = {
        metrics,
        comprehension: null,
        vocabulary: null,
        attemptType: "workout",
        band: currentBand,
        siteId: currentSiteId,
        passageIndex: currentPassageIndex,
      };
      localStorage.setItem("workout", JSON.stringify(workout));
      console.log("[Wrapper] Stored workout object:", workout);
    } catch (err) {
      console.error("[Wrapper] Failed to store workout:", err);
    }

    // ⭐ Server authoritative pass/fail
    if (server?.fluencyPassed === true) {
      console.log("[Wrapper] Server fluencyPassed === true");
      if (redirecting) return;
      setRedirecting(true);

      setShowCelebration(true);

      // ⭐ Redirect AFTER celebration
      setTimeout(() => {
        console.log("[Wrapper] Redirecting to comprehension");
        router.push(`/kids/${kidId}/reading/comprehension`);
      }, 5000);

      return;
    }

    if (server?.fluencyPassed === false) {
      console.log("[Wrapper] Server fluencyPassed === false");
      setFailureMessage("Fluency not high enough. Try again!");
      setRetryCount((c) => c + 1);
      setHasCompletedOnce(false);
      return;
    }

    // ⭐ Local fallback (if server missing fluencyPassed)
    const acceptable = accuracy >= 90 && wpm >= 40;
    console.log("[Wrapper] Local fallback acceptable:", acceptable);

    if (acceptable) {
      if (redirecting) return;
      setRedirecting(true);
      setShowCelebration(true);

      setTimeout(() => {
        console.log("[Wrapper] Redirecting to comprehension (local fallback)");
        router.push(`/kids/${kidId}/reading/comprehension`);
      }, 5000);

      return;
    }

    // ⭐ Failure fallback
    setFailureMessage("Fluency not high enough. Try again!");
    setRetryCount((c) => c + 1);
    setHasCompletedOnce(false);
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
        {showCelebration && <Celebration kidId={kidId} language="en" />}

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
            key={retryCount}
            passageEnglish={currentPassage}
            passageLocalized={currentPassage}
            kidId={kidId}
            language={language}
            band={currentBand}
            siteId={siteId}
            passageIndex={passageIndex}
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
