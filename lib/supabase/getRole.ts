import { getUser } from "./getUser";

export async function getRole() {
  const user = await getUser();
  return user?.user_metadata?.role ?? null;
}
