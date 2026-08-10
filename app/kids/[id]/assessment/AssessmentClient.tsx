"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import MicReader from "@/components/MicReader";

export default function AssessmentClient({
  kidId,
  band,
  title,
  textEn,
  textHi,
}: {
  kidId: string;
  band: string;
  title: string;
  textEn: string;
  textHi: string;
}) {
  const router = useRouter();
  const [isReading, setIsReading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleResults = (results: any) => {
    setIsComplete(true);

    const url = new URL(
      `/kids/${kidId}/assessment/results`,
      window.location.origin
    );

    url.searchParams.set("band", band);
    url.searchParams.set("title", title);
    url.searchParams.set("text_en", textEn);
    url.searchParams.set("text_hi", textHi);

    url.searchParams.set("wpm", String(results.wpm));
    url.searchParams.set("accuracy", String(results.accuracy));
    url.searchParams.set("errors", String(results.errors));
    url.searchParams.set("total_words", String(results.totalWords));
    url.searchParams.set("total_seconds", String(results.totalSeconds));

    url.searchParams.set("mispronounced", String(results.mispronounced));
    url.searchParams.set("skipped", String(results.skipped));
    url.searchParams.set("inserted", String(results.inserted));
    url.searchParams.set("repeated", String(results.repeated));

    url.searchParams.set("placement", results.placement);
    url.searchParams.set("reason", results.reason);

    router.push(url.toString());
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", color: "black" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        {title}
      </h1>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>English Passage</h2>
      <p style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px", lineHeight: "1.6" }}>
        {textEn}
      </p>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Hindi Passage</h2>
      <p style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px", lineHeight: "1.6" }}>
        {textHi}
      </p>

      {!isReading && !isComplete && (
        <button
          onClick={() => setIsReading(true)}
          style={{
            width: "95%",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            whiteSpace: "nowrap",
            marginBottom: "20px",
          }}
        >
          Start Reading
        </button>
      )}

<MicReader
  passageEnglish={textEn}
  passageLocalized={textHi}
  kidId={kidId}
  language="en"
  band={band}
  onComplete={handleResults}
/>

      {isComplete && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#e8f5e9",
            borderRadius: "8px",
            color: "black",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Processing results…
        </div>
      )}
    </div>
  );
}
