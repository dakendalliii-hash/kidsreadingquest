"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

/**
 * ReadingClient (English‑only version)
 *
 * Loads the kid's current progress OR override progress from redirect params,
 * then loads the correct English passage.
 *
 * FIXES:
 *   - Deterministic override handling (no fallback to 0)
 *   - Correct redirect consumption from API routes
 *   - Stable workout progression (.1 → .2 → .3 → results)
 */

export default function ReadingClient({
  kidId,
}: {
  kidId: string;
}) {
  const searchParams = useSearchParams();

  // Force English only
  const lang: "en" = "en";

  // Celebration flag
  const celebrate = searchParams.get("celebrate") === "1";

  // ⭐ Override values from redirect (raw strings)
  const overrideBand = searchParams.get("band");
  const overrideSiteId = searchParams.get("siteId");
  const overridePassageIndex = searchParams.get("passageIndex");

  // State for the passage
  const [loading, setLoading] = useState(true);
  const [passageText, setPassageText] = useState("");
  const [band, setBand] = useState("");
  const [siteId, setSiteId] = useState(0);
  const [passageIndex, setPassageIndex] = useState(0);

  /**
   * Load the kid's current progress + English passage text.
   * This runs on mount and after redirect from results → next passage.
   */
  useEffect(() => {
    async function loadCurrentPassage() {
      try {
        setLoading(true);

console.log("[READING CLIENT] searchParams:", {
  overrideBand,
  overrideSiteId,
  overridePassageIndex,
});

        // 1. Fetch current progress (NOT advance)
        const progressRes = await fetch(`/kids/${kidId}/reading/api/progress`);
        const progress = await progressRes.json();

console.log("[READING CLIENT] progress:", progress);

        // ⭐ Correct override logic:
        // Only apply override when the param is actually present (not null).
        const effectiveBand =
          overrideBand !== null ? overrideBand : progress.band;

        const effectiveSiteId =
          overrideSiteId !== null
            ? Number(overrideSiteId)
            : progress.site_id;

        const effectivePassageIndex =
          overridePassageIndex !== null
            ? Number(overridePassageIndex)
            : progress.passage_index;

console.log("[READING CLIENT] effective:", {
  effectiveBand,
  effectiveSiteId,
  effectivePassageIndex,
});

        setBand(effectiveBand);
        setSiteId(effectiveSiteId);
        setPassageIndex(effectivePassageIndex);

        // 2. Fetch English passage for effective progress
        const passageRes = await fetch(
          `/kids/${kidId}/reading/api/passage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              band: effectiveBand,
              siteId: effectiveSiteId,
              passageIndex: effectivePassageIndex,
              language: "en", // English only
            }),
          }
        );

        const passageData = await passageRes.json();

console.log("[READING CLIENT] passageData:", passageData);
if (!passageData.text) {
  console.warn("[READING CLIENT] EMPTY PASSAGE TEXT — this triggers results page");
}

        setPassageText(passageData.text ?? "");
      } finally {
        setLoading(false);
      }
    }

    loadCurrentPassage();
  }, [kidId, overrideBand, overrideSiteId, overridePassageIndex]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "black" }}>
        Loading next passage...
      </div>
    );
  }

  return (
    <KidDetailClientWrapper
      kidId={kidId}
      passageText={passageText}
      initialLanguage="en"
      band={band}
      siteId={siteId}
      passageIndex={passageIndex}
    />
  );
}
