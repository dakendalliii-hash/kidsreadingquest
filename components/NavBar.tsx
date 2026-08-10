// =========================================================
// NAVBAR — SSR-SAFE VERSION (NO CLIENT HOOKS)
// =========================================================

import Link from "next/link";
import BackButton from "./BackButton";

export default function NavBar({
  isLoggedIn,
  showDashboardButton,
}: {
  isLoggedIn: boolean;
  showDashboardButton: boolean;
}) {
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
        {/* ⭐ Dashboard button appears ONLY on /parent/* subpages */}
        {isLoggedIn && showDashboardButton && (
          <Link
            href="/parent"
            style={{
              backgroundColor: "#2563eb", // btn-blue
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.95rem",
              minWidth: "110px",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
        )}

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

        {/* ❌ Reading Fitness Test removed */}

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

        {/* ⭐ BACK BUTTON — furthest right */}
        <BackButton />
      </div>
    </nav>
  );
}
