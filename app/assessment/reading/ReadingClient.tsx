"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";

export default function ReadingClient({
  passage,
  band,
}: {
  passage: string;
  band: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Reading Passage</h1>

      <div className="w-full max-w-3xl">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-4">
            Band {band.replace(" ", "")} Assessment Passage
          </h2>

          <p className="mb-6 whitespace-pre-line">
            {passage}
          </p>

          <button
            onClick={() => router.push("/assessment/processing")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            I Finished Reading
          </button>
        </AuthCard>
      </div>
    </div>
  );
}
