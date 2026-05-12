import { Albert_Sans, JetBrains_Mono } from "next/font/google";

const albertSans = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function DesignFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${albertSans.variable} ${jetBrainsMono.variable}`}
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        background: "#F5F5F7",
        color: "#1D1D1F",
        minHeight: "100vh",
        ["--bg" as string]: "#F5F5F7",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#FBFBFD",
        ["--surface-3" as string]: "#F2F2F4",
        ["--border" as string]: "rgba(0,0,0,0.06)",
        ["--border-strong" as string]: "rgba(0,0,0,0.10)",
        ["--text" as string]: "#1D1D1F",
        ["--text-2" as string]: "#424245",
        ["--text-3" as string]: "#6E6E73",
        ["--text-4" as string]: "#86868B",
        ["--accent" as string]: "#5856D6",
        ["--accent-2" as string]: "#4441C8",
        ["--accent-tint" as string]: "rgba(88,86,214,0.10)",
        ["--accent-tint-2" as string]: "rgba(88,86,214,0.16)",
        ["--success" as string]: "#34A853",
        ["--success-tint" as string]: "rgba(52,168,83,0.10)",
        ["--warn" as string]: "#FF9F0A",
        ["--warn-tint" as string]: "rgba(255,159,10,0.10)",
        ["--danger" as string]: "#FF3B30",
        ["--danger-tint" as string]: "rgba(255,59,48,0.10)",
        ["--info" as string]: "#007AFF",
        ["--info-tint" as string]: "rgba(0,122,255,0.10)",
        // Shadow tokens
        ["--tier-1" as string]:
          "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 16px -10px rgba(0,0,0,0.12)",
        ["--tier-2" as string]:
          "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.06), 0 16px 32px -12px rgba(0,0,0,0.18)",
      }}
    >
      {children}
    </div>
  );
}
