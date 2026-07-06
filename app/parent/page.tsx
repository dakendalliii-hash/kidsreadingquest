// =========================================================
// SECTION 1 — Imports
// =========================================================

export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// =========================================================
// SECTION 2 — Page Component
// =========================================================
export default async function ParentDashboardPage() {
  const supabase = await createServerSupabaseClient();

  // ------------------------------
  // Auth check
  // ------------------------------
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  // ------------------------------
  // Get parent record
  // ------------------------------
  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/not-authorized");

  // ------------------------------
  // Fetch kids
  // ------------------------------
  const { data: kids } = await supabase
    .from("kids")
    .select("id, name")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

  // =========================================================
  // SECTION 3 — Render Page
  // =========================================================
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
        {/* ========================================================= */}
        {/* SECTION 4 — Header */}
        {/* ========================================================= */}
        <h2 style={{ color: "black", marginBottom: "20px" }}>
          Parent Dashboard
        </h2>

        <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "20px" }}>
          Select a kid:
        </p>

        {/* ========================================================= */}
        {/* SECTION 5 — Kids List */}
        {/* ========================================================= */}
        {kids && kids.length > 0 ? (
          <div style={{ marginBottom: "30px" }}>
            {kids.map((kid) => (
              <form key={kid.id} action={`/kids/${kid.id}`} method="get">
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
                  {kid.name}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p style={{ color: "black", marginBottom: "20px" }}>No kids found.</p>
        )}

        {/* ========================================================= */}
        {/* SECTION 6 — Manage Kids Button */}
        {/* ========================================================= */}
        <form action="/parent/manage-kids" method="get">
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
            Manage Kids
          </button>
        </form>

        {/* ========================================================= */}
        {/* SECTION 7 — View Progress Button */}
        {/* ========================================================= */}
        <form action="/parent/progress" method="get">
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
            View Reading Progress Report
          </button>
        </form>

      </div>
    </div>
  );
}
