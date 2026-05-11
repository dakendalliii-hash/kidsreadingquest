import { createClient } from "@/lib/supabase/server";
import PageContainer from "../components/PageContainer";

export default function ParentPage() {
  return (
    <PageContainer>
      <h2>Parent Dashboard (Temporary)</h2>

      <p>This page will eventually show:</p>
      <ul>
        <li>Parent name</li>
        <li>Email</li>
        <li>List of kids</li>
        <li>Reading progress</li>
      </ul>
    </PageContainer>
  );
}
