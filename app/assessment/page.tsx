export const runtime = "nodejs";

import AssessmentClient from "./AssessmentClient";

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const band = params.band;
  const title = params.title;
  const text = params.text;
  const age = params.age ? Number(params.age) : null;

  return (
    <AssessmentClient
      band={band}
      title={title}
      text={text}
      age={age}
    />
  );
}
