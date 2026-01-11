// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Instrument_Serif, Baskervville } from "next/font/google";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });
const instrumentserif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const baskerville = Baskervville({
  weight: "400",
  variable: "--font-baskerville",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memento",
  description: "Helping you remember",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${baskerville.variable} ${instrumentserif.variable}`}
      >
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
