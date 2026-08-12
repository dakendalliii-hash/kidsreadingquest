"use client";

import { useState, useEffect, useRef } from "react";

export default function MicReader({
  passageEnglish,
  passageLocalized,
  kidId,
  language,
  band,
  onComplete,
  mode, // ⭐ Added at end
}: {
  passageEnglish: string;
  passageLocalized: string;
  kidId: string;
  language: "en" | "hindi";
  band: string;
  onComplete: (results: any) => void;
  mode: "assessment" | "existing"; // ⭐ Added at end
}) {
  const [isListening, setIsListening] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<any>(null);

  const ui = {
    start: language === "hindi" ? "पढ़ना शुरू करें" : "Read Aloud",
    listening: language === "hindi" ? "सुन रहा हूँ…" : "Listening…",
    stop: language === "hindi" ? "पढ़ना रोकें" : "Stop Reading",
    retry: language === "hindi" ? "फिर से कोशिश करें" : "Retry Microphone",
    privacy:
      language === "hindi"
        ? "गोपनीयता के लिए ऑडियो हटाया गया।"
        : "Audio deleted for privacy.",
    micDenied:
      language === "hindi"
        ? "माइक्रोफ़ोन अनुमति अस्वीकृत।"
        : "Microphone access denied.",
    notSupported:
      language === "hindi"
        ? "यह ब्राउज़र वॉइस रिकग्निशन का समर्थन नहीं करता।"
        : "Speech recognition is not supported.",
    serverError:
      language === "hindi"
        ? "सर्वर त्रुटि।"
        : "Server error.",
    lowAccuracy:
      language === "hindi"
        ? "सटीकता कम है।"
        : "Reading accuracy too low.",
  };

  // ⭐ Strict Mode Guard
  useEffect(() => {
    if (recognitionRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(ui.notSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === "hindi" ? "hi-IN" : "en-US";

    let graceTimer: any = null;

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;

      if (graceTimer) clearTimeout(graceTimer);

      graceTimer = setTimeout(() => {
        handleTranscript(transcript);
      }, 2500);
    };

    recognition.onerror = (event: any) => {
      setErrorMessage("Microphone error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  async function handleTranscript(transcript: string) {
    deleteAudio();

    setShowPrivacyBanner(true);
    setTimeout(() => setShowPrivacyBanner(false), 4000);

    // ⭐ LOCAL METRIC CALCULATION
    const passageWords = passageEnglish.split(/\s+/);
    const spokenWords = transcript.trim().split(/\s+/);

    const totalWords = passageWords.length;
    let correct = 0;
    let errors = 0;

    for (let i = 0; i < passageWords.length; i++) {
      if (
        spokenWords[i] &&
        spokenWords[i].toLowerCase() === passageWords[i].toLowerCase()
      ) {
        correct++;
      } else {
        errors++;
      }
    }

    const accuracy = Math.round((correct / totalWords) * 100);

    // ⭐ Placeholder timing (can be replaced with real timing later)
    const totalSeconds = 10;
    const wpm = Math.round((spokenWords.length / totalSeconds) * 60);

    const metrics = {
      wpm,
      accuracy,
      errors,
      totalWords,
      totalSeconds,
      transcript,
      band,
      kidId,
      language,
    };

    console.log("[MicReader] Local metrics:", metrics);

    // ⭐ ROUTE BASED ON MODE
    let serverResponse;

    try {
      if (mode === "assessment") {
        // ⭐ ASSESSMENT FLOW
        const res = await fetch(`/kids/${kidId}/assessment/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics,
            band,
            kidId,
          }),
        });

        serverResponse = await res.json();
      } else {
        // ⭐ EXISTING KID FLOW
        const res = await fetch(`/kids/${kidId}/read-aloud/api`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            passageEnglish,
            passageLocalized,
            language,
            band,
            kidId,
            metrics,
          }),
        });

        serverResponse = await res.json();
      }

      console.log("[MicReader] Server response:", serverResponse);

      // ⭐ UNIFIED RETURN SHAPE
      onComplete({
        metrics,
        server: serverResponse,
      });
    } catch (err) {
      console.error("MicReader fetch error:", err);
      setErrorMessage(ui.serverError);
    }

    setIsListening(false);
  }

  function deleteAudio() {
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
  }

  async function startListening() {
    setErrorMessage("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      setErrorMessage(ui.micDenied);
      setIsListening(false);
    }
  }

  function stopListening() {
    deleteAudio();
    setIsListening(false);
    setErrorMessage("");
  }

  return (
    <>
      {showPrivacyBanner && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 9999,
          }}
        >
          {ui.privacy}
        </div>
      )}

      {errorMessage && (
        <div style={{ marginTop: "10px", color: "red", textAlign: "center" }}>
          {errorMessage}
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={startListening}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.95rem",
                minWidth: "90px",
              }}
            >
              {ui.retry}
            </button>
          </div>
        </div>
      )}

      {!isListening && (
        <button
          onClick={startListening}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "25px",
            width: "95%",
            whiteSpace: "nowrap",
          }}
        >
          {ui.start}
        </button>
      )}

      {isListening && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            flexDirection: "column",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              animation: "pulse 1.2s infinite",
            }}
          >
            🎤
          </div>
          <p style={{ marginTop: "8px", fontWeight: "bold", color: "#333" }}>
            {ui.listening}
          </p>

          <button
            onClick={stopListening}
            style={{
              backgroundColor: "#555",
              color: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.95rem",
              marginTop: "12px",
              minWidth: "120px",
            }}
          >
            {ui.stop}
          </button>

          <style>
            {`
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
    </>
  );
}
