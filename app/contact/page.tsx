export const runtime = "nodejs";

import FormContainer from "@/components/FormContainer";

export default function ContactPage() {
  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <FormContainer>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "16px",
              padding: "40px",
              width: "85%",
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h1
              style={{
                color: "black",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "25px",
              }}
            >
              Contact Us
            </h1>

            <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "20px" }}>
              A contact form will be added here soon.  
              This page is ready for future fields such as name, email, message, and more.
            </p>

            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "left",
                color: "black",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              <p><strong>Contact Form Placeholder:</strong></p>
              <ul style={{ marginTop: "10px" }}>
                <li>Name field</li>
                <li>Email field</li>
                <li>Message textarea</li>
                <li>Submit button</li>
              </ul>
            </div>
          </div>
        </FormContainer>
      </div>
    </div>
  );
}
