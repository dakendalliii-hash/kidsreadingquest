"use client";

import { useState } from "react";
import Link from "next/link";

interface ResponsiveNavBarProps {
  user: any; // or better: SupabaseUser type if available
  role: string | null;
}

export default function ResponsiveNavBar({ user, role }: ResponsiveNavBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-700 p-4">
      {/* Desktop */}
      <div className="hidden md:flex max-w-5xl mx-auto gap-6 items-center">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>

        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}

        {user && (
          <>
            {role === "admin" && (
              <>
                <Link href="/admin-area/dashboard">Admin Dashboard</Link>
                <Link href="/parent-area/dashboard">Parent Dashboard</Link>
                <Link href="/kid-area/dashboard">Kid Dashboard</Link>
              </>
            )}

            {role === "parent" && (
              <>
                <Link href="/parent-area/dashboard">Parent Dashboard</Link>
                <Link href="/kid-area/dashboard">Kid Dashboard</Link>
              </>
            )}

            {role === "kid" && (
              <>
                <Link href="/kid-area/dashboard">Kid Dashboard</Link>
              </>
            )}

            <Link href="/public-area/dashboard">Public Dashboard</Link>
            <Link href="/logout">Logout</Link>
          </>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex justify-between items-center">
        <span className="font-bold">Menu</span>
        <button onClick={() => setOpen(!open)} className="text-xl">
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 mt-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>

          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}

          {user && (
            <>
              {role === "admin" && (
                <>
                  <Link href="/admin-area/dashboard">Admin Dashboard</Link>
                  <Link href="/parent-area/dashboard">Parent Dashboard</Link>
                  <Link href="/kid-area/dashboard">Kid Dashboard</Link>
                </>
              )}

              {role === "parent" && (
                <>
                  <Link href="/parent-area/dashboard">Parent Dashboard</Link>
                  <Link href="/kid-area/dashboard">Kid Dashboard</Link>
                </>
              )}

              {role === "kid" && (
                <>
                  <Link href="/kid-area/dashboard">Kid Dashboard</Link>
                </>
              )}

              <Link href="/public-area/dashboard">Public Dashboard</Link>
              <Link href="/logout">Logout</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
