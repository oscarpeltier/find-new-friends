import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeSync from "./ThemeSync";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "findfriends — Trouve de nouveaux amis",
  description: "Connecte-toi pour trouver de nouveaux amis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><ThemeSync />{children}</body>
    </html>
  );
}
