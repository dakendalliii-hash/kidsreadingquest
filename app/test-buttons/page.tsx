export default function TestButtons() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "40px",
          borderRadius: "16px",
          width: "95%",
          maxWidth: "700px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ color: "black", marginBottom: "20px" }}>
          Button Width Test
        </h2>

        {/* Button 1 */}
        <button
          style={{
            backgroundColor: "#3b4a63",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            display: "block",
            width: "80%",
            margin: "0 auto 15px auto",
          }}
        >
          Test Button One
        </button>

        {/* Button 2 */}
        <button
          style={{
            backgroundColor: "#3b4a63",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            display: "block",
            width: "80%",
            margin: "0 auto 15px auto",
          }}
        >
          Another Button
        </button>

        {/* Button 3 */}
        <button
          style={{
            backgroundColor: "#3b4a63",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            display: "block",
            width: "80%",
            margin: "0 auto",
          }}
        >
          Third Button
        </button>
      </div>
    </div>
  );
}
