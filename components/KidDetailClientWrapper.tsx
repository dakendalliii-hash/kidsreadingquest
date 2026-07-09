"use client";

import { useState } from "react";
import MicReader from "./MicReader";

export default function KidDetailClientWrapper({
  passageText,
  kidId,
  initialLanguage,
}: {
  passageText: string;
  kidId: string;
  initialLanguage: string;
}) {
  const [language, setLanguage] = useState(
    initialLanguage.toLowerCase() === "hindi" ? "hindi" : "en"
  );

  // Redirect handler passed to MicReader
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
          onClick={() => setLanguage("en")}
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
          onClick={() => setLanguage("hindi")}
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

      {/* MicReader */}
      <MicReader
        passageText={passageText}
        kidId={kidId}
        language={language}
        onSuccessRedirect={handleSuccessRedirect}
      />
    </div>
  );
}
