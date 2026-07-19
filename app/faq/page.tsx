export const runtime = "nodejs";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import FormContainer from "@/components/FormContainer";

export default async function FAQPage() {
  const supabase = await createServerSupabaseClient();

  const { data: faqs, error } = await supabase
    .from("faq")
    .select("*")
    .order("order", { ascending: true });

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        padding: "80px 40px 40px 40px",
      }}
    >
      <FormContainer>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "16px",
            padding: "40px",
            width: "85%",
            maxWidth: "700px",
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
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
            Frequently Asked Questions
          </h1>

          {/* Accordion */}
          <div>
            {faqs?.map((item) => (
              <details
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "12px",
                  border: "1px solid #ccc",
                }}
              >
                <summary
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    color: "black",
                  }}
                >
                  {item.question}
                </summary>

                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "1rem",
                    color: "black",
                  }}
                >
                  {item.response}
                </p>
              </details>
            ))}
          </div>
        </div>
      </FormContainer>
    </div>
  );
}
