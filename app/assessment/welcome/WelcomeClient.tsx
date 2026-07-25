"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function WelcomeClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Fitness Test</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">What to Expect</h2>

          <p className="mb-4">
            This short reading fitness test helps us understand your kid’s
            current reading ability. It takes just a few minutes and includes a
            single reading passage followed by automatic analysis.
          </p>

          <p className="mb-4">
            The test measures reading speed, accuracy, and error types. These
            results help us build the correct Reading Gym training program.
          </p>

          <p className="mb-6">
            When you're ready, continue to the instructions.
          </p>

          <button
            onClick={() => router.push("/assessment/instructions")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Continue
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
