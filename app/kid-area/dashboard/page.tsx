import { requireRole } from "@/lib/auth/requireRole";

export default async function KidDashboard() {
  const user = await requireRole("kid");

  return (
    <div>
      <h1 className="text-2xl font-bold">Kid Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
