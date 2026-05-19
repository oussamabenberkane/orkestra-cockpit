import { BackToApp } from "@/components/shared/BackToApp";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        color: "var(--text)",
        minHeight: "100vh",
      }}
    >
      <BackToApp />
      {children}
    </div>
  );
}
