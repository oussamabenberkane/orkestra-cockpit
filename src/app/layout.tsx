import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orkestra — Cockpit BFSI",
  description: "Cabinet Müller & Associés SA — Pilotez votre cabinet avec intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${dmMono.variable} h-full`}
    >
      <body
        style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {children}
      </body>
    </html>
  );
}
