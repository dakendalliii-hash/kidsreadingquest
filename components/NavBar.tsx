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
            fontSize: "2rem",
            textDecoration: "none",
          }}
        >
          Kids Read Quest
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

        {/* ⭐ MINIMAL CHANGE #1 — Logout must appear BEFORE BackButton in DOM */}
        {isLoggedIn && (
          <Link
            href="/logout"
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

              // ⭐ MINIMAL CHANGE #2 — Visually move Logout to the far right
              order: 999,
            }}
          >
            Logout
          </Link>
        )}

        {/* ⭐ MINIMAL CHANGE #3 — BackButton stays last in DOM but appears before Logout */}
        <div style={{ order: 1 }}>
          <BackButton />
        </div>
      </div>
    </nav>
  );
}
