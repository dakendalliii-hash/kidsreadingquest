"use client";

import { useState } from "react";
import MicReader from "@/components/MicReader";
import FormContainer from "@/components/FormContainer"; // ✅ Restored import

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
  const [language, setLanguage] = useState(
    passage.language?.toLowerCase() === "hindi" ? "hindi" : "en"
  );
  const [currentPassage, setCurrentPassage] = useState(passage.text);
  const [loadingPassage, setLoadingPassage] = useState(false);

  async function fetchPassageForLanguage(newLang: "en" | "hindi") {
    try {
      setLoadingPassage(true);
      const res = await fetch("/api/passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          band,
          siteId,
          passageIndex,
          language: newLang,
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) setCurrentPassage(data.text);
    } finally {
      setLoadingPassage(false);
    }
  }

  async function handleLanguageChange(newLang: "en" | "hindi") {
    if (language === newLang) return;
    setLanguage(newLang);
    await fetchPassageForLanguage(newLang);
  }

  // ✅ Correct redirect for AssessmentClientWrapper (assessment flow)
  function handleSuccessRedirect(result: any) {
    const params = new URLSearchParams({
      wpm: result.wpm?.toString() ?? "",
      accuracy: result.accuracy?.toString() ?? "",
      errors: result.errors?.toString() ?? "",
      totalWords: result.totalWords?.toString() ?? "",
      totalSeconds: result.totalSeconds?.toString() ?? "",
      placement: result.placement ?? "",
      reason: result.reason ?? "",
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
        {/* ✅ Language Selector centered above passage */}
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

        {/* ✅ Passage Display expanded horizontally */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            color: "black",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            marginBottom: "20px",
            width: "95%", // expanded horizontally
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

        {/* ✅ Read Aloud button centered below passage */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MicReader
            passageText={currentPassage}
            kidId={kidId}
            language={language}
            onSuccessRedirect={handleSuccessRedirect}
          />
        </div>
      </div>
    </FormContainer>
  );
}
