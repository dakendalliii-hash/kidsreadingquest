import { requireRole } from "@/lib/auth/requireRole";

export default async function ParentDashboard() {
  const user = await requireRole("parent");

  return (
    <div>
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
