import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuildVision · Equipment Data Viewer",
  description:
    "Explore HVAC/MEP equipment schedules, manufacturers, and specifications extracted across construction projects.",
  icons: {
    icon: "/logos/buildvision-symbol.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-neutral-800 antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
