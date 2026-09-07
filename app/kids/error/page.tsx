// app/kids/error/page.tsx
export default function UniversalErrorPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p>The reading session encountered an unexpected error.</p>

      <div style={{ marginTop: "20px" }}>
        <a href="/parent" style={{ marginRight: "12px" }}>
          Return to Parent Dashboard
        </a>
        <a href="/">Go to Home</a>
      </div>
    </div>
  );
}
