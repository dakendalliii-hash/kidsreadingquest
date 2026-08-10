"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // ⭐ Hide Back button completely on the home page
  if (pathname === "/") {
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      style={{
        backgroundColor: "#f5f6fa",
        color: "#2c3e50",
        border: "none",
        borderRadius: "6px",
        padding: "6px 14px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.95rem",
        minWidth: "90px",
        textAlign: "center",
      }}
    >
      Back
    </button>
  );
}
