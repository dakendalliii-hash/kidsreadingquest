"use client";

import { useState } from "react";
import Link from "next/link";

interface ResponsiveSidebarProps {
  user: any; // Replace with Supabase User type later
  role: string | null;
}

export default function ResponsiveSidebar({ user, role }: ResponsiveSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <span className="font-bold">Menu</span>
        <button onClick={() => setOpen(!open)} className="text-xl">
          ☰
        </button>
      </div>

      {/* Sidebar container */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-slate-900 text-white p-6 border-r border-slate-700 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <nav className="flex flex-col gap-4">
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
        </nav>
      </aside>
    </>
  );
}
