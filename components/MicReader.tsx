"use client";

import { useState, useEffect, useRef } from "react";

export default function MicReader({
  passageText,
  kidId,
  language,
  onSuccessRedirect,
}: {
  passageText: string;
  kidId: string;
  language: string;
  onSuccessRedirect: (url: string) => void;
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

  useEffect(() => {
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

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      await handleTranscript(transcript);
    };

    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    recognition.onerror = (event: any) => {
      setErrorMessage("Microphone error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [isListening, language]);

  async function handleTranscript(transcript: string) {
    deleteAudio();

    setShowPrivacyBanner(true);
    setTimeout(() => setShowPrivacyBanner(false), 4000);

    try {
      const res = await fetch(`/kids/${kidId}/read-aloud`, {
        method: "POST",
        body: JSON.stringify({
          transcript,
          passageText,
          kidId,
          language,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success && data.celebrate) {
        const url = `/kids/${kidId}?celebrate=1&bandCompleted=${
          data.bandCompleted ? "1" : "0"
        }&lang=${language}&t=${Date.now()}`;

        onSuccessRedirect(url);
      } else {
        setErrorMessage(data.message || ui.lowAccuracy);
      }
    } catch (err) {
      setErrorMessage(ui.serverError);
    }

    setIsListening(false);
  }

  function deleteAudio() {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
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
