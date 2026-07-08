"use client";

import { useState, useEffect, useRef } from "react";

export default function MicReader({
  passageText,
  kidId,
  onSuccessRedirect,
}: {
  passageText: string;
  kidId: string;
  onSuccessRedirect: (url: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // ✅ Keeps listening through pauses
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      await handleTranscript(transcript);
    };

    // ✅ Restart automatically after short pauses
    recognition.onend = () => {
      setTimeout(() => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (_) {
            // Ignore restart errors
          }
        }
      }, 2000); // 2-second pause tolerance
    };

    recognition.onerror = (event: any) => {
      setErrorMessage("Microphone error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [isListening]);

  // Handle transcript
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
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success && data.redirectTo) {
        onSuccessRedirect(data.redirectTo);
      } else {
        setErrorMessage(data.message || "Reading accuracy too low. Try again.");
      }
    } catch (err) {
      setErrorMessage("Server error. Please try again.");
    }

    setIsListening(false);
  }

  // Delete audio (Web Speech API stores none, but we stop streams)
  function deleteAudio() {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (_) {}
  }

  // Start listening with proper permission handling
  async function startListening() {
    setErrorMessage("");

    try {
      // Request microphone permission FIRST
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // If permission granted, start recognition
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      setErrorMessage(
        "Microphone access denied. Please enable microphone permissions in Windows and your browser."
      );
      setIsListening(false);
    }
  }

  // ✅ Stop Reading manually
  function stopListening() {
    deleteAudio();
    setIsListening(false);
    setErrorMessage("");
  }

  return (
    <>
      {/* Privacy Banner */}
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
          Audio deleted for privacy.
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div style={{ marginTop: "10px", color: "red", textAlign: "center" }}>
          {errorMessage}

          {/* Retry Button */}
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
              Retry Microphone
            </button>
          </div>
        </div>
      )}

      {/* Read Aloud Button */}
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
          Read Aloud
        </button>
      )}

      {/* Listening Modal — bounded to reading card */}
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
            Listening…
          </p>

          {/* ✅ Stop Reading Button */}
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
            Stop Reading
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
