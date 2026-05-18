import { Settings2 } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { MockPagePlaceholder } from "@/components/dashboard/MockPagePlaceholder";

export default function ParametresPage() {
  return (
    <AppShell>
      <MockPagePlaceholder
        title="Paramètres"
        subtitle="Workspace, sources de données, agents IA, préférences d'affichage. La configuration sera disponible ici lorsque l'authentification sera en place."
        Icon={Settings2}
        eyebrow="En préparation"
      />
    </AppShell>
  );
}
