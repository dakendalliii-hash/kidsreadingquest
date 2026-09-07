export const dynamic = "force-dynamic";
export const revalidate = 0;

import KidDetailClientWrapper from "@/components/KidDetailClientWrapper";
import { logError } from "@/lib/logging/logError";


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

try {

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

  } catch (error) {
    await logError("SSR: app/kids/[id]/page", error);
    throw error;
  }

}
