"use client";

import { useState, useEffect, useRef } from "react";
import { logError } from "@/lib/logging/logError";
import { redirectOnError } from "@/lib/logging/redirectOnError";

// How long to wait after the last recognized speech before scoring (ms).
const GRACE_MS = 2500;

// Android Chrome can end a recognition session after the first pause. If that
// happens before enough words were heard, listening is restarted this many times.
const MAX_AUTO_RESTARTS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Builds ONE transcript from everything Chrome returned in this session.
// Desktop Chrome returns separate segments; Android Chrome can return segments
// that repeat everything said so far, so repeated text is collapsed.
function assembleTranscript(results: any): string {
  let text = "";
  for (let i = 0; i < results.length; i++) {
    const segment = (results[i]?.[0]?.transcript ?? "").trim();
    if (!segment) continue;

    if (!text) {
      text = segment;
      continue;
    }

    if (segment.toLowerCase().startsWith(text.toLowerCase())) {
      text = segment; // segment repeats everything so far
    } else {
      text += " " + segment;
    }
  }
  return text;
}

function joinText(a: string, b: string) {
  return [a, b].filter(Boolean).join(" ").trim();
}

function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function describeRecognitionError(code: string): string {
  switch (code) {
    case "not-allowed":
      return "Microphone access is blocked. Tap the lock icon in Chrome's address bar, choose Permissions, allow Microphone, then tap Retry.";
    case "service-not-allowed":
      return "Speech recognition is unavailable on this device. Check that Google voice typing / Speech Services is enabled, then tap Retry.";
    case "audio-capture":
      return "No microphone was found, or another app is using it. Close other apps and tap Retry.";
    case "network":
      return "Speech recognition needs an internet connection. Check the connection and tap Retry.";
    default:
      return "Microphone error: " + code;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Optional on-screen debug panel: add &micdebug=1 to the page URL.
  const [debugOn, setDebugOn] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const debugOnRef = useRef(false);

  const recognitionRef = useRef<any>(null);
  const hasHandledTranscriptRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const graceTimerRef = useRef<any>(null);
  const committedTextRef = useRef(""); // text from earlier sessions
  const sessionTextRef = useRef(""); // text from the current session
  const manualStopRef = useRef(false);
  const restartCountRef = useRef(0);
  const sessionIdRef = useRef(0);
  const passageWordCountRef = useRef(0);

  // Always points at the latest handleTranscript (avoids stale props/closures)
  const handleTranscriptRef = useRef<(t: string) => void>(() => {});

  const ui = {
    start: "Read Aloud",
    listening: "Listening…",
    stop: "Stop Reading",
    retry: "Retry Microphone",
    privacy: "Audio deleted for privacy.",
    micDenied: "Microphone access denied.",
    notSupported: "Speech recognition is not supported.",
    serverError: "Server error.",
    noSpeech:
      "We didn't hear anything. Hold the tablet close and try again.",
    tooShort: "We only heard part of the passage. Please try reading it again.",
  };

  function log(message: string) {
    console.log("[MicReader]", message);
    if (debugOnRef.current) {
      setDebugLines((prev) => [...prev.slice(-11), message]);
    }
  }

  function clearGraceTimer() {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }

  function resetGraceTimer() {
    clearGraceTimer();
    graceTimerRef.current = setTimeout(
      () => finishAttempt("silence"),
      GRACE_MS
    );
  }

  // Single exit point: score whatever was heard (or explain that nothing was).
  function finishAttempt(reason: string) {
    if (hasHandledTranscriptRef.current) return;
    hasHandledTranscriptRef.current = true;
    clearGraceTimer();

    const transcript = joinText(
      committedTextRef.current,
      sessionTextRef.current
    );
    log(`finish (${reason}): "${transcript}"`);

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

    if (!transcript) {
      setIsListening(false);
      setErrorMessage(ui.noSpeech);
      return;
    }

    handleTranscriptRef.current(transcript);
  }

  // -------------------------------------------------------------------------
  // Create the recognition object for each new passage
  // -------------------------------------------------------------------------
  useEffect(() => {
    log("Resetting recognition for new passage");

    const params = new URLSearchParams(window.location.search);
    debugOnRef.current = params.get("micdebug") === "1";
    setDebugOn(debugOnRef.current);

    hasHandledTranscriptRef.current = false;
    hasCompletedRef.current = false;
    committedTextRef.current = "";
    sessionTextRef.current = "";
    manualStopRef.current = false;
    restartCountRef.current = 0;
    passageWordCountRef.current = countWords(passageEnglish);
    clearGraceTimer();

    try {
      recognitionRef.current?.abort();
    } catch (_) {}
    recognitionRef.current = null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(ui.notSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => log("recognition started");
    recognition.onaudiostart = () => log("audio capture started");
    recognition.onspeechstart = () => log("speech detected");

    recognition.onresult = (event: any) => {
      if (hasHandledTranscriptRef.current) return;

      if (debugOnRef.current) {
        const raw = Array.from(event.results as ArrayLike<any>)
          .map((r: any) => `${r.isFinal ? "F" : "I"}:"${r[0].transcript}"`)
          .join(" | ");
        log("results: " + raw);
      }

      sessionTextRef.current = assembleTranscript(event.results);
      resetGraceTimer();
    };

    recognition.onerror = (event: any) => {
      log("error: " + event.error);

      // These are normal; onend decides what to do next.
      if (event.error === "no-speech" || event.error === "aborted") return;

      // Real problem (permission, service, mic, network): explain and let the
      // kid retry. This is not a failed reading attempt.
      clearGraceTimer();
      hasHandledTranscriptRef.current = true;
      setIsListening(false);
      setErrorMessage(describeRecognitionError(event.error));
      try {
        recognition.abort();
      } catch (_) {}
    };

    recognition.onend = () => {
      log("recognition ended");
      if (hasHandledTranscriptRef.current) return;

      // Bank what this session heard
      committedTextRef.current = joinText(
        committedTextRef.current,
        sessionTextRef.current
      );
      sessionTextRef.current = "";

      const words = countWords(committedTextRef.current);
      const enough = words >= Math.floor(passageWordCountRef.current * 0.7);

      if (
        manualStopRef.current ||
        enough ||
        words === 0 ||
        restartCountRef.current >= MAX_AUTO_RESTARTS
      ) {
        finishAttempt("end");
        return;
      }

      // Chrome closed the session early (common on Android) - keep listening.
      restartCountRef.current += 1;
      log(`restarting (${restartCountRef.current}/${MAX_AUTO_RESTARTS})`);
      setTimeout(() => {
        if (hasHandledTranscriptRef.current) return;
        try {
          recognition.start();
        } catch (err) {
          log("restart failed: " + String(err));
          finishAttempt("restart-failed");
        }
      }, 250);
    };

    recognitionRef.current = recognition;

    return () => {
      clearGraceTimer();
      recognition.onstart = null;
      recognition.onaudiostart = null;
      recognition.onspeechstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch (_) {}
    };
  }, [passageEnglish]);

  // Keep the ref pointed at the newest handleTranscript after every render
  useEffect(() => {
    handleTranscriptRef.current = handleTranscript;
  });

  // -------------------------------------------------------------------------
  // Scoring (unchanged logic, plus feedback when the transcript is too short)
  // -------------------------------------------------------------------------
  async function handleTranscript(transcript: string) {
    console.log("[MicReader] handleTranscript fired with:", transcript);

    const passageWords = passageEnglish.split(/\s+/);
    const spokenWords = transcript.trim().split(/\s+/);

    const minRequiredWords = Math.floor(passageWords.length * 0.7);

    endTimeRef.current = performance.now();

    if (startTimeRef.current == null || endTimeRef.current == null) {
      console.error("Timing error: timestamps missing");
      setIsListening(false);
      return;
    }

    const totalSeconds = Math.round(
      (endTimeRef.current - startTimeRef.current) / 1000
    );

    if (spokenWords.length < minRequiredWords) {
      // Not enough of the passage was heard: tell the kid and let them retry.
      setIsListening(false);
      setErrorMessage(ui.tooShort);
      return;
    }

    function normalize(word: string) {
      return word
        .toLowerCase()
        .replace(/[.,!?;:]/g, "") // punctuation
        .replace(/['"]/g, "") // quotes
        .trim();
    }

    const normalizedPassageWords = passageWords.map(normalize);
    const normalizedSpokenWords = spokenWords.map(normalize);

    function fuzzyMatch(a: string, b: string) {
      if (!a || !b) return false;

      if (a === b) return true;

      if (Math.abs(a.length - b.length) <= 1) {
        let mismatches = 0;
        let i = 0,
          j = 0;

        while (i < a.length && j < b.length) {
          if (a[i] !== b[j]) {
            mismatches++;
            if (mismatches > 1) return false;

            if (a.length > b.length) i++;
            else if (b.length > a.length) j++;
            else {
              i++;
              j++;
            }
          } else {
            i++;
            j++;
          }
        }

        return mismatches <= 1;
      }

      return false;
    }

    const totalWords = passageWords.length;
    let correct = 0;
    let errors = 0;

    for (let i = 0; i < passageWords.length; i++) {
      if (
        normalizedSpokenWords[i] &&
        fuzzyMatch(normalizedSpokenWords[i], normalizedPassageWords[i])
      ) {
        correct++;
      } else {
        errors++;
      }
    }

    const accuracy = Math.round((correct / totalWords) * 100);
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
      await logError("MicReader", err);
      redirectOnError();

      onComplete({
        metrics,
        server: { fluencyPassed: false },
      });
    }

    setIsListening(false);
  }

  // -------------------------------------------------------------------------
  // Start / stop
  // -------------------------------------------------------------------------
  // NOTE: no getUserMedia() here. Holding a separate mic stream open while
  // SpeechRecognition runs can block it on Android. recognition.start() asks
  // for mic permission itself, and onerror reports a denial.
  function startListening() {
    setErrorMessage("");

    const recognition = recognitionRef.current;
    if (!recognition) {
      setErrorMessage(ui.notSupported);
      return;
    }

    sessionIdRef.current += 1;
    hasHandledTranscriptRef.current = false;
    hasCompletedRef.current = false;
    manualStopRef.current = false;
    restartCountRef.current = 0;
    committedTextRef.current = "";
    sessionTextRef.current = "";
    clearGraceTimer();

    startTimeRef.current = performance.now();

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      log("start failed: " + String(err));
      setIsListening(false);
      setErrorMessage("One moment, then tap Retry.");
      logError("MicReader", err);
    }
  }

  function stopListening() {
    log("Manual stop triggered");
    manualStopRef.current = true;
    clearGraceTimer();

    try {
      recognitionRef.current?.stop();
    } catch (_) {}

    // onend normally scores what was heard. Safety net in case it never fires.
    const id = sessionIdRef.current;
    setTimeout(() => {
      if (sessionIdRef.current === id) finishAttempt("manual-stop-timeout");
    }, 1500);
  }

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
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

      {debugOn && (
        <pre
          style={{
            marginTop: "16px",
            padding: "8px",
            background: "#111",
            color: "#0f0",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
            borderRadius: "6px",
            maxHeight: "220px",
            overflow: "auto",
          }}
        >
          {debugLines.join("\n") || "(debug on - no events yet)"}
        </pre>
      )}
    </>
  );
}
