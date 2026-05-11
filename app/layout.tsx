import "./globals.css";
import NavBar from "./components/NavBar";
import { ReactNode } from "react";

export const metadata = {
  title: "KidsReadQuest",
  description: "A literacy adventure for kids",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
