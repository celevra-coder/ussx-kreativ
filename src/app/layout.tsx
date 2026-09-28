import type { Metadata } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ussxcreative.com"),

  title: "USS X KREATIV | Текстилни тухли от рециклиран текстил",

  description:
    "Текстилни тухли и декоративни стенни решения от рециклиран текстил за интериор, дизайн и архитектура.",

  openGraph: {
    title: "USS X KREATIV | Текстилни тухли от рециклиран текстил",
    description:
      "Текстилни тухли и декоративни стенни решения от рециклиран текстил за интериор, дизайн и архитектура.",
    siteName: "USS X KREATIV",
    locale: "bg_BG",
    type: "website",
    images: [
      {
        url: "/social-preview",
        width: 1200,
        height: 630,
        alt: "USS X KREATIV",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "USS X KREATIV | Текстилни тухли от рециклиран текстил",
    description:
      "Текстилни тухли и декоративни стенни решения от рециклиран текстил за интериор, дизайн и архитектура.",
    images: ["/social-preview"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${geist.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  );
}
