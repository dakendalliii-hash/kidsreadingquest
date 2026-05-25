import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// 🔐 Server action: handle signup
async function signupAction(formData: FormData) {
  "use server";

  const supabase = await createSSRClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1️⃣ Create the Supabase auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    redirect("/signup");
  }

  const user = data.user;
  if (!user) redirect("/signup");

  // 2️⃣ Insert into parents table (RBAC assignment)
  const { error: parentError } = await supabase
    .from("parents")
    .insert({
      auth_id: user.id,
    });

  if (parentError) {
    console.error("Parent creation error:", parentError.message);
    redirect("/signup");
  }

  // 3️⃣ Redirect to parent dashboard
  redirect("/parent-area/dashboard");
}

export default async function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-950 border border-slate-700 rounded-xl px-8 py-10 max-w-md w-auto">
        <h1 className="text-3xl font-bold text-sky-400 text-center mb-6">
          Create Account
        </h1>

        <form action={signupAction} className="space-y-5">
          <div>
            <label className="block mb-1 text-slate-200 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-200 text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}
