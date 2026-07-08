"use client";

import { useEffect } from "react";

export default function RedirectHandler({
  redirectUrl,
}: {
  redirectUrl: string | null;
}) {
  useEffect(() => {
    if (!redirectUrl) return;

    // Confetti typically lasts ~2 seconds
    const confettiDuration = 2000;

    // Your chosen delay: 2 seconds after confetti
    const extraDelay = 2000;

    const totalDelay = confettiDuration + extraDelay;

    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [redirectUrl]);

  return null;
}
