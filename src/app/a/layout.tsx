import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export default function DesignALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${plusJakartaSans.variable} ${dmMono.variable}`}
      style={{
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        background: "#F4F6FB",
        color: "#1A1F36",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
