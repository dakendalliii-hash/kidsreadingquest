"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function DisclaimerClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Fitness Test Disclaimer</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">Before You Begin</h2>

          <p className="mb-4">
            This short reading fitness test helps us determine your kid’s
            starting band level. It is not a diagnostic tool and does not
            evaluate learning disabilities or reading disorders.
          </p>

          <p className="mb-4">
            The test measures reading speed, accuracy, and error types. Your
            kid’s results will be used only to build the correct Reading Gym
            training program.
          </p>

          <p className="mb-6">
            By continuing, you acknowledge that this assessment is for training
            purposes only.
          </p>

          <button
            onClick={() => router.push("/assessment/welcome")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Continue
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
