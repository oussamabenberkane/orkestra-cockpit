export default function CombinedBanner() {
  const items = [
    { val: "68%", lbl: "Marge nette réelle" },
    { val: "+18K CHF", lbl: "Cash-flow prévisionnel" },
    { val: "2 340 CHF", lbl: "Rentabilité / courtier" },
    { val: "12%", lbl: "Ratio sinistres / CA" },
  ];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E4E7F0",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
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
        }}
      >
        ⊕ KPIs
        <br />
        Combinés
      </div>

      {/* Items */}
      <div style={{ display: "flex", gap: "2rem", flex: 1 }}>
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

      {/* Formula */}
      <div
        style={{
          fontSize: "0.7rem",
          color: "#6B7280",
          lineHeight: 1.6,
          borderLeft: "2px solid #E4E7F0",
          paddingLeft: "1rem",
        }}
      >
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
