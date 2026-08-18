import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="id" className={`${figtree.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-latar font-body text-nakhoda">{children}</body>
    </html>
  );
}
