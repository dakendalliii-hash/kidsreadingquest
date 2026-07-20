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

  const showBackButton =
    pathname.startsWith("/parent") ||
    pathname.startsWith("/kids/");

  const handleBack = () => {
    if (pathname.startsWith("/kids/")) {
      router.push("/parent");
    } else {
      router.back();
    }
  };

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
      <div>
        <Link
          href="/"
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

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link
          href="/faq"
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
          FAQ
        </Link>

        {/* ⭐ NEW BUTTON — PUBLIC ASSESSMENT PAGE */}
        <Link
          href="/assessment"
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
          Take Assessment Test
        </Link>

        {/* ⭐ FIXED: Added /forgot-password to safe pages */}
        {(pathname === "/login" ||
          pathname === "/" ||
          pathname === "/forgot-password" ||
          pathname === "/update-password") && (
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

            {pathname === "/" && (
              <Link
                href="/contact"
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
                Contact Us
              </Link>
            )}
          </>
        )}

        {pathname !== "/login" &&
          pathname !== "/" &&
          pathname !== "/forgot-password" &&
          pathname !== "/update-password" && (
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

              {isLoggedIn && (
                <Link
                  href="/help/microphone"
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
                  Technical Instructions
                </Link>
              )}

              {isLoggedIn && (
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
            </>
          )}
      </div>
    </nav>
  );
}
