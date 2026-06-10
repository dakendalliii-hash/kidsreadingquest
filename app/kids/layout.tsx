import { ReactNode } from "react";

export default function KidsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Soft dark overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 0,
        }}
      />

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 1, color: "white" }}>
        {children}
      </div>
    </div>
  );
}
