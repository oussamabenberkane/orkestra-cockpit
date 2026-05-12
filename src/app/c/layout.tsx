import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function DesignCLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable}`}
      style={{
        fontFamily: "var(--font-geist), system-ui, sans-serif",
        background: "#FAFAFA",
        color: "#0A0A0A",
        minHeight: "100vh",
        ["--bg" as string]: "#FAFAFA",
        ["--sidebar-bg" as string]: "#F4F4F5",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#F4F4F5",
        ["--surface-3" as string]: "#E4E4E7",
        ["--border" as string]: "#E4E4E7",
        ["--border-strong" as string]: "#D4D4D8",
        ["--text" as string]: "#0A0A0A",
        ["--text-2" as string]: "#404040",
        ["--text-3" as string]: "#71717A",
        ["--text-4" as string]: "#A1A1AA",
        ["--accent" as string]: "#4F46E5",
        ["--accent-2" as string]: "#4338CA",
        ["--accent-tint" as string]: "#EEF2FF",
        ["--success" as string]: "#16A34A",
        ["--success-tint" as string]: "#F0FDF4",
        ["--warn" as string]: "#CA8A04",
        ["--warn-tint" as string]: "#FEFCE8",
        ["--danger" as string]: "#DC2626",
        ["--danger-tint" as string]: "#FEF2F2",
        ["--info" as string]: "#0EA5E9",
        ["--info-tint" as string]: "#F0F9FF",
      }}
    >
      {children}
    </div>
  );
}
