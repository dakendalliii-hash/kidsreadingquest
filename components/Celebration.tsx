"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Celebration() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const shouldCelebrate = url.searchParams.get("celebrate");

    if (shouldCelebrate === "1") {
      // Confetti burst
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
      });

      // Remove ?celebrate=1 so it doesn't repeat
      url.searchParams.delete("celebrate");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  return null;
}
