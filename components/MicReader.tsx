"use client";

import { useState, useEffect, useRef } from "react";

export default function MicReader({
  passageEnglish,
  passageLocalized,
  kidId,
  language,
  band,
  onComplete,
  mode,
}: {
  passageEnglish: string;
  passageLocalized: string;
  kidId: string;
  language: "en" | "hindi";
  band: string;
  onComplete: (results: any) => void;
  mode: "assessment" | "existing";
}) {
  const [isListening, setIsListening] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<any>(null);
  const hasHandledTranscriptRef = useRef(false);

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
  };

  // ⭐ Reset recognition whenever passage changes
  useEffect(() => {
    console.log("[MicReader] Resetting recognition for new passage");

    hasHandledTranscriptRef.current = false;

    // Stop previous recognition
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    recognitionRef.current = null;

    // ⭐ HARD mic release (fixes stuck red-dot)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        console.log("[MicReader] Mic stream released (mount)");
      })
      .catch(() => {});

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

    recognition.onresult = (event: any) => {
      if (hasHandledTranscriptRef.current) {
        console.log("[MicReader] Ignoring duplicate onresult");
        return;
      }

      const transcript = event.results[0][0].transcript;
      console.log("[MicReader] Raw transcript:", transcript);

      if (graceTimer) clearTimeout(graceTimer);

      graceTimer = setTimeout(() => {
        handleTranscript(transcript);
      }, 2500);
    };

    recognition.onerror = (event: any) => {
      console.log("[MicReader] Recognition error:", event.error);
      setErrorMessage("Microphone error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [passageEnglish, language]);

  async function handleTranscript(transcript: string) {
    console.log("[MicReader] handleTranscript fired with:", transcript);

    if (hasHandledTranscriptRef.current) {
      console.log("[MicReader] Duplicate transcript ignored");
      return;
    }
    hasHandledTranscriptRef.current = true;

    // Stop recognition
    try {
      recognitionRef.current?.stop();
    } catch (_) {}

    // ⭐ HARD mic release
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      console.log("[MicReader] Mic stream released (transcript)");
    } catch (_) {}

    setShowPrivacyBanner(true);
    setTimeout(() => setShowPrivacyBanner(false), 4000);

    const passageWords = passageEnglish.split(/\s+/);
    const spokenWords = transcript.trim().split(/\s+/);

    const minRequiredWords = Math.floor(passageWords.length * 0.7);

    if (spokenWords.length < minRequiredWords) {
      console.log(
        `[MicReader] Transcript too short (${spokenWords.length}/${passageWords.length})`
      );

      onComplete({
        metrics: {
          wpm: 0,
          accuracy: 0,
          errors: passageWords.length,
          totalWords: passageWords.length,
          totalSeconds: 0,
          transcript: "",
          band,
          kidId,
          language,
        },
        server: { fluencyPassed: false },
      });

      setIsListening(false);
      return;
    }

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

    let serverResponse;

    try {
      if (mode === "assessment") {
        const res = await fetch(`/kids/${kidId}/assessment/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metrics, band, kidId }),
        });

        serverResponse = await res.json();
      } else {
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

      onComplete({ metrics, server: serverResponse });
    } catch (err) {
      console.error("[MicReader] Fetch error:", err);
      setErrorMessage(ui.serverError);
    }

    setIsListening(false);
  }

  async function startListening() {
    setErrorMessage("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      hasHandledTranscriptRef.current = false;

      recognitionRef.current?.start();
    } catch (err) {
      setErrorMessage(ui.micDenied);
      setIsListening(false);
    }
  }

  async function stopListening() {
    console.log("[MicReader] Manual stop triggered");

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

    // ⭐ HARD mic release
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      console.log("[MicReader] Mic stream released (stop)");
    } catch (_) {}

    setIsListening(false);
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
