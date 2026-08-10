"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function ProcessingClient() {
  const router = useRouter();

  // Auto‑advance after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/assessment/results");
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Processing Results</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">Analyzing Reading</h2>

          <p className="mb-6">
            We’re analyzing your kid’s reading speed, accuracy, and error types.
            This will only take a moment.
          </p>

          <div className="flex justify-center mb-4">
            <div className="animate-pulse text-blue-600 text-lg font-semibold">
              Processing…
            </div>
          </div>

          <p className="text-sm text-gray-600">
            You will be automatically redirected when the analysis is complete.
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
