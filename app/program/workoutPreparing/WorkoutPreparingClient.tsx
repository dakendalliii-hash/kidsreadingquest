"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function WorkoutPreparingClient({
  kidId,
  kidName,
}: {
  kidId: string;
  kidName: string;
}) {
  const router = useRouter();

  // Auto‑advance after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/kids/${kidId}/reading`);
    }, 15000);

    return () => clearTimeout(timer);
  }, [kidId, router]);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Preparing Your First Workout...</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">
            Setting Up {kidName}’s First Workout
          </h2>

          <p className="mb-6">
            We’re getting everything ready — selecting passages, adjusting
            difficulty, and preparing your kid’s Reading Gym workout.
          </p>

          <div className="flex justify-center mb-6">
            <div className="animate-pulse text-blue-600 text-lg font-semibold">
              Thinking…
            </div>
          </div>

          <p className="text-sm text-gray-600">
            This will take about 10–15 seconds. You’ll be automatically
            redirected when everything is ready.
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
