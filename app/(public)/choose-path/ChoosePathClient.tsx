"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function ChoosePathClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Choose Your Kid’s Path</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Fitness Test */}
        <AuthCard>
          <h2 className="text-xl font-semibold mb-2">Fitness Test</h2>
          <p className="mb-4">
            A quick reading assessment to determine your kid’s starting band.
          </p>

          <button
            onClick={() => router.push("/assessment/disclaimer")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Start Fitness Test
          </button>
        </AuthCard>

        {/* Training Plan */}
        <AuthCard>
          <h2 className="text-xl font-semibold mb-2">Training Plan</h2>
          <p className="mb-4">
            Skip the assessment and begin the Reading Gym training program.
          </p>

          <button
            onClick={() => router.push("/program/intro")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Start Training Plan
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
