import { createClient } from "@/lib/supabase/client";
import PageContainer from "../components/PageContainer";

export default function SignUpPage() {
  const supabase = createClient();

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Sign Up</h1>
      {/* Add your signup form here */}
    </PageContainer>
  );
}
