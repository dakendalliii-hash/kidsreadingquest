"use client";

interface PageContainerProps {
  children?: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return <div className="p-6">{children}</div>;
}
