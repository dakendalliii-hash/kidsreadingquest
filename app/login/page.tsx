import { createSSRClient } from "@/lib/auth/createSSRClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server"; // ✅ keep it here, not at the top

  const supabase = await createSSRClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    redirect("/login");
  }

  redirect("/post-login");
}

export default async function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-950 border border-slate-700 rounded-xl px-8 py-10 max-w-md w-auto">
        <h1 className="text-3xl font-bold text-sky-400 text-center mb-6">
          Login
        </h1>

        <form action={loginAction} className="space-y-5">
          <div>
            <label className="block mb-1 text-slate-200 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-200 text-sm">Password</label>
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
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
