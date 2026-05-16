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

export default function AgentTestLayout({
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
      }}
    >
      {children}
    </div>
  );
}
