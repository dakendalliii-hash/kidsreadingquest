import { redirectIfUnauthorized } from "@/lib/auth/redirectIfUnauthorized";
import { redirect } from "next/navigation";
import LoginForm from "@/app/components/LoginForm";

export default async function LoginPage() {
  const user = await redirectIfUnauthorized().catch(() => null);

  if (user) {
    const role = user.user_metadata?.role;

    if (role === "admin") redirect("/admin-area/dashboard");
    if (role === "parent") redirect("/parent-area/dashboard");
    if (role === "kid") redirect("/kid-area/dashboard");

    redirect("/set-role");
  }

  return <LoginForm />;
}
