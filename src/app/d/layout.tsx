import { Manrope, JetBrains_Mono } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function DesignDLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${manrope.variable} ${jetBrainsMono.variable}`}
      style={{
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
        background: "#F8FAFC",
        color: "#0F172A",
        minHeight: "100vh",
        ["--bg" as string]: "#F8FAFC",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#F8FAFC",
        ["--surface-3" as string]: "#F1F5F9",
        ["--border" as string]: "#E2E8F0",
        ["--border-strong" as string]: "#CBD5E1",
        ["--text" as string]: "#0F172A",
        ["--text-2" as string]: "#334155",
        ["--text-3" as string]: "#64748B",
        ["--text-4" as string]: "#94A3B8",
        ["--brand" as string]: "#1E40AF",
        ["--brand-2" as string]: "#1E3A8A",
        ["--brand-tint" as string]: "#DBEAFE",
        ["--brand-tint-2" as string]: "#EFF6FF",
        ["--accent" as string]: "#C97A3F",
        ["--accent-tint" as string]: "#FBEFD9",
        ["--success" as string]: "#059669",
        ["--success-tint" as string]: "#ECFDF5",
        ["--warn" as string]: "#D97706",
        ["--warn-tint" as string]: "#FEF3C7",
        ["--danger" as string]: "#DC2626",
        ["--danger-tint" as string]: "#FEE2E2",
        ["--info" as string]: "#0284C7",
        ["--info-tint" as string]: "#E0F2FE",
      }}
    >
      {children}
    </div>
  );
}
