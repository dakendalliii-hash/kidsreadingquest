"use client";

import { useState } from "react";
import RedirectHandler from "@/components/RedirectHandler";
import MicReader from "@/components/MicReader";

export default function KidDetailClientWrapper({
  passageText,
  kidId,
}: {
  passageText: string;
  kidId: string;
}) {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  return (
    <>
      <RedirectHandler redirectUrl={redirectUrl} />

      <MicReader
        passageText={passageText}
        kidId={kidId}
        onSuccessRedirect={(url: string) => {
          setRedirectUrl(url);
        }}
      />
    </>
  );
}
