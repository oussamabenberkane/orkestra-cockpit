import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AgentConversationProvider } from "@/components/dashboard/AgentConversationProvider";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import { NotificationsProvider } from "@/components/dashboard/NotificationsProvider";
import { PaletteSwitcher } from "@/components/dev/PaletteSwitcher";

/* Synchronous palette init — runs in <head> before first paint so a reload
 * with `?palette=slate` or the persisted choice never flashes Aurora first.
 *
 * Resolution order: URL param → localStorage → default (aurora, set by CSS).
 * Legacy values "cool" → "aurora" and "warm" → "stratus" are migrated so old
 * preview links don't fall through. Wrapped in try/catch so storage exceptions
 * (private mode, disabled cookies) never break paint. */
const paletteInitScript = `(function(){try{var V={aurora:'aurora',marble:'marble',pearl:'pearl',mineral:'mineral',atelier:'atelier',cobalt:'cobalt',prism:'prism',cool:'aurora',warm:'marble',slate:'atelier',midnight:'cobalt',forest:'mineral',graphite:'pearl',stratus:'aurora',quill:'marble',mist:'aurora',granite:'pearl',iris:'marble',canvas:'pearl'};var p=new URL(location.href).searchParams.get('palette');var s=localStorage.getItem('orkestra.palette.v1');var v=V[p]||V[s];if(v){document.documentElement.setAttribute('data-palette',v);if(V[p])localStorage.setItem('orkestra.palette.v1',v);}}catch(e){}})();`;

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
    <html
      lang="fr"
      className={`${manrope.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteInitScript }} />
      </head>
      <body>
        <AuthProvider>
          <NotificationsProvider>
            <AgentConversationProvider>{children}</AgentConversationProvider>
          </NotificationsProvider>
        </AuthProvider>
        <PaletteSwitcher />
      </body>
    </html>
  );
}
