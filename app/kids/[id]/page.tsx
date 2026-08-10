export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

// =========================================================
// WORKOUT ENTRY POINT
// =========================================================
// This page must NOT load the assessment wrapper.
// It must redirect directly to the workout screen:
// /kids/[id]/reading
// =========================================================

export default async function KidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: kidId } = await params;

  redirect(`/kids/${kidId}/reading`);
}
