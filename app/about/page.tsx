import { createClient } from "@/lib/supabase/server";
import PageContainer from "../components/PageContainer";

export default function AboutPage() {
  const supabase = createClient();
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p>This is the About page.</p>
    </PageContainer>
  );
}
