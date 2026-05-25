import NavBar from "@/app/components/NavBar";
import { getUser } from "@/lib/supabase/getUser";
import { getRole } from "@/lib/supabase/getRole";

export default async function PublicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const role = await getRole();

  return (
    <div>
      <NavBar user={user} role={role} />
      <main className="p-6">{children}</main>
    </div>
  );
}
