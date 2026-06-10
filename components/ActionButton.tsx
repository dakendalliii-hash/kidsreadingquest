export default function ActionButton({ label }: { label: string }) {
  return (
    <button
      style={{
        padding: "12px 24px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#3b4a63",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        display: "block",
        margin: "15px auto",
        width: "200px",
      }}
    >
      {label}
    </button>
  );
}
