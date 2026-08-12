"use client";

import { useState } from "react";
import MicReader from "@/components/MicReader";

export default function MicReaderWrapper({
  passageLocalized,
  passageEnglish,
  band,
  kidId,
}: {
  passageLocalized: string;
  passageEnglish: string;
  band: string;
  kidId: string;
}) {
  // ⭐ Default language is always English
  const [language, setLanguage] = useState<"en" | "hindi">("en");
  const [retry, setRetry] = useState(false);

  // ⭐ Reload page with selected language param
  const handleLanguageChange = (lang: "en" | "hindi") => {
    const newUrl = `/kids/${kidId}/read-aloud?lang=${lang}`;
    window.location.href = newUrl;
  };

  async function handleComplete(results: any) {
    console.log("[MicReaderWrapper] onComplete results:", results);

    const res = await fetch(`/kids/${kidId}/read-aloud/api`, {
      method: "POST",
      body: JSON.stringify(results),
    });

    const data = await res.json();
    console.log("[MicReaderWrapper] API response:", data);

    if (!data.advance) {
      console.log("[MicReaderWrapper] Read failed → retry");
      setRetry(true);
      return;
    }

    if (data.bandComplete) {
      window.location.href = `/kids/${kidId}/read-aloud?celebrate=1&bandComplete=1&lang=${language}`;
    } else {
      window.location.href = `/kids/${kidId}/read-aloud?celebrate=1&lang=${language}`;
    }
  }

  return (
    <div style={{ width: "100%" }}>
      {/* ⭐ Language Toggle ABOVE passage */}
      <div className="flex justify-center gap-3 mb-5">
        <button
          className={`btn ${
            language === "en" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </button>

        <button
          className={`btn ${
            language === "hindi" ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => handleLanguageChange("hindi")}
        >
          हिन्दी
        </button>
      </div>

      {/* ⭐ Display passage in selected language */}
      <p className="bg-gray-50 p-5 rounded-lg mb-8 leading-relaxed whitespace-pre-wrap text-center text-lg">
        {language === "en" ? passageEnglish : passageLocalized}
      </p>

      {/* ⭐ Retry UI */}
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

      {/* ⭐ MicReader */}
      {!retry && (
        <MicReader
          passageEnglish={passageEnglish}
          passageLocalized={passageLocalized}
          language={language}
          band={band}
          kidId={kidId}
          onComplete={handleComplete}
          mode="existing"
        />
      )}
    </div>
  );
}
