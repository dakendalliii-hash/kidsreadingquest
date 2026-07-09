"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function Celebration({
  kidId,
  language,
}: {
  kidId: string;
  language: string;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const bandCompleted = params.get("bandCompleted") === "1";

  useEffect(() => {
    if (params.get("celebrate") === "1") {
      setShowConfetti(true);

      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      const reloadTimer = setTimeout(() => {
        window.location.href = `/kids/${kidId}?lang=${language}&t=${Date.now()}`;
      }, 4500);

      return () => {
        clearTimeout(timer);
        clearTimeout(reloadTimer);
      };
    }
  }, []);

  const ui = {
    congrats: language === "hindi" ? "बहुत अच्छा!" : "Great job!",
    bandDone:
      language === "hindi"
        ? "यह बैंड पूरा हो गया है! अगला बैंड चुनने के लिए माता-पिता से संपर्क करें।"
        : "This band is completed! The parent will choose the next band.",
    analyzing:
      language === "hindi"
        ? "आपकी पढ़ाई का विश्लेषण किया जा रहा है…"
        : "Analyzing your reading…",
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
        />
      )}

      {/* Removed the blank card entirely */}
      {params.get("celebrate") === "1" && (
        <>
          {/* “Analyzing your reading…” ABOVE THE GREEN BAR */}
          <div
            style={{
              position: "fixed",
              bottom: "90px", // positions message just above the green bar
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "10px 20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              zIndex: 9999,
            }}
          >
            <p
              style={{
                fontSize: "1.2rem",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              {ui.analyzing}
            </p>
          </div>
        </>
      )}
    </>
  );
}
