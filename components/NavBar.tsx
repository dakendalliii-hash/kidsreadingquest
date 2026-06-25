// =========================================================
// NAVBAR — UNIFIED BUTTON WIDTH (NO COLOR OR STYLE CHANGES)
// =========================================================

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  // =========================================================
  // SECTION 1 — BACK BUTTON VISIBILITY LOGIC
  // =========================================================
  const showBackButton =
    pathname.startsWith("/parent") ||
    pathname.startsWith("/kids/");

  // =========================================================
  // SECTION 2 — BACK BUTTON HANDLER
  // =========================================================
  const handleBack = () => {
    if (pathname.startsWith("/kids/")) {
      router.push("/parent");
    } else {
      router.back();
    }
  };

  // =========================================================
  // SECTION 3 — NAVBAR RENDER
  // =========================================================
  return (
    <nav
      style={{
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* ========================================================= */}
      {/* SECTION 4 — LEFT SIDE: HOME LINK */}
      {/* ========================================================= */}
      <div>
        <Link
          href="/parent"
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
      </div>

      {/* ========================================================= */}
      {/* SECTION 5 — RIGHT SIDE BUTTONS */}
      {/* ========================================================= */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* ========================================================= */}
        {/* SHOW LOGIN + SIGNUP ONLY ON /login PAGE */}
        {/* ========================================================= */}
        {pathname === "/login" && (
          <>
            <Link
              href="/login"
              style={{
                backgroundColor: "#f5f6fa",
                color: "#2c3e50",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.95rem",
                minWidth: "90px",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Login
            </Link>

            <Link
              href="/signup"
              style={{
                backgroundColor: "#f5f6fa",
                color: "#2c3e50",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.95rem",
                minWidth: "90px",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </>
        )}

        {/* ========================================================= */}
        {/* SHOW BACK + LOGOUT ON ALL OTHER PAGES */}
        {/* ========================================================= */}
        {pathname !== "/login" && (
          <>
            {showBackButton && (
              <button
                onClick={handleBack}
                style={{
                  backgroundColor: "#f5f6fa",
                  color: "#2c3e50",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  minWidth: "90px",
                }}
              >
                Back
              </button>
            )}

{/* ========================================================= */}
{/* SHOW LOGOUT ONLY WHEN LOGGED IN                           */}
{/* ========================================================= */}
{isLoggedIn && pathname !== "/login" && (
  <form action="/logout" method="post">
    <button
      type="submit"
      style={{
        backgroundColor: "#f5f6fa",
        color: "#2c3e50",
        border: "none",
        borderRadius: "6px",
        padding: "6px 14px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.95rem",
        minWidth: "90px",
      }}
    >
      Logout
    </button>
  </form>
)}
      </div>
    </nav>
  );
}
