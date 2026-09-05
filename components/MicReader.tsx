"use client";

import { useState, useEffect, useRef } from "react";

export default function MicReader({
  passageEnglish,
  passageLocalized,
  kidId,
  language,
  band,
  siteId,
  passageIndex,
  onComplete,
  mode,
}: {
  passageEnglish: string;
  passageLocalized: string;
  kidId: string;
  language: "en";
  band: string;
  siteId: number;
  passageIndex: number;
  onComplete: (results: any) => void;
  mode: "assessment" | "existing";
}) {
  const [isListening, setIsListening] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<any>(null);
  const hasHandledTranscriptRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const ui = {
    start: "Read Aloud",
    listening: "Listening…",
    stop: "Stop Reading",
    retry: "Retry Microphone",
    privacy: "Audio deleted for privacy.",
    micDenied: "Microphone access denied.",
    notSupported: "Speech recognition is not supported.",
    serverError: "Server error.",
  };

  useEffect(() => {
    console.log("[MicReader] Resetting recognition for new passage");

    hasHandledTranscriptRef.current = false;
    hasCompletedRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    recognitionRef.current = null;

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
    recognition.lang = "en-US";

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

      onComplete({
        metrics: null,
        server: { fluencyPassed: false },
      });
    };

    recognitionRef.current = recognition;
  }, [passageEnglish]);

  async function handleTranscript(transcript: string) {
    console.log("[MicReader] handleTranscript fired with:", transcript);

    if (hasHandledTranscriptRef.current) {
      console.log("[MicReader] Duplicate transcript ignored");
      setIsListening(false);

      onComplete({
        metrics: null,
        server: { fluencyPassed: false },
      });

      return;
    }
    hasHandledTranscriptRef.current = true;

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

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

      setIsListening(false);

      const shortMetrics = {
        wpm: 0,
        accuracy: 0,
        errors: passageWords.length,
        totalWords: passageWords.length,
        totalSeconds: 10,
        transcript,
        mispronounced: passageWords.length,
        skipped: 0,
        inserted: 0,
        repeated: 0,
        band,
        kidId,
        language: "en",
      };

      onComplete({
        metrics: shortMetrics,
        server: { fluencyPassed: false },
      });

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
      mispronounced: errors,
      skipped: 0,
      inserted: 0,
      repeated: 0,
      band,
      kidId,
      language: "en",
    };

    console.log("[MicReader] Local metrics:", metrics);

    if (hasCompletedRef.current) {
      console.log("[MicReader] Ignoring duplicate completion");
      setIsListening(false);

      onComplete({
        metrics: null,
        server: { fluencyPassed: false },
      });

      return;
    }
    hasCompletedRef.current = true;

    let serverResponse = null;

    try {
      if (mode === "existing") {
        const res = await fetch(`/kids/${kidId}/read-aloud/api`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            passageEnglish,
            passageLocalized,
            language: "en",
            band,
            kidId,
            metrics,
            siteId,
            passageIndex,
          }),
        });

        serverResponse = await res.json();
      }

      console.log("[MicReader] Server response:", serverResponse);

      onComplete({ metrics, server: serverResponse });
    } catch (err) {
      console.error("[MicReader] Fetch error:", err);
      setErrorMessage(ui.serverError);

      onComplete({
        metrics,
        server: { fluencyPassed: false },
      });
    }

    setIsListening(false);
  }

  async function startListening() {
    setErrorMessage("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      hasHandledTranscriptRef.current = false;
      hasCompletedRef.current = false;

      recognitionRef.current?.start();
    } catch (err) {
      setErrorMessage(ui.micDenied);
      setIsListening(false);

      onComplete({
        metrics: null,
        server: { fluencyPassed: false },
      });
    }
  }

  async function stopListening() {
    console.log("[MicReader] Manual stop triggered");

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

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
