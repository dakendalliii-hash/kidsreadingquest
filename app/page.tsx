// kidsreadingquest/app/page.tsx
export const runtime = "nodejs";

export default function HomePage() {
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
      <p
        style={{
          color: "white",
          fontSize: "1.2rem",
          marginTop: "10px",
        }}
      >
        Helping every kid grow through reading.
      </p>
    </div>
  );
}
