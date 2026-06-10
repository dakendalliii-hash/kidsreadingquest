import { cookies } from "next/headers";

export default async function CookieDebugPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return (
    <div style={{ padding: 40 }}>
      <h1>Cookie Header Validation</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(allCookies, null, 2)}
      </pre>
    </div>
  );
}
