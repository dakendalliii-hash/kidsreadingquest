import { getUser } from "@/lib/auth/getUser";
import { getRole } from "@/lib/auth/getRole";
import ResponsiveSidebar from "./ResponsiveSidebar";

export default async function Sidebar() {
  const user = await getUser();
  const role = await getRole();

  return <ResponsiveSidebar user={user} role={role} />;
}
