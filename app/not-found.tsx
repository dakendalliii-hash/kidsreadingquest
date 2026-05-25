"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-lg text-center border border-gray-300">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>

        <p className="text-md text-gray-600 mb-8">
          The resource you’re trying to access doesn’t exist or has been moved.
        </p>

        <Link
          href="/admin-area/dashboard"
          className="px-6 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors"
        >
          Return to Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
