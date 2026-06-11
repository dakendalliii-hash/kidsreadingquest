// kidsreadingquest/components/AuthCard.tsx

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
backgroundColor: "transparent",
boxShadow: "none",
        borderRadius: "16px",
        padding: "40px",
        width: "85%",
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}
