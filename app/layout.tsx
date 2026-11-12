import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SoundProvider } from "@/components/SoundContext";

const titanOne = localFont({
  src: "../public/TitanOne-Regular.ttf",
  variable: "--font-titan-one",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MATHORA - Belajar Matematika",
  description: "Game Edukasi Belajar Matematika",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${titanOne.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
