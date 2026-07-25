"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function ResultsClient({
  kidName,
  currentBand,
  recommendedBand,
  resultsSummary,
  score,
}: {
  kidName: string;
  currentBand: string;
  recommendedBand: string;
  resultsSummary: string;
  score: number;
}) {
  const router = useRouter();

  const jumped = recommendedBand !== currentBand;

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Assessment Results</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">
            Reading Fitness Test Summary for {kidName}
          </h2>

          <p className="mb-6 whitespace-pre-line">{resultsSummary}</p>

          <h3 className="text-lg font-semibold mb-2">Recommendation</h3>

          {jumped ? (
            <p className="mb-6 text-green-700 font-medium">
              Great news! Based on reading speed, accuracy, and error types,
              {` ${kidName}`} is ready to move ahead to <strong>{recommendedBand}</strong>.
            </p>
          ) : (
            <p className="mb-6 text-blue-700 font-medium">
              {kidName} should begin at <strong>{currentBand}</strong>. Their reading
              performance matches the expected range for this band.
            </p>
          )}

          <p className="mb-6 text-gray-700">
            You can now go to your Parent Dashboard to begin the Reading Gym
            workouts whenever you're ready.
          </p>

          <button
            onClick={() => router.push("/parent/dashboard")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Go to Parent Dashboard
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
