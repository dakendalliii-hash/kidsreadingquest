import { redirectIfUnauthorized } from "@/lib/auth/redirectIfUnauthorized";

export default async function PublicDashboard() {
  const user = await redirectIfUnauthorized();

  return (
    <div>
      <h1 className="text-2xl font-bold">Public Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
