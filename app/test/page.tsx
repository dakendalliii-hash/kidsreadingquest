export const runtime = "nodejs";

export default async function TestPage() {
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log("Service Role Key:", process.env.SUPABASE_SERVICE_ROLE_KEY);
  return <div>Environment variable test complete</div>;
}
