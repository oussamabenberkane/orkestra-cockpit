export type AlertSeverity = "danger" | "warn";
export type AlertCategory = "contrat" | "sinistre" | "finance" | "renouvellement";

export interface AlertEmail {
  subject: string;
  body: string; // HTML
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  client: { name: string; email: string };
  timestamp: string;
  email: AlertEmail;
  read: boolean;
  emailSent: boolean;
  sentAt?: string;
}

export const SEV_CONFIG: Record<AlertSeverity, { color: string; tint: string; label: string }> = {
  danger: { color: "var(--danger)", tint: "var(--danger-tint)", label: "CRITIQUE" },
  warn:   { color: "var(--warn)",   tint: "var(--warn-tint)",   label: "AVERTISSEMENT" },
};

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "CHX-0187",
    severity: "danger",
    category: "contrat",
    title: "Contrat expiré",
    description: "Le contrat CHX-0187 a expiré il y a 3 jours. Le client n'est plus couvert.",
    client: { name: "Sophie Fontaine", email: "s.fontaine@fontaine-conseil.ch" },
    timestamp: "il y a 3 jours",
    read: false,
    emailSent: false,
    email: {
      subject: "Urgent : expiration de votre contrat d'assurance CHX-0187",
      body: `<p>Madame, Monsieur,</p>
<p>Nous vous contactons en urgence pour vous informer que votre contrat d'assurance professionnelle référence <strong>CHX-0187</strong> a expiré le <strong>16 mai 2026</strong>.</p>
<p>À ce jour, <strong>votre couverture n'est plus active</strong>. Afin de régulariser votre situation dans les meilleurs délais et d'éviter toute exposition au risque, nous vous demandons de nous contacter impérativement aujourd'hui.</p>
<p>Notre équipe est disponible pour traiter votre dossier en priorité et procéder à la remise en vigueur de votre contrat.</p>
<p>Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>
<p><strong>Helvebroker</strong><br>Département Gestion des Contrats<br>+41 22 000 00 00 · contact@helvebroker.ch</p>`,
    },
  },
  {
    id: "CHX-0291",
    severity: "warn",
    category: "renouvellement",
    title: "Renouvellement imminent",
    description: "Le contrat CHX-0291 arrive à échéance dans 14 jours. Une action est requise.",
    client: { name: "Étienne Marchand", email: "e.marchand@entreprises-sm.ch" },
    timestamp: "il y a 2h",
    read: false,
    emailSent: false,
    email: {
      subject: "Renouvellement de votre contrat d'assurance CHX-0291",
      body: `<p>Madame, Monsieur,</p>
<p>Nous vous contactons afin de vous informer que votre contrat d'assurance professionnelle référence <strong>CHX-0291</strong> arrive à échéance le <strong>2 juin 2026</strong>, soit dans <strong>14 jours</strong>.</p>
<p>Afin d'assurer la continuité de votre couverture sans interruption, nous vous invitons à nous contacter dans les meilleurs délais pour procéder au renouvellement.</p>
<p>Notre équipe reste à votre disposition pour répondre à toutes vos questions et vous accompagner dans cette démarche.</p>
<p>Dans l'attente de vous lire, nous vous adressons nos cordiales salutations.</p>
<p><strong>Helvebroker</strong><br>Département Gestion des Contrats<br>+41 22 000 00 00 · contact@helvebroker.ch</p>`,
    },
  },
  {
    id: "SIN-0047",
    severity: "danger",
    category: "sinistre",
    title: "Sinistre > 60 jours",
    description: "Le dossier SIN-0047 dépasse 60 jours sans résolution. Escalade recommandée.",
    client: { name: "Dubois SA", email: "direction@dubois-sa.ch" },
    timestamp: "il y a 2 min",
    read: false,
    emailSent: false,
    email: {
      subject: "Escalade urgente : dossier sinistre SIN-0047 — dépassement 60 jours",
      body: `<p>Madame, Monsieur,</p>
<p>Nous vous contactons au sujet du dossier sinistre <strong>SIN-0047</strong> (RC Professionnelle) qui fait l'objet d'un traitement depuis <strong>plus de 60 jours</strong>.</p>
<p>Conformément à nos engagements contractuels, nous procédons à une <strong>escalade de ce dossier</strong> afin d'en accélérer la résolution. Un gestionnaire senior a été désigné pour le suivre personnellement.</p>
<p>Vous serez contacté dans les <strong>48 heures</strong> pour faire le point sur l'état d'avancement.</p>
<p>Nous vous prions d'accepter nos excuses pour ce délai et vous assurons de notre mobilisation totale.</p>
<p>Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>
<p><strong>Helvebroker</strong><br>Service Sinistres — Gestionnaire senior<br>+41 22 000 00 01 · sinistres@helvebroker.ch</p>`,
    },
  },
  {
    id: "FIN-0023",
    severity: "warn",
    category: "finance",
    title: "2 impayés détectés",
    description: "Rossi SA présente 2 primes impayées totalisant 1 800 CHF depuis 67 jours.",
    client: { name: "Rossi SA", email: "comptabilite@rossi-sa.ch" },
    timestamp: "il y a 28 min",
    read: false,
    emailSent: false,
    email: {
      subject: "Relance — primes impayées : dossier Rossi SA",
      body: `<p>Madame, Monsieur,</p>
<p>Sauf erreur de notre part, nous constatons que <strong>2 primes d'assurance</strong> d'un montant total de <strong>1 800 CHF</strong> restent impayées à ce jour, la plus ancienne étant échue depuis <strong>67 jours</strong>.</p>
<p>Nous vous demandons de bien vouloir <strong>régulariser cette situation dans les meilleurs délais</strong> afin d'éviter toute suspension de garantie.</p>
<p>Pour tout renseignement ou en cas de difficulté de paiement, notre service comptabilité reste à votre disposition.</p>
<p>Veuillez agréer, Madame, Monsieur, nos salutations distinguées.</p>
<p><strong>Helvebroker</strong><br>Service Comptabilité<br>+41 22 000 00 02 · compta@helvebroker.ch</p>`,
    },
  },
  {
    id: "CHX-0112",
    severity: "warn",
    category: "renouvellement",
    title: "Renouvellement J-30",
    description: "Le contrat CHX-0112 arrive à échéance dans 30 jours.",
    client: { name: "Jean-Pierre Ramseyer", email: "jp.ramseyer@ramseyer.ch" },
    timestamp: "il y a 2 jours",
    read: true,
    emailSent: true,
    sentAt: "il y a 2 jours",
    email: {
      subject: "Renouvellement de votre contrat d'assurance CHX-0112",
      body: `<p>Madame, Monsieur,</p>
<p>Nous vous contactons afin de vous informer que votre contrat d'assurance professionnelle référence <strong>CHX-0112</strong> arrive à échéance dans <strong>30 jours</strong>.</p>
<p>Afin d'assurer la continuité de votre couverture, nous vous invitons à nous contacter pour procéder au renouvellement.</p>
<p>Cordialement,</p>
<p><strong>Helvebroker</strong></p>`,
    },
  },
  {
    id: "CHX-0078",
    severity: "danger",
    category: "contrat",
    title: "Résiliation traitée",
    description: "La résiliation du contrat CHX-0078 a été confirmée et archivée.",
    client: { name: "Marie-Claire Bonnet", email: "mc.bonnet@bonnet-assoc.ch" },
    timestamp: "il y a 5 jours",
    read: true,
    emailSent: true,
    sentAt: "il y a 5 jours",
    email: {
      subject: "Confirmation de résiliation — contrat CHX-0078",
      body: `<p>Madame, Monsieur,</p>
<p>Nous accusons réception de votre demande de résiliation du contrat <strong>CHX-0078</strong> et vous confirmons qu'elle a bien été prise en compte.</p>
<p>Veuillez agréer nos salutations distinguées.</p>
<p><strong>Helvebroker</strong></p>`,
    },
  },
  {
    id: "SIN-0031",
    severity: "warn",
    category: "sinistre",
    title: "Dossier clôturé",
    description: "Le sinistre SIN-0031 a été clôturé après accord amiable.",
    client: { name: "TechnoPlast SA", email: "admin@technoplast.ch" },
    timestamp: "il y a 1 semaine",
    read: true,
    emailSent: true,
    sentAt: "il y a 1 semaine",
    email: {
      subject: "Clôture de votre dossier sinistre SIN-0031",
      body: `<p>Madame, Monsieur,</p>
<p>Nous avons le plaisir de vous informer que votre dossier sinistre <strong>SIN-0031</strong> a été clôturé suite à l'accord amiable conclu.</p>
<p>Merci de votre confiance.</p>
<p><strong>Helvebroker</strong></p>`,
    },
  },
];
