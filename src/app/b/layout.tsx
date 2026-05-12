import { Inter_Tight, JetBrains_Mono } from "next/font/google";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
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
        fontFamily: "var(--font-inter-tight), system-ui, sans-serif",
        background: "#FAFAF7",
        color: "#0F1419",
        minHeight: "100vh",
        ["--bg" as string]: "#FAFAF7",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#F4F2EC",
        ["--surface-3" as string]: "#EEEAE0",
        ["--border" as string]: "#E7E3D8",
        ["--border-strong" as string]: "#D6D0C0",
        ["--text" as string]: "#0F1419",
        ["--text-2" as string]: "#404652",
        ["--text-3" as string]: "#6B7280",
        ["--text-4" as string]: "#9CA3AF",
        ["--accent" as string]: "#0D7066",
        ["--accent-2" as string]: "#0A5E55",
        ["--accent-tint" as string]: "#E5F1EF",
        ["--accent-tint-2" as string]: "#D2E7E3",
        ["--success" as string]: "#1F8E5C",
        ["--success-tint" as string]: "#E6F4EC",
        ["--warn" as string]: "#B45309",
        ["--warn-tint" as string]: "#FDF3E5",
        ["--danger" as string]: "#B91C1C",
        ["--danger-tint" as string]: "#FBEAEA",
        ["--info" as string]: "#1E4FBF",
        ["--info-tint" as string]: "#E8EEFB",
      }}
    >
      {children}
    </div>
  );
}
