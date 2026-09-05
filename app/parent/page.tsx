export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ParentDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  const { data: parentRecord } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!parentRecord) redirect("/unauthorized");

  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, recommended_band")
    .eq("parent_id", parentRecord.id)
    .order("name", { ascending: true });

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
        <h2 style={{ color: "black", marginBottom: "20px" }}>Parent Dashboard</h2>
        <p style={{ color: "black", fontSize: "1.1rem", marginBottom: "20px" }}>
          Select a kid:
        </p>

        {kids && kids.length > 0 ? (
          <div style={{ marginBottom: "30px" }}>
            {kids.map((kid) => (
              <div key={kid.id} style={{ marginBottom: "20px" }}>
                {kid.recommended_band && (
                  <p style={{ color: "black", marginBottom: "10px" }}>
                    Recommended Band: <strong>{kid.recommended_band}</strong>
                  </p>
                )}

                {/* ✅ Each form isolated */}
                <div>
                  <form action={`/kids/${kid.id}/kid-profile/from-existing`} method="get">
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "black", marginBottom: "20px" }}>No kids found.</p>
        )}

        {/* ✅ Separate forms below — not nested */}
        <div style={{ marginTop: "20px" }}>
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
    </div>
  );
}
