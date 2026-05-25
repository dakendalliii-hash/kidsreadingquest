"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-md w-full border border-sky-200">
        <h1 className="text-3xl font-bold text-sky-900 text-center mb-6">
          Set New Password
        </h1>

        {error && (
          <p className="text-red-600 font-medium mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sky-900 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-sky-300 rounded-md focus:ring-2 focus:ring-sky-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sky-900 font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-sky-300 rounded-md focus:ring-2 focus:ring-sky-600"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition flex items-center justify-center
              ${
                loading
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-sky-700 hover:bg-sky-800 text-white"
              }
            `}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
