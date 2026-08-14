"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

/**
 * ReadingClient (English‑only version)
 *
 * This component loads the kid's current progress and the correct English passage.
 * Hindi support is commented out per project directive.
 */

export default function ReadingClient({
  kidId,
}: {
  kidId: string;
}) {
  const searchParams = useSearchParams();

  // Force English only
  const lang: "en" = "en";
  // const lang = (searchParams.get("lang") ?? "en") as "en" | "hindi"; // ❌ commented out

  const celebrate = searchParams.get("celebrate") === "1";

  // State for the passage
  const [loading, setLoading] = useState(true);
  const [passageText, setPassageText] = useState("");
  const [band, setBand] = useState("");
  const [siteId, setSiteId] = useState(0);
  const [passageIndex, setPassageIndex] = useState(0);

  /**
   * Load the kid's current progress + English passage text.
   * This runs on mount and after redirect from read‑aloud.
   */
  useEffect(() => {
    async function loadCurrentPassage() {
      try {
        setLoading(true);

        // 1. Fetch current progress (NOT advance)
        const progressRes = await fetch(`/kids/${kidId}/reading/api/progress`);
        const progress = await progressRes.json();

        setBand(progress.band);
        setSiteId(progress.site_id);
        setPassageIndex(progress.passage_index);

        // 2. Fetch English passage for current progress
        const passageRes = await fetch(
          `/kids/${kidId}/reading/api/passage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              band: progress.band,
              siteId: progress.site_id,
              passageIndex: progress.passage_index,
              language: "en", // English only
              // language: lang, // ❌ commented out
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
  }, [kidId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "black" }}>
        Loading next passage...
        {/* {lang === "hindi" ? "अगला पैसेज लोड हो रहा है..." : "Loading next passage..."} */}
      </div>
    );
  }

  return (
    <KidDetailClientWrapper
      kidId={kidId}
      passageText={passageText}
      initialLanguage="en" // English only
      // initialLanguage={lang} // ❌ commented out
      band={band}
      siteId={siteId}
      passageIndex={passageIndex}
    />
  );
}
