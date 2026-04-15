import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SiteLayout } from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "CreatorAI - AI Digital Twin for Content Creators",
  description: "Create your AI digital twin that chats with fans 24/7 in your unique voice and style.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased">
          <SiteLayout>
            {children}
          </SiteLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}