import { Inter_Tight, JetBrains_Mono } from "next/font/google";

const interTight = Inter_Tight({
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

export default function DesignBLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${interTight.variable} ${jetBrainsMono.variable}`}
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        background: "#F8FAFC",
        color: "#0F172A",
        minHeight: "100vh",
        ["--bg" as string]: "#F8FAFC",
        ["--sidebar-bg" as string]: "#F1F5F9",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#F1F5F9",
        ["--surface-3" as string]: "#E2E8F0",
        ["--border" as string]: "#E2E8F0",
        ["--border-strong" as string]: "#CBD5E1",
        ["--text" as string]: "#0F172A",
        ["--text-2" as string]: "#334155",
        ["--text-3" as string]: "#64748B",
        ["--text-4" as string]: "#94A3B8",
        ["--accent" as string]: "#3B5B7E",
        ["--accent-2" as string]: "#2D4663",
        ["--accent-tint" as string]: "#E1E7EE",
        ["--accent-tint-2" as string]: "#D1DAE5",
        ["--success" as string]: "#047857",
        ["--success-tint" as string]: "#D1FAE5",
        ["--warn" as string]: "#B45309",
        ["--warn-tint" as string]: "#FEF3C7",
        ["--danger" as string]: "#B91C1C",
        ["--danger-tint" as string]: "#FEE2E2",
        ["--info" as string]: "#1D4ED8",
        ["--info-tint" as string]: "#DBEAFE",
      }}
    >
      {children}
    </div>
  );
}
