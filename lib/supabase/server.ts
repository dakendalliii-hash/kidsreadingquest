import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const cookieStore = {
  async get(name: string) {
    const store = await cookies(); // ✅ await the Promise
    return store.get(name)?.value;
  },
  async set(name: string, value: string, options: any) {
    const store = await cookies();
    store.set(name, value, options);
  },
};

/* -------------------------------------------------------
   1. Create SSR Supabase Client
-------------------------------------------------------- */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // ignore during SSR
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (e) {
            // ignore during SSR
          }
        },
      },
    }
  );
}

/* -------------------------------------------------------
   2. Get User (SSR-safe)
-------------------------------------------------------- */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/* -------------------------------------------------------
   3. Get Role from user metadata
-------------------------------------------------------- */
export async function getRole() {
  const user = await getUser();
  return user?.user_metadata?.role ?? null;
}

/* -------------------------------------------------------
   4. Redirect if not logged in
-------------------------------------------------------- */
export async function redirectIfUnauthorized(requiredRole?: string) {
  const user = await getUser();
  if (!user) redirect("/login");

  if (requiredRole) {
    const role = user.user_metadata?.role;
    if (role !== requiredRole) redirect("/unauthorized");
  }

  return user;
}

/* -------------------------------------------------------
   5. Strict role enforcement
-------------------------------------------------------- */
export async function requireRole(role: "admin" | "parent" | "kid") {
  const user = await getUser();
  if (!user) redirect("/login");

  const userRole = user.user_metadata?.role;
  if (userRole !== role) redirect("/unauthorized");

  return user;
}
