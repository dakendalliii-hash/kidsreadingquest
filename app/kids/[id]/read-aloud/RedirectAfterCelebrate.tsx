// app/kids/[id]/read-aloud/RedirectAfterCelebrate.tsx
"use client";

import { useEffect } from "react";

export default function RedirectAfterCelebrate({
  kidId,
  celebrate,
}: {
  kidId: string;
  celebrate: boolean;
}) {
  useEffect(() => {
    if (celebrate) {
      console.log("[READ-ALOUD PAGE] Celebration active → redirecting soon");
      const timer = setTimeout(() => {
        window.location.href = `/kids/${kidId}/reading/comprehension`;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [celebrate, kidId]);

  return null;
}
