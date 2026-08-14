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
  /**
   * ENGLISH ONLY
   * Hindi logic preserved but commented out.
   */
  const [language] = useState<"en">("en");
  // const [language, setLanguage] = useState<"en" | "hindi">(
  //   passage.language?.toLowerCase() === "hindi" ? "hindi" : "en"
  // );

  const [currentPassage, setCurrentPassage] = useState(passage.text);
  const [loadingPassage, setLoadingPassage] = useState(false);

  /**
   * Fetch ENGLISH passage only.
   * Hindi fetch preserved but commented.
   */
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
          language: "en", // ENGLISH ONLY
          // language: newLang, // ❌ commented out
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
   * Language toggle removed.
   * Hindi logic preserved but commented.
   */
  // async function handleLanguageChange(newLang: "en" | "hindi") {
  //   if (language === newLang) return;
  //   setLanguage(newLang);
  //   await fetchPassageForLanguage(newLang);
  // }

  /**
   * MicReader unified return shape:
   * {
   *   metrics: { wpm, accuracy, errors, totalWords, totalSeconds, ... },
   *   server:  { placement, reason }
   * }
   */
  function handleSuccessRedirect(result: any) {
    const { metrics, server } = result;

    const params = new URLSearchParams({
      wpm: metrics.wpm?.toString() ?? "",
      accuracy: metrics.accuracy?.toString() ?? "",
      errors: metrics.errors?.toString() ?? "",
      totalWords: metrics.totalWords?.toString() ?? "",
      totalSeconds: metrics.totalSeconds?.toString() ?? "",
      placement: server.placement ?? "",
      reason: server.reason ?? "",
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
        {/* ⭐ Language Selector (commented out, preserved exactly) */}
        {/*
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
        */}

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
            {loadingPassage
              ? "Loading passage..."
              // : language === "hindi"
              //   ? "पैसेज लोड हो रहा है..."
              //   : "Loading passage..."
              : currentPassage}
          </p>
        </div>

        {/* ⭐ MicReader (assessment mode) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MicReader
            passageEnglish={currentPassage}
            passageLocalized={currentPassage} // ENGLISH ONLY
            kidId={kidId}
            language="en"
            // language={language} // ❌ commented out
            band={band}
            onComplete={handleSuccessRedirect}
            mode="assessment"
          />
        </div>
      </div>
    </FormContainer>
  );
}
