"use client";

import AssessmentClient from "@/app/kids/[id]/assessment/AssessmentClient";

export default function AssessmentClientShell({
  kidId,
  passageObj,
}: {
  kidId: string;
  passageObj: any;
}) {
  return (
    <AssessmentClient
      kidId={kidId}
      band={passageObj.band}
      title={passageObj.title}
      textEn={passageObj.entext}
      textHi={passageObj.text}
    />
  );
}
