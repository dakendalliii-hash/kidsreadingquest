"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function Celebration({
  kidId,
  language,
}: {
  kidId: string;
  language: string;
}) {
  const [visible, setVisible] = useState(true);

  const message =
    language === "hindi"
      ? "शानदार काम!"
      : "Great job! You completed this passage!";

  // ⭐ Client-only confetti (hydration-safe)
  useEffect(() => {
    // Fire confetti once on mount
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Hide popup after 5 seconds
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
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
        {message}
      </p>

      <div style={{ marginTop: "10px", fontSize: "1.5rem" }}>
        🎉 🎉 🎉
      </div>
    </div>
  );
}
