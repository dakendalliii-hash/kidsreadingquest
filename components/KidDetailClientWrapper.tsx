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
  const [language, setLanguage] = useState<"en" | "hindi">(
    initialLanguage.toLowerCase() === "hindi" ? "hindi" : "en"
  );

  const [currentPassage, setCurrentPassage] = useState(passageText);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  // Celebration overlay state
  const [showCelebration, setShowCelebration] = useState(false);

  // Track updated band/site/passageIndex after progress advance
  const [currentBand, setCurrentBand] = useState(band);
  const [currentSiteId, setCurrentSiteId] = useState(siteId);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(passageIndex);

  // Fetch passage using UPDATED values
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
          language,
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

  async function handleLanguageChange(newLang: "en" | "hindi") {
    if (language === newLang) return;
    setLanguage(newLang);

    // Use updated band/site/index
    await fetchPassage(currentBand, currentSiteId, currentPassageIndex);
  }

  // Load next passage after celebration ends
  async function loadNextPassage() {
    try {
      const res = await fetch(`/kids/${kidId}/reading/api/progress/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidId, language }),
      });

      const data = await res.json();
      console.log("[Wrapper] Next passage info:", data);

      if (data.celebrate) {
        // Band complete — future enhancement
        setShowCelebration(false);
        return;
      }

      // Update local state with new progress
      setCurrentBand(data.band);
      setCurrentSiteId(data.site_id);
      setCurrentPassageIndex(data.passage_index);

      // Fetch next passage
      await fetchPassage(data.band, data.site_id, data.passage_index);

      // Hide celebration overlay
      setShowCelebration(false);
    } catch (err) {
      console.error("Error loading next passage:", err);
    }
  }

  /**
   * Metrics-aware completion handler
   * MicReader returns: { metrics, server }
   */
  async function handleComplete(results: any) {
    const { metrics, server } = results;

    console.log("[Wrapper] Metrics received:", metrics);
    console.log("[Wrapper] Server response received:", server);

    const { accuracy, wpm } = metrics;

    // Server fluency failure
    if (server && server.fluencyPassed === false) {
      setFailureMessage(
        language === "hindi"
          ? "पढ़ने की प्रवाहिता पर्याप्त नहीं है। फिर से कोशिश करें!"
          : "Fluency not high enough. Try again!"
      );
      return;
    }

    // Client correctness check
    const acceptable = accuracy >= 90 && wpm >= 40;

    if (acceptable) {
      console.log("[Wrapper] Read acceptable — triggering celebration.");

      // Show celebration overlay
      setShowCelebration(true);

      // Celebration lasts 5 seconds → match Celebration.tsx timer
      setTimeout(() => {
        loadNextPassage();
      }, 5000);

      return;
    }

    console.log("[Wrapper] Read NOT acceptable — advancing progress.");

    // Fallback progression logic
    try {
      const res = await fetch(`/kids/${kidId}/reading/api/progress/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidId, language }),
      });

      const data = await res.json();
      console.log("[Wrapper] Progress advance response:", data);

      if (data.celebrate) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
        return;
      }

      // Update progress locally
      setCurrentBand(data.band);
      setCurrentSiteId(data.site_id);
      setCurrentPassageIndex(data.passage_index);

      // Fetch next passage
      await fetchPassage(data.band, data.site_id, data.passage_index);
    } catch (err) {
      console.error("Error advancing passage:", err);
      alert("Something went wrong updating progress. Please try again.");
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
          <Celebration kidId={kidId} language={language} />
        )}

        {/* Language Selector */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => handleLanguageChange("en")}
            style={{
              backgroundColor: language === "en" ? "#4CAF50" : "#777",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            English
          </button>

          <button
            onClick={() => handleLanguageChange("hindi")}
            style={{
              backgroundColor: language === "hindi" ? "#4CAF50" : "#777",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            हिंदी
          </button>
        </div>

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
            {loadingPassage
              ? language === "hindi"
                ? "पैसेज लोड हो रहा है..."
                : "Loading passage..."
              : currentPassage}
          </p>
        </div>

        {/* MicReader */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MicReader
            passageEnglish={currentPassage}
            passageLocalized={currentPassage}
            kidId={kidId}
            language={language}
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
