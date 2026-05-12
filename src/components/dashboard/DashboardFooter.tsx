export default function DashboardFooter() {
  const items = [
    { icon: "🇨🇭", label: "Infomaniak — Données en Suisse" },
    { icon: "🔒", label: "LPD Art.16 conforme" },
    { icon: "🤖", label: "IA souveraine" },
    { icon: "📋", label: "Audit trail actif" },
  ];

  return (
    <div
      style={{
        background: "white",
        borderTop: "1px solid #E4E7F0",
        padding: "0.5rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        fontSize: "0.68rem",
        color: "#6B7280",
        flexShrink: 0,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            color: "#028090",
            fontWeight: 500,
          }}
        >
          {item.icon} {item.label}
        </div>
      ))}
      <div style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#6B7280" }}>
        Sync BrokerStar : il y a 3 min · Odoo : il y a 5 min
      </div>
    </div>
  );
}
