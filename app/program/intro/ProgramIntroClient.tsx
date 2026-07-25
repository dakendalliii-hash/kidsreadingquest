"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function ProgramIntroClient({
  kidId,
  kidName,
}: {
  kidId: string;
  kidName: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Reading Gym Program</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">
            Welcome to Your Kid’s Reading Program
          </h2>

          <p className="mb-4">
            We’ve built a personalized Reading Gym program designed to help
            {` ${kidName}`} strengthen reading skills step by step.
          </p>

          <p className="mb-4">
            Each workout includes three passages, vocabulary questions,
            comprehension questions, and automatic difficulty adjustments based
            on performance.
          </p>

          <p className="mb-6">
            Your kid’s progress will be tracked automatically, and you’ll see
            weekly summaries inside your parent dashboard.
          </p>

          <button
            onClick={() => router.push(`/kids/${kidId}/reading`)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Start First Workout
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
