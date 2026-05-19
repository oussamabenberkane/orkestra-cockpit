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
      {children}
    </div>
  );
}
