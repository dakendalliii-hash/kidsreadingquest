import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "1rem 2rem",
      background: "rgba(0,0,0,0.6)",
      color: "white"
    }}>
      <h1>KidsReadingQuest</h1>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link href="/">Home</Link>
        <Link href="/about">About Us</Link>
        <Link href="/signup">Sign Up</Link>
      </div>
    </nav>
  );
}
