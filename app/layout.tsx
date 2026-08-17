import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500"],
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Klinik Cahaya Medika",
  description: "Klinik keluarga terpercaya — studi kasus ilustratif/template internal NobleDev.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-latar font-body text-nakhoda">{children}</body>
    </html>
  );
}
