// kidsreadingquest/components/NavBarWrapper.tsx
export const runtime = "nodejs";

import { getAuthState } from "@/lib/auth/getAuthState";
import NavBar from "./NavBar";
import InactivityLogout from "./InactivityLogout";

export default async function NavBarWrapper() {
  const { isLoggedIn } = await getAuthState();

  return (
    <>
      <InactivityLogout isLoggedIn={isLoggedIn} />
      <NavBar isLoggedIn={isLoggedIn} />
    </>
  );
}
