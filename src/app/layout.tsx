import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bursa Pazar Yerleri Tablosu | Günlere Göre Bursa Semt Pazarları ve Adresleri",
  description: "Bursa'daki tüm semt pazarlarını günlere göre sıralı ve adresli olarak bulabileceğiniz interaktif tablo. Bursa pazar yerleri, semt pazarları, adres ve harita bilgileriyle burada!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
