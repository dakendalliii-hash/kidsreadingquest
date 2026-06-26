// kidsreadingquest/app/unauthorized/page.tsx
export const runtime = "nodejs";

import { getAuthState } from "@/lib/auth/getAuthState";
import Link from "next/link";

export default async function UnauthorizedPage() {
  const { isLoggedIn } = await getAuthState();

  // Dynamic home route based on login state
  const homeHref = isLoggedIn ? "/parent" : "/";

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        padding: "80px 40px 40px 40px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Access Denied
      </h1>

      <p
        style={{
          color: "white",
          fontSize: "1.1rem",
          marginBottom: "30px",
        }}
      >
        You do not have permission to view this page.<br />
        Please log in with the correct account or return to the home page.
      </p>

<Link
  href="/"
  style={{
    backgroundColor: "#f5f6fa",
    color: "#2c3e50",
    border: "none",
    borderRadius: "6px",
    padding: "8px 18px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    textDecoration: "none",
  }}
>
  Return Home
</Link>
    </div>
  );
}
