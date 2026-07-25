"use client";

import AuthCard from "@/components/AuthCard";
import { useRouter } from "next/navigation";

export default function PaymentClient({
  updatePlanType,
  founderFull,
}: {
  updatePlanType: (formData: FormData) => Promise<void>;
  founderFull: boolean;
}) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await updatePlanType(formData);
    router.push("/parent/manage-kids/add");
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-6">Choose Your Plan</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Founder Plan */}
        <AuthCard>
          <h2 className="text-xl font-semibold mb-2">
            Founder Plan ($0/month for life)
          </h2>
          <p className="mb-4">
            Limited early-access plan for the first 50 families. (Will grey out
            automatically once 50 parents select it.)
          </p>

          <form action={handleSubmit}>
            <input type="hidden" name="plan" value="founder" />

            <button
              type="submit"
              disabled={founderFull}
              className={`px-4 py-2 rounded ${
                founderFull
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white"
              }`}
            >
              {founderFull ? "Founder Plan Full" : "Select Founder Plan"}
            </button>
          </form>
        </AuthCard>

        {/* Monthly Plan */}
        <AuthCard>
          <h2 className="text-xl font-semibold mb-2">
            Monthly Plan ($50/month)
          </h2>
          <p className="mb-4">Standard Reading Gym membership.</p>

          <form action={handleSubmit}>
            <input type="hidden" name="plan" value="monthly" />

            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Select Monthly Plan
            </button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
