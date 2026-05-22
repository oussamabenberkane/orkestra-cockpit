import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AgentConversationProvider } from "@/components/dashboard/AgentConversationProvider";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import { NotificationsProvider } from "@/components/dashboard/NotificationsProvider";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orkestra — Cockpit BFSI",
  description:
    "Helvebroker — Pilotez votre cabinet avec intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${jetBrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <NotificationsProvider>
            <AgentConversationProvider>{children}</AgentConversationProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
