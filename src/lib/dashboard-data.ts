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
