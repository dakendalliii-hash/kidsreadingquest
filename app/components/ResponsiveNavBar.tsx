"use client";

import { useState } from "react";
import Link from "next/link";

interface NavBarProps {
  user?: any;
  role?: string | null;
}

export default function NavBar({ user, role }: NavBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-[#003366] py-4 shadow-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4">

        {/* Logo */}
        <Link
          href="/"
          className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
        >
          Kids Reading Quest
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">

          <Link
            href="/about"
            className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
          >
            About Us
          </Link>

          {!user && (
            <>
              <Link
                href="/login"
                className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && role === "admin" && (
            <Link
              href="/admin-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
            >
              Admin Dashboard
            </Link>
          )}

          {user && role === "parent" && (
            <Link
              href="/parent-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
            >
              Parent Dashboard
            </Link>
          )}

          {user && role === "kid" && (
            <Link
              href="/kid-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold hover:bg-[#003366] hover:text-white transition"
            >
              My Reading Quest
            </Link>
          )}
        </div>
      </nav>
{user && (
  <Link
    href="/logout"
    className="bg-red-600 text-white border-2 border-red-800 rounded-full px-4 py-2 font-semibold hover:bg-red-800 transition"
  >
    Logout
  </Link>
)}

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col items-center gap-3 py-4 bg-[#003366]">
          <Link
            href="/about"
            className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
          >
            About Us
          </Link>

          {!user && (
            <>
              <Link
                href="/login"
                className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && role === "admin" && (
            <Link
              href="/admin-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
            >
              Admin Dashboard
            </Link>
          )}

          {user && role === "parent" && (
            <Link
              href="/parent-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
            >
              Parent Dashboard
            </Link>
          )}

          {user && role === "kid" && (
            <Link
              href="/kid-area/dashboard"
              className="bg-white text-[#003366] border-2 border-[#003366] rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-[#003366] hover:text-white transition"
            >
              My Reading Quest
            </Link>
          )}
{user && (
  <Link
    href="/logout"
    className="bg-red-600 text-white border-2 border-red-800 rounded-full px-4 py-2 font-semibold w-40 text-center hover:bg-red-800 transition"
  >
    Logout
  </Link>
)}

        </div>
      )}
    </header>
  );
}
