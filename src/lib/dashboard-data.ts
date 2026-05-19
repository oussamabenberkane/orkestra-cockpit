"use server";
import { supabaseServer as supabase } from "./supabase-server";
import type { Period, HeroDataset } from "./dashboard-mock";

// ── Hero (period-aware) ──────────────────────────────────────────────────────

export async function fetchHeroData(period: Period): Promise<HeroDataset> {
  if (period === "M") {
    const { data } = await supabase
      .from("v_hero_mensuel")
      .select("mois_label, ca_mensuel")
      .order("mois");
    const months = (data ?? []).map((r) => r.mois_label as string);
    const values = (data ?? []).map((r) => Number(r.ca_mensuel));
    const latest = values.at(-1) ?? 0;
    return {
      title: "Chiffre d'affaires",
      combinedBadge: true,
      value: latest >= 1000 ? `${Math.round(latest / 1000)} K` : String(latest),
      unit: "CHF",
      data: values,
      months,
      events: [],
    };
  }
  if (period === "T") {
    const { data } = await supabase
      .from("v_hero_trimestriel")
      .select("trimestre_label, ca_trimestriel")
      .order("trimestre");
    const months = (data ?? []).map((r) => r.trimestre_label as string);
    const values = (data ?? []).map((r) => Number(r.ca_trimestriel));
    const latest = values.at(-1) ?? 0;
    return {
      title: "Chiffre d'affaires",
      combinedBadge: true,
      value: latest >= 1000 ? `${Math.round(latest / 1000)} K` : String(latest),
      unit: "CHF",
      data: values,
      months,
      events: [],
    };
  }
  // period === "A"
  const { data } = await supabase
    .from("v_hero_annuel")
    .select("annee_label, ca_annuel")
    .order("annee");
  const months = (data ?? []).map((r) => r.annee_label as string);
  const values = (data ?? []).map((r) => Number(r.ca_annuel));
  const latest = values.at(-1) ?? 0;
  return {
    title: "Chiffre d'affaires",
    combinedBadge: true,
    value:
      latest >= 1_000_000
        ? `${(latest / 1_000_000).toFixed(2)} M`
        : latest >= 1000
        ? `${Math.round(latest / 1000)} K`
        : String(latest),
    unit: "CHF",
    data: values,
    months,
    events: [],
  };
}

// ── Satellites (numeric values only — icons/labels merged in the server page) ─

export type SatelliteValues = {
  marge: number;
  cashflow: number;
  retention: number;
  impayes: number;
};

export async function fetchSatelliteValues(): Promise<SatelliteValues | null> {
  const { data } = await supabase.from("v_satellites").select("*").single();
  if (!data) return null;
  return {
    marge:     Number(data.marge_pct),
    cashflow:  Math.round(Number(data.cashflow_net) / 1000),
    retention: Number(data.retention_pct),
    impayes:   Number(data.impayes_montant),
  };
}

// ── Agent tasks (serializable rows — icons mapped in the server page) ─────────

export type AgentTaskRow = {
  titre: string;
  type: string;
  priority: number;
  modal_key: string | null;
};

export async function fetchAgentTaskRows(): Promise<AgentTaskRow[]> {
  const { data } = await supabase
    .from("agent_tasks")
    .select("titre, type, priority, modal_key")
    .eq("statut", "pending")
    .order("priority")
    .limit(3);
  return (data ?? []) as AgentTaskRow[];
}

// ── Tile metrics ─────────────────────────────────────────────────────────────

export type TileMetrics = {
  prospection: {
    taux_conversion_pct: number;
    total_prospects: number;
    relances_dues: number;
  } | null;
  portefeuille: {
    contrats_actifs: number;
    primes_totales: number;
    renouvellements_j30: number;
  } | null;
  sinistres: {
    dossiers_ouverts: number;
    ratio_sinistralite_pct: number;
    sinistre_urgent_ref: string | null;
    plus_ancien_jours: number;
  } | null;
  finance: {
    encaisse_mois: number;
    commissions_actives: number;
    nb_impayes: number;
  } | null;
};

export async function fetchTileMetrics(): Promise<TileMetrics> {
  const [prospection, portefeuille, sinistres, finance] = await Promise.all([
    supabase.from("v_tile_prospection").select("*").single(),
    supabase.from("v_tile_portefeuille").select("*").single(),
    supabase.from("v_tile_sinistres").select("*").single(),
    supabase.from("v_tile_finance").select("*").single(),
  ]);
  return {
    prospection: prospection.data as TileMetrics["prospection"],
    portefeuille: portefeuille.data as TileMetrics["portefeuille"],
    sinistres: sinistres.data as TileMetrics["sinistres"],
    finance: finance.data as TileMetrics["finance"],
  };
}

// ── Modal values ──────────────────────────────────────────────────────────────

export type ModalValues = {
  satellites: {
    marge_pct: number;
    cashflow_net: number;
    retention_pct: number;
    impayes_montant: number;
  } | null;
  finance: {
    commissions_actives: number;
    encaisse_mois: number;
    nb_impayes: number;
  } | null;
  sinistres: {
    dossiers_ouverts: number;
    ratio_sinistralite_pct: number;
    sinistre_urgent_ref: string | null;
    plus_ancien_jours: number;
  } | null;
  prospection: {
    taux_conversion_pct: number;
    total_prospects: number;
    relances_dues: number;
  } | null;
  portefeuille: {
    contrats_actifs: number;
    primes_totales: number;
    renouvellements_j30: number;
  } | null;
};

export async function fetchModalValues(): Promise<ModalValues> {
  const [sat, finance, sinistres, prospection, portefeuille] = await Promise.all([
    supabase.from("v_satellites").select("*").single(),
    supabase.from("v_tile_finance").select("*").single(),
    supabase.from("v_tile_sinistres").select("*").single(),
    supabase.from("v_tile_prospection").select("*").single(),
    supabase.from("v_tile_portefeuille").select("*").single(),
  ]);
  return {
    satellites: sat.data as ModalValues["satellites"],
    finance: finance.data as ModalValues["finance"],
    sinistres: sinistres.data as ModalValues["sinistres"],
    prospection: prospection.data as ModalValues["prospection"],
    portefeuille: portefeuille.data as ModalValues["portefeuille"],
  };
}

// ── Alertes ───────────────────────────────────────────────────────────────────

export async function fetchAlertes() {
  const { data } = await supabase
    .from("alertes")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchUnreadAlertesCount(): Promise<number> {
  const { count } = await supabase
    .from("alertes")
    .select("*", { count: "exact", head: true })
    .eq("lu", false);
  return count ?? 0;
}
