import KPICard from "./KPICard";
import type { KPICardProps } from "@/lib/types";

const kpis: Omit<KPICardProps, "index">[] = [
  {
    label: "CA Mensuel ⊕",
    value: "92K CHF",
    trend: "↑ +8% vs mois dernier",
    trendType: "up",
  },
  {
    label: "Rétention",
    value: "87%",
    trend: "↑ +3% vs marché CH",
    trendType: "up",
  },
  {
    label: "Contrats actifs",
    value: "189",
    trend: "● 4 renouvellements J-30",
    trendType: "info",
  },
  {
    label: "Marge nette ⊕",
    value: "68%",
    trend: "↑ KPI combiné unique",
    trendType: "up",
  },
  {
    label: "Alertes actives",
    value: "5",
    trend: "⚠ Dont 3 urgentes",
    trendType: "down",
    valueColor: "#EF4444",
  },
];

export default function KPIRow() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "0.85rem",
        marginBottom: "1.25rem",
      }}
    >
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.label} {...kpi} index={i} />
      ))}
    </div>
  );
}
