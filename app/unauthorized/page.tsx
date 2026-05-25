"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-lg text-center border border-sky-200">
        <h1 className="text-4xl font-bold text-red-700 mb-4">
          Access Denied
        </h1>

        <p className="text-lg text-sky-900 mb-6">
          You don’t have permission to view this page.
        </p>

        <p className="text-md text-sky-700 mb-8">
          If you believe this is a mistake, please contact an administrator.
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}
