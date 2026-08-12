export const dynamic = "force-dynamic";
export const revalidate = 0;

import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";

// =========================================================
// EXISTING KID ENTRY POINT
// =========================================================
// This page MUST load the KidDetailClientWrapper.
// It must NOT redirect to reading or assessment.
// =========================================================

export default async function KidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: kidId } = await params;

  return (
    <KidDetailClientWrapper
      kidId={kidId}
      passageText=""          // wrapper will fetch passage
      initialLanguage="en"    // wrapper handles toggle
      band=""                 // wrapper fetches band
      siteId={0}              // wrapper fetches site
      passageIndex={0}        // wrapper fetches index
    />
  );
}
