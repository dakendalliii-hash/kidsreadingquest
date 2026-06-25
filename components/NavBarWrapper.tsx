// kidsreadingquest/components/NavBarWrapper.tsx
export const runtime = "nodejs";

import { getAuthState } from "@/lib/auth/getAuthState";
import NavBar from "./NavBar";

export default async function NavBarWrapper() {
  const { isLoggedIn } = await getAuthState();

  return <NavBar isLoggedIn={isLoggedIn} />;
}
