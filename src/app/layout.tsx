import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalentHireAI",
  description: "AI-powered Interviews",
  openGraph: {
    title: "TalentHireAI",
    description: "AI-powered Interviews",
    siteName: "TalentHireAI",
    images: [
      {
        url: "/talenthaireai.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/browser-client-icon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
