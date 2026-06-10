"use client";

import { useEffect } from "react";

export default function PostLogout() {
  useEffect(() => {
    // Force a full reload so cookies are re‑evaluated
    window.location.href = "/login";
  }, []);

  return <p>Logging out…</p>;
}
