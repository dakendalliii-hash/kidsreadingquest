// lib/auth/getUser.ts
// Updated to accept an existing SSR client

export async function getUser(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
