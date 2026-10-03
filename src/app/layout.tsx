import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit, JetBrains_Mono } from "next/font/google";
import AuroraBackground from "@/components/AuroraBackground";
import "./globals.css";

const SITE_URL = "https://senti-ai-sooty.vercel.app";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
  description:
    "Your songs, your MBTI, your attachment style, your sign — read together into one brutally honest, very Filipino emotional damage report. Taglish roast included.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
    description:
      "Psychoanalyzing Filipinos through their OPM listening habits. How emotionally damaged are you? Take the scan. 😭",
    url: SITE_URL,
    siteName: "Senti.AI",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
    description:
      "Psychoanalyzing Filipinos through their OPM listening habits. How emotionally damaged are you? 😭",
  },
};

// No maximumScale: pinch-zoom stays available. Inputs use 16px text on
// mobile so iOS doesn't zoom on focus.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcecf3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-screen text-text-primary font-body antialiased">
        <AuroraBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
