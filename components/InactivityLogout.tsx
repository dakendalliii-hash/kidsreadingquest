"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InactivityLogout({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  useEffect(() => {

console.log("InactivityLogout mounted, isLoggedIn = ", isLoggedIn);

    if (!isLoggedIn) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        router.push("/logout");
      }, 60000); // 60 seconds
    };

    // Activity listeners
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    // Start timer immediately
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [isLoggedIn, router]);

  return null;
}
