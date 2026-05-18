import { LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { MockPagePlaceholder } from "@/components/dashboard/MockPagePlaceholder";

export default function SupportPage() {
  return (
    <AppShell>
      <MockPagePlaceholder
        title="Support"
        subtitle="Documentation produit, contact équipe Malyz, et historique des incidents. Le centre d'aide sera connecté ici prochainement."
        Icon={LifeBuoy}
        eyebrow="En préparation"
      />
    </AppShell>
  );
}
