"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InactivityLogout({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  useEffect(() => {
    console.log("InactivityLogout mounted, isLoggedIn = ", isLoggedIn);

    if (!isLoggedIn) return;

    let timeout: NodeJS.Timeout | null = null;

    // Reset inactivity timer AFTER it has started
    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        router.push("/logout");
      }, 240000); // 4 minutes AFTER last activity
    };

    // Start timer only after first activity
    const startOnFirstActivity = () => {
      resetTimer();

      // Remove first-activity listeners
      window.removeEventListener("mousemove", startOnFirstActivity);
      window.removeEventListener("keydown", startOnFirstActivity);
      window.removeEventListener("click", startOnFirstActivity);
      window.removeEventListener("touchstart", startOnFirstActivity);

      // Now attach normal reset listeners
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);
      window.addEventListener("touchstart", resetTimer);
    };

    // First-activity listeners
    window.addEventListener("mousemove", startOnFirstActivity);
    window.addEventListener("keydown", startOnFirstActivity);
    window.addEventListener("click", startOnFirstActivity);
    window.addEventListener("touchstart", startOnFirstActivity);

    return () => {
      if (timeout) clearTimeout(timeout);

      window.removeEventListener("mousemove", startOnFirstActivity);
      window.removeEventListener("keydown", startOnFirstActivity);
      window.removeEventListener("click", startOnFirstActivity);
      window.removeEventListener("touchstart", startOnFirstActivity);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [isLoggedIn, router]);

  return null;
}
