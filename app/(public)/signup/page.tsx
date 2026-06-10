import FormContainer from "@/components/FormContainer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const supabase = createServerSupabaseClient();

  async function handleSignUp(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("❌ Signup failed:", error);
      throw new Error("Signup failed.");
    }

    redirect("/login");
  }

  return (
    <FormContainer>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        Create Account
      </h1>
      <form action={handleSignUp}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Sign Up
        </button>
      </form>
    </FormContainer>
  );
}
