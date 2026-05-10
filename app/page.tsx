import PageContainer from "./components/PageContainer";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageContainer>
      <h2>Welcome to KidsReadingQuest</h2>
      <p>Your journey to better reading starts here.</p>

      <h3>Temporary Navigation</h3>
      <ul>
        <li><Link href="/parent">Parent Page</Link></li>
        <li><Link href="/kid">Kid Page</Link></li>
      </ul>
    </PageContainer>
  );
}
