"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function InstructionsClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Fitness Test Instructions</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">How the Test Works</h2>

          <p className="mb-4">
            Your kid will read a short passage aloud. The system will listen and
            automatically analyze reading speed, accuracy, and error types.
          </p>

          <p className="mb-4">
            The passage should be read in a clear voice, at a comfortable pace.
            There is no need to rush — natural reading gives the most accurate
            results.
          </p>

          <p className="mb-4">
            You may sit nearby for support, but please avoid correcting or
            prompting during the reading. The system needs to capture your kid’s
            natural reading patterns.
          </p>

          <p className="mb-6">
            When you're ready, continue to the reading passage.
          </p>

          <button
            onClick={() => router.push("/assessment/reading")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Begin Reading
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
