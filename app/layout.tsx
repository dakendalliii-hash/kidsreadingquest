import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "./components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kids Reading Quest",
  description: "Your journey to better reading starts here.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 min-h-screen m-0 p-0`}>
        <NavBar />
        <main className="mt-4">{children}</main>
      </body>
    </html>
  );
}
