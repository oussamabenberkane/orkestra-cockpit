import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" className="h-full">
      <body style={{ margin: 0, minHeight: "100vh", background: "#FFFFFF" }}>
        {children}
      </body>
    </html>
  );
}
