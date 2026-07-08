export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import HelpNavigation from "@/components/HelpNavigation"; // ✅ client component

export default async function MicrophoneHelpPage() {
  const supabase = await createServerSupabaseClient();

  // Require login
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

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
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <FormContainer>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "left",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            color: "black",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              color: "black",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Technical Instructions: Enabling Your Microphone
          </h1>

          <p style={{ marginBottom: "20px", lineHeight: "1.6", color: "black" }}>
            To record reading passages, your microphone must be enabled in both
            Windows 11 and your web browser. Follow the steps below carefully.
          </p>

          <h2 style={{ fontSize: "1.4rem", marginTop: "20px", color: "black" }}>
            1. Enable Microphone in Windows 11
          </h2>

          <ol style={{ lineHeight: "1.7", marginLeft: "20px", color: "black" }}>
            <li>Click the <strong>Start</strong> button.</li>
            <li>Select <strong>Settings</strong>.</li>
            <li>Choose <strong>Privacy & Security</strong>.</li>
            <li>Click <strong>Microphone</strong>.</li>
            <li>Turn on <strong>Microphone access</strong>.</li>
            <li>Turn on <strong>Let apps access your microphone</strong>.</li>
            <li>Scroll down and ensure your browser (Chrome or Edge) is enabled.</li>
          </ol>

          <h2 style={{ fontSize: "1.4rem", marginTop: "20px", color: "black" }}>
            2. Enable Microphone in Chrome
          </h2>

          <ol style={{ lineHeight: "1.7", marginLeft: "20px", color: "black" }}>
            <li>Open Chrome.</li>
            <li>Click the <strong>lock icon</strong> next to the address bar.</li>
            <li>Select <strong>Site settings</strong>.</li>
            <li>Find <strong>Microphone</strong>.</li>
            <li>Set it to <strong>Allow</strong>.</li>
            <li>Close the tab and reload the page.</li>
          </ol>

          <h2 style={{ fontSize: "1.4rem", marginTop: "20px", color: "black" }}>
            3. Enable Microphone in Microsoft Edge
          </h2>

          <ol style={{ lineHeight: "1.7", marginLeft: "20px", color: "black" }}>
            <li>Open Edge.</li>
            <li>Click the <strong>lock icon</strong> next to the address bar.</li>
            <li>Select <strong>Permissions</strong>.</li>
            <li>Find <strong>Microphone</strong>.</li>
            <li>Set it to <strong>Allow</strong>.</li>
            <li>Reload the page.</li>
          </ol>

          <h2 style={{ fontSize: "1.4rem", marginTop: "20px", color: "black" }}>
            4. Test Your Microphone
          </h2>

          <ol style={{ lineHeight: "1.7", marginLeft: "20px", color: "black" }}>
            <li>Return to your kid’s reading page.</li>
            <li>Click <strong>Read Aloud</strong>.</li>
            <li>If prompted, click <strong>Allow</strong>.</li>
            <li>Begin reading the passage clearly.</li>
          </ol>

          {/* ✅ Back + Home buttons */}
          <HelpNavigation />
        </div>
      </FormContainer>
    </div>
  );
}
