"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

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
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Reading Gym Workout</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">
            Workout Passage — Band {band.replace(" ", "")}
          </h2>

          <p className="mb-4">
            {kidName} will read the following passage aloud. When finished,
            continue to the next step.
          </p>

          <p className="mb-6 whitespace-pre-line">
            {passage}
          </p>

          <button
            onClick={() => router.push(`/kids/${kidId}/read-aloud`)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Begin Read-Aloud
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
