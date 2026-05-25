"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const DARK_BLUE = "#003366";
const LIGHT_BLUE = "#e0f2ff";

interface NavBarProps {
  user?: User | null;
  role?: string | null;
}

export default function NavBar({ user, role }: NavBarProps) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const links = [{ label: "About Us", href: "/about" }];

  if (!user) {
    links.push(
      { label: "Login", href: "/login" },
      { label: "Sign Up", href: "/signup" }
    );
  }

  if (user && role === "admin") {
    links.push({ label: "Admin Dashboard", href: "/admin-area/dashboard" });
  }

  if (user && role === "parent") {
    links.push({ label: "Parent Dashboard", href: "/parent-area/dashboard" });
  }

  return (
    <header
      className="w-full shadow-md h-[100px]"
      style={{ backgroundColor: LIGHT_BLUE }}
    >
      <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h1
            className="text-4xl font-extrabold tracking-tight"
            style={{ color: DARK_BLUE }}
          >
            Welcome to Kids Reading Quest
          </h1>
          <p
            className="text-lg font-medium italic"
            style={{ color: DARK_BLUE }}
          >
            Your journey to better reading starts here.
          </p>
        </div>

        <nav className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-5 py-3 rounded-full font-semibold text-base transition-colors no-underline"
              style={{
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: DARK_BLUE,
                color: DARK_BLUE,
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-full font-semibold text-base transition-colors"
              style={{
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: DARK_BLUE,
                color: DARK_BLUE,
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
