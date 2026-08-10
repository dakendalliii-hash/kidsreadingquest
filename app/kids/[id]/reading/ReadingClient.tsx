"use client";

import { useRouter } from "next/navigation";

export default function ReadingClient({
  kidId,
  kidName,
  band,
  passage,
}: {
  kidId: string;
  kidName: string;
  band: string;
  passage: string;
}) {
  const router = useRouter();

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "black",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Reading Gym Workout — Band {band.replace(" ", "")}
      </h1>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
        Workout Passage
      </h2>

      <p
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
        }}
      >
        {passage}
      </p>

      <button
        onClick={() => router.push(`/kids/${kidId}/read-aloud`)}
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
        Begin Read-Aloud
      </button>
    </div>
  );
}
