"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

/**
 * ReadingClient (English‑only version)
 *
 * Loads the kid's current progress OR override progress from redirect params,
 * then loads the correct English passage.
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

  // ⭐ NEW: Override values from redirect
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

        // 1. Fetch current progress (NOT advance)
        const progressRes = await fetch(`/kids/${kidId}/reading/api/progress`);
        const progress = await progressRes.json();

        // ⭐ Apply override params if present
        const effectiveBand = overrideBand || progress.band;
        const effectiveSiteId = Number(overrideSiteId) || progress.site_id;
        const effectivePassageIndex =
          Number(overridePassageIndex) || progress.passage_index;

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
