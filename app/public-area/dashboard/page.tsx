interface DashboardProps {
  user?: { email?: string };
}

export default function PublicDashboard({ user }: DashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-white text-3xl font-bold">Public Dashboard</h1>
      <p>Welcome, {user?.email ?? "Guest"}</p>
    </div>
  );
}
