"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

/**
 * ReadingClient
 *
 * This component is the entry point for the existing‑kid reading flow.
 * After a successful read‑aloud, the server action redirects to:
 *    /kids/[id]?celebrate=1&lang=en
 *
 * ReadingClient detects that redirect, fetches the updated passage
 * (band, siteId, passageIndex, text), and passes it to the wrapper.
 */

export default function ReadingClient({
  kidId,
}: {
  kidId: string;
}) {
  const searchParams = useSearchParams();

  // Query flags from server action redirect
  const celebrate = searchParams.get("celebrate") === "1";
  const lang = (searchParams.get("lang") ?? "en") as "en" | "hindi";

  // State for the next passage
  const [loading, setLoading] = useState(true);
  const [passageText, setPassageText] = useState("");
  const [band, setBand] = useState("");
  const [siteId, setSiteId] = useState(0);
  const [passageIndex, setPassageIndex] = useState(0);

  /**
   * Load the kid's updated progress + passage text
   * after the server action updates progress.
   */
  useEffect(() => {
    async function loadNextPassage() {
      try {
        setLoading(true);

        // 1. Fetch updated progress
        const progressRes = await fetch(`/kids/${kidId}/reading/api/progress`);
        const progress = await progressRes.json();

        setBand(progress.band);
        setSiteId(progress.site_id);
        setPassageIndex(progress.passage_index);

        // 2. Fetch passage text for the updated progress
        const passageRes = await fetch("/api/passage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            band: progress.band,
            siteId: progress.site_id,
            passageIndex: progress.passage_index,
            language: lang,
          }),
        });

        const passageData = await passageRes.json();

console.log("Passage data:", passageData);

        setPassageText(passageData.text ?? "");
      } finally {
        setLoading(false);
      }
    }

    loadNextPassage();
  }, [kidId, lang]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "black" }}>
        {lang === "hindi" ? "अगला पैसेज लोड हो रहा है..." : "Loading next passage..."}
      </div>
    );
  }

  return (
    <KidDetailClientWrapper
      kidId={kidId}
      passageText={passageText}
      initialLanguage={lang}
      band={band}
      siteId={siteId}
      passageIndex={passageIndex}
    />
  );
}
