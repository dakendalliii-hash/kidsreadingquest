import { requireRole } from "@/lib/auth/requireRole";

export default async function AdminDashboard() {
  const user = await requireRole("admin");

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
