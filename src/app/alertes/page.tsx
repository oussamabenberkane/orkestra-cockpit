import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { MockPagePlaceholder } from "@/components/dashboard/MockPagePlaceholder";

export default function AlertesPage() {
  return (
    <AppShell>
      <MockPagePlaceholder
        title="Centre d'alertes"
        subtitle="Toutes les alertes opérationnelles consolidées BrokerStar + Odoo arriveront ici. Pour l'instant, consultez la cloche dans la barre latérale."
        Icon={AlertTriangle}
        eyebrow="En préparation"
      />
    </AppShell>
  );
}
