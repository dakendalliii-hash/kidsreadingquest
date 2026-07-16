"use client";

import { useState } from "react";
import MicReader from "./MicReader";

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
  const [language, setLanguage] = useState(
    initialLanguage.toLowerCase() === "hindi" ? "hindi" : "en"
  );
  const [currentPassage, setCurrentPassage] = useState(passageText);
  const [loadingPassage, setLoadingPassage] = useState(false);

  async function fetchPassageForLanguage(newLang: "en" | "hindi") {
    try {
      setLoadingPassage(true);

      const res = await fetch("/api/passage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          band,
          siteId,
          passageIndex,
          language: newLang,
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
    await fetchPassageForLanguage(newLang);
  }

  function handleSuccessRedirect(url: string) {
    window.location.href = url;
  }

  return (
    <div style={{ marginBottom: "20px" }}>
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
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "left",
          color: "black",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          marginBottom: "20px",
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
      <MicReader
        passageText={currentPassage}
        kidId={kidId}
        language={language}
        onSuccessRedirect={handleSuccessRedirect}
      />
    </div>
  );
}
