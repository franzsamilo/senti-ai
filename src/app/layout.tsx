import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders, Doto, Fraunces, Gochi_Hand, Martian_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://senti-ai-sooty.vercel.app";

/*
 * Type, chosen to read like print rather than a template:
 *   Big Shoulders — condensed signage grotesk for headlines (jeepney boards,
 *                   tabloid fronts). Sharp at every size.
 *   Archivo       — body copy; a sturdy newspaper grotesque.
 *   Fraunces      — wonky italic serif for the roast lines, so the model's
 *                   words sound quoted, like a gossip column.
 *   Martian Mono  — receipts and numbers.
 *   Gochi Hand    — margin notes and the handwritten J-card tracklist.
 *   Doto          — dot-matrix digits for the videoke score screen.
 * The last three are decorative and load lazily (preload: false).
 */
const shoulders = Big_Shoulders({
  variable: "--font-shoulders",
  subsets: ["latin"],
  display: "swap",
  // Optical sizes: small labels get the open "Text" cut, so a 13px G
  // doesn't close up into a C.
  axes: ["opsz"],
  adjustFontFallback: false,
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  preload: false,
});

const gochi = Gochi_Hand({
  variable: "--font-gochi",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  display: "swap",
  axes: ["ROND"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
  description:
    "Your songs, your MBTI, your attachment style, your sign — read together into one very Filipino report on how you love.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
    description:
      "Add the songs you have on repeat, answer five quick things, and find out what your playlist says about you.",
    url: SITE_URL,
    siteName: "Senti.AI",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Senti.AI — Ano'ng sinasabi ng playlist mo?",
    description:
      "Add the songs you have on repeat and find out what your playlist says about you.",
  },
};

// No maximumScale: pinch-zoom stays available. Inputs use 16px text on
// mobile so iOS doesn't zoom on focus.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4ede0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${shoulders.variable} ${archivo.variable} ${fraunces.variable} ${martian.variable} ${gochi.variable} ${doto.variable} h-full`}
    >
      <body className="min-h-screen text-text-primary font-body antialiased">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
