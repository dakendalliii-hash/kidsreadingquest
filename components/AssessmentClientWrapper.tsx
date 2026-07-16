"use client";

import { useState } from "react";
import MicReader from "./MicReader";

export default function AssessmentClientWrapper({
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
  const [fluencyPassed, setFluencyPassed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPassage, setLoadingPassage] = useState(false);

  function handleMicSuccessRedirect(_url: string) {
    setFluencyPassed(true);
    setStatusMessage(
      language === "hindi"
        ? "फ्लुएंसी सफल रहा।"
        : "Fluency reading passed."
    );
  }

  async function fetchPassageForLanguage(newLang: "en" | "hindi") {
    try {
      setLoadingPassage(true);
      setStatusMessage(null);

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
      } else {
        setStatusMessage(
          language === "hindi"
            ? "पैसेज लोड करने में त्रुटि।"
            : "Error loading passage."
        );
      }
    } catch (err) {
      setStatusMessage(
        language === "hindi"
          ? "पैसेज लोड करने में त्रुटि।"
          : "Error loading passage."
      );
    } finally {
      setLoadingPassage(false);
    }
  }

  async function handleLanguageChange(newLang: "en" | "hindi") {
    if (language === newLang) return;
    setLanguage(newLang);
    await fetchPassageForLanguage(newLang);
  }

  async function handleSubmitAssessment() {
    setStatusMessage(null);

    if (!fluencyPassed) {
      setStatusMessage(
        language === "hindi"
          ? "फ्लुएंसी पूरा नहीं हुआ।"
          : "Fluency threshold not met."
      );
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/kids/${kidId}/assessment-evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kidId,
          fluencyPassed,
        }),
      });

      const data = await res.json();

      if (data.passed) {
        window.location.href = `/kids/${kidId}/assessment?result=pass&lang=${language}&t=${Date.now()}`;
      } else {
        window.location.href = `/kids/${kidId}/assessment?result=fail&lang=${language}&t=${Date.now()}`;
      }
    } catch (err) {
      setStatusMessage(
        language === "hindi"
          ? "असेसमेंट भेजने में त्रुटि।"
          : "Error submitting assessment."
      );
    } finally {
      setSubmitting(false);
    }
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

      {/* Assessment Questions ABOVE passage */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "left",
          color: "black",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          marginBottom: "20px",
          width: "95%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          {language === "hindi" ? "असेसमेंट प्रश्न" : "Assessment Questions"}
        </h2>

        <p style={{ marginBottom: "15px", fontStyle: "italic" }}>
          {language === "hindi"
            ? "पहले पैसेज पढ़ें, फिर नीचे दिए गए प्रश्नों के उत्तर दें।"
            : "Read the passage first, then answer the questions below."}
        </p>

        <ol style={{ marginLeft: "20px", marginBottom: "20px" }}>
          <li style={{ marginBottom: "10px" }}>
            {language === "hindi"
              ? "कहानी में बच्चा क्या कर रहा है?"
              : "What is the kid doing in the story?"}
          </li>

          <li style={{ marginBottom: "10px" }}>
            {language === "hindi"
              ? "बच्चे के कदम या हाथ बढ़ाने के बाद अगला क्या होता है?"
              : "What happens next after the kid takes a step or reaches out?"}
          </li>

          <li style={{ marginBottom: "10px" }}>
            {language === "hindi"
              ? "आपको क्या लगता है कि इस पल में बच्चे को कैसा महसूस हो सकता है?"
              : "What do you think it might feel like for the kid in this moment?"}
          </li>
        </ol>

        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            color: "black",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            marginTop: "10px",
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

        {statusMessage && (
          <p
            style={{
              marginTop: "10px",
              color:
                statusMessage.includes("सफल") ||
                statusMessage.includes("passed")
                  ? "green"
                  : "red",
              fontWeight: "bold",
            }}
          >
            {statusMessage}
          </p>
        )}

        <button
          onClick={handleSubmitAssessment}
          disabled={submitting}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "15px",
            width: "95%",
            whiteSpace: "nowrap",
          }}
        >
          {submitting
            ? language === "hindi"
              ? "भेजा जा रहा है..."
              : "Submitting..."
            : language === "hindi"
            ? "असेसमेंट पूरा करें"
            : "Finish Assessment"}
        </button>
      </div>

      {/* MicReader BELOW questions, using currentPassage */}
      <MicReader
        passageText={currentPassage}
        kidId={kidId}
        language={language}
        onSuccessRedirect={handleMicSuccessRedirect}
      />
    </div>
  );
}
