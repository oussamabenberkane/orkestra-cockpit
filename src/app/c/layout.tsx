import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function DesignCLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${beVietnamPro.variable} ${jetBrainsMono.variable}`}
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        background: "#FAF7F2",
        color: "#1F1E1B",
        minHeight: "100vh",
        ["--bg" as string]: "#FAF7F2",
        ["--surface" as string]: "#FFFFFF",
        ["--surface-2" as string]: "#F5F0E8",
        ["--surface-3" as string]: "#EFE9DC",
        ["--border" as string]: "#EAE3D4",
        ["--border-strong" as string]: "#D6CCB7",
        ["--text" as string]: "#1F1E1B",
        ["--text-2" as string]: "#4A4640",
        ["--text-3" as string]: "#807B72",
        ["--text-4" as string]: "#A89F90",
        ["--accent" as string]: "#1F6F5B",
        ["--accent-2" as string]: "#155E4B",
        ["--accent-tint" as string]: "#E3F0EC",
        ["--accent-tint-2" as string]: "#C9E0D9",
        ["--gold" as string]: "#C9A158",
        ["--gold-tint" as string]: "#F7EFD9",
        ["--success" as string]: "#2A6D5F",
        ["--success-tint" as string]: "#E0EFE8",
        ["--warn" as string]: "#B7791F",
        ["--warn-tint" as string]: "#F6EBD2",
        ["--danger" as string]: "#B72D2F",
        ["--danger-tint" as string]: "#F6E0E0",
      }}
    >
      {children}
    </div>
  );
}
