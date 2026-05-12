export default function DashboardFooter() {
  const items = [
    { icon: "🇨🇭", label: "Infomaniak — Données en Suisse" },
    { icon: "🔒", label: "LPD Art.16 conforme" },
    { icon: "🤖", label: "IA souveraine" },
    { icon: "📋", label: "Audit trail actif" },
  ];

  return (
    <div className="footer-responsive">
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
          {item.icon} <span className="footer-item-label">{item.label}</span>
        </div>
      ))}
      <div className="footer-sync">
        Sync BrokerStar : il y a 3 min · Odoo : il y a 5 min
      </div>
    </div>
  );
}
