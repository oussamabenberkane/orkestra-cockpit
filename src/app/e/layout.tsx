import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function DesignELayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable}`}
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        background: "#0B0C0F",
        color: "#E5E7EB",
        minHeight: "100vh",
        ["--bg" as string]: "#0B0C0F",
        ["--sidebar-bg" as string]: "#0F1116",
        ["--surface" as string]: "#14161B",
        ["--surface-2" as string]: "#1B1E25",
        ["--surface-3" as string]: "#232830",
        ["--border" as string]: "rgba(255,255,255,0.07)",
        ["--border-strong" as string]: "rgba(255,255,255,0.14)",
        ["--inset-highlight" as string]: "rgba(255,255,255,0.04)",
        ["--text" as string]: "#E5E7EB",
        ["--text-2" as string]: "#9CA3AF",
        ["--text-3" as string]: "#6B7280",
        ["--text-4" as string]: "#4B5563",
        ["--accent" as string]: "#818CF8",
        ["--accent-2" as string]: "#6366F1",
        ["--accent-tint" as string]: "rgba(129,140,248,0.14)",
        ["--accent-tint-2" as string]: "rgba(129,140,248,0.22)",
        ["--success" as string]: "#22C55E",
        ["--success-tint" as string]: "rgba(34,197,94,0.14)",
        ["--warn" as string]: "#FBBF24",
        ["--warn-tint" as string]: "rgba(251,191,36,0.14)",
        ["--danger" as string]: "#F87171",
        ["--danger-tint" as string]: "rgba(248,113,113,0.14)",
        ["--info" as string]: "#60A5FA",
        ["--info-tint" as string]: "rgba(96,165,250,0.14)",
      }}
    >
      {children}
    </div>
  );
}
