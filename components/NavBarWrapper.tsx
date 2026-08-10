export const runtime = "nodejs";

import { getAuthState } from "@/lib/auth/getAuthState";
import NavBar from "./NavBar";

export default async function NavBarWrapper() {
  const { isLoggedIn } = await getAuthState();

  // ⭐ Next.js 16: No server-side pathname detection available.
  // NavBarWrapper now ONLY passes auth state.
  // Dashboard button logic is handled inside NavBar based on props.

  return (
    <>
      <NavBar
        isLoggedIn={isLoggedIn}
        showDashboardButton={false} // Parent layout overrides this
      />
    </>
  );
}
