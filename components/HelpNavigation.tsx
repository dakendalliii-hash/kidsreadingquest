"use client";

export default function HelpNavigation() {
  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <button
        onClick={() => history.back()}
        style={{
          backgroundColor: "#555",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          marginRight: "10px",
        }}
      >
        Back
      </button>

      <a
        href="/"
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        Return Home
      </a>
    </div>
  );
}
