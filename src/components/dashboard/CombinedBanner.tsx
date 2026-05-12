export default function CombinedBanner() {
  const items = [
    { val: "68%", lbl: "Marge nette réelle" },
    { val: "+18K CHF", lbl: "Cash-flow prévisionnel" },
    { val: "2 340 CHF", lbl: "Rentabilité / courtier" },
    { val: "12%", lbl: "Ratio sinistres / CA" },
  ];

  return (
    <div className="combined-banner-responsive">
      {/* Tag */}
      <div
        style={{
          background: "#ECFDF5",
          color: "#10B981",
          border: "1px solid #A7F3D0",
          borderRadius: "8px",
          padding: "0.5rem 0.75rem",
          fontSize: "0.68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          whiteSpace: "nowrap",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        ⊕ KPIs
        <br />
        Combinés
      </div>

      {/* Items */}
      <div className="combined-items-responsive">
        {items.map((item) => (
          <div key={item.lbl}>
            <div
              style={{
                fontFamily: "var(--font-mono), 'DM Mono', monospace",
                fontSize: "1.2rem",
                fontWeight: 500,
                color: "#10B981",
              }}
            >
              {item.val}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#6B7280", marginTop: "2px" }}>
              {item.lbl}
            </div>
          </div>
        ))}
      </div>

      {/* Formula — hidden on mobile */}
      <div className="combined-formula-responsive">
        <strong style={{ color: "#1A1F36", fontWeight: 600 }}>
          KPIs impossibles dans un seul ERP
        </strong>
        <br />
        Primes (BrokerStar) − Charges (Odoo) = Marge
        <br />
        Renouvellements (BS) + Trésorerie (Odoo) = Cash-flow
      </div>
    </div>
  );
}
