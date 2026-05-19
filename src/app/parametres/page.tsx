"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Bot,
  Check,
  Camera,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";

// ── Types ──────────────────────────────────────────────────────────────────

type SectionKey = "profil" | "cabinet" | "agents";

interface NavItem {
  key: SectionKey;
  label: string;
  sub: string;
  Icon: React.ElementType;
  color: string;
  tint: string;
}

// ── Navigation config ──────────────────────────────────────────────────────

const NAV: NavItem[] = [
  {
    key: "profil",
    label: "Profil & compte",
    sub: "Identité, sécurité",
    Icon: User,
    color: "var(--accent)",
    tint: "var(--accent-tint)",
  },
  {
    key: "cabinet",
    label: "Cabinet",
    sub: "Workspace, identifiants",
    Icon: Building2,
    color: "var(--info)",
    tint: "var(--info-tint)",
  },
  {
    key: "agents",
    label: "Agents IA",
    sub: "Modèle, mémoire, outils",
    Icon: Bot,
    color: "var(--purple)",
    tint: "var(--purple-tint)",
  },
];

// ── Shared primitives ──────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 14,
        boxShadow: "var(--tier-1)",
        overflow: "hidden",
        marginBottom: "1.125rem",
      }}
    >
      <div
        style={{
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text-4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "1.125rem 1.25rem" }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.785rem",
          fontWeight: 500,
          color: "var(--text-3)",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontSize: "0.73rem",
            color: "var(--text-4)",
            marginTop: "0.28rem",
            lineHeight: 1.4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const BASE_INPUT: CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 8,
  padding: "0.5625rem 0.875rem",
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  color: "var(--text)",
  outline: "none",
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...BASE_INPUT,
        borderColor: focused ? "var(--accent)" : "var(--border-strong)",
        boxShadow: focused ? "0 0 0 3px var(--accent-tint)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...props.style,
      }}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...BASE_INPUT,
        cursor: "pointer",
        appearance: "none" as CSSProperties["appearance"],
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236E6E73' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.875rem center",
        paddingRight: "2.25rem",
        borderColor: focused ? "var(--accent)" : "var(--border-strong)",
        boxShadow: focused ? "0 0 0 3px var(--accent-tint)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...props.style,
      }}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? "var(--accent)" : "var(--surface-3)",
        border: "none",
        cursor: "pointer",
        padding: 3,
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

function SaveButton({ saved }: { saved: boolean }) {
  return (
    <motion.button
      type="submit"
      animate={{
        background: saved ? "var(--success)" : "var(--accent)",
      }}
      transition={{ duration: 0.25 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 1.25rem",
        borderRadius: 8,
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "0.875rem",
        fontWeight: 600,
      }}
    >
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.span
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Check size={14} strokeWidth={2.5} />
            Enregistré
          </motion.span>
        ) : (
          <motion.span
            key="save"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Enregistrer
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Profil section ─────────────────────────────────────────────────────────

function ProfilSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [prenom, setPrenom] = useState("Thomas");
  const [nom, setNom] = useState("Müller");
  const [email, setEmail] = useState("thomas.muller@cabinet-muller.ch");
  const [phone, setPhone] = useState("+41 79 123 45 67");
  const [langue, setLangue] = useState("fr");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <Card title="Identité">
        {/* Avatar row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.25rem",
            paddingBottom: "1.125rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--accent-tint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--accent)",
              flexShrink: 0,
              position: "relative",
            }}
          >
            TM
            <button
              type="button"
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "2px solid var(--surface)",
                boxShadow: "var(--tier-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Camera size={10} color="var(--text-3)" />
            </button>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.15rem", fontSize: "0.95rem" }}>
              Thomas Müller
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
              Courtier senior · Cabinet Müller &amp; Associés SA
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Prénom">
            <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </Field>
          <Field label="Nom">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </Field>
        </div>

        <Field label="Adresse e-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Téléphone">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>

        <Field label="Langue de l'interface">
          <Select value={langue} onChange={(e) => setLangue(e.target.value)}>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </Select>
        </Field>
      </Card>

      <Card title="Sécurité">
        <Field label="Mot de passe actuel">
          <div style={{ position: "relative" }}>
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••••"
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                padding: 0,
              }}
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="Nouveau mot de passe">
          <div style={{ position: "relative" }}>
            <Input
              type={showNew ? "text" : "password"}
              placeholder="••••••••••"
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                padding: 0,
              }}
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field
          label="Confirmer le nouveau mot de passe"
          hint="Au moins 8 caractères, avec une majuscule et un chiffre."
        >
          <Input type="password" placeholder="••••••••••" />
        </Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveButton saved={saved} />
      </div>
    </form>
  );
}

// ── Cabinet section ────────────────────────────────────────────────────────

function CabinetSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [raisonSociale, setRaisonSociale] = useState("Cabinet Müller & Associés SA");
  const [rcs, setRcs] = useState("CH-660.0.013.546-6");
  const [site, setSite] = useState("www.cabinet-muller.ch");
  const [adresse, setAdresse] = useState("Rue de la Paix 12");
  const [ville, setVille] = useState("1204 Genève");
  const [pays, setPays] = useState("ch");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <Card title="Identité du cabinet">
        <Field label="Raison sociale">
          <Input value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} />
        </Field>

        <Field
          label="Numéro RCS"
          hint="Numéro d'identification au Registre du Commerce suisse."
        >
          <Input value={rcs} onChange={(e) => setRcs(e.target.value)} />
        </Field>

        <Field label="Site web">
          <Input
            type="url"
            value={site}
            placeholder="https://www.exemple.ch"
            onChange={(e) => setSite(e.target.value)}
          />
        </Field>
      </Card>

      <Card title="Adresse">
        <Field label="Rue et numéro">
          <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </Field>

        <Field label="NPA et localité">
          <Input value={ville} onChange={(e) => setVille(e.target.value)} />
        </Field>

        <Field label="Pays">
          <Select value={pays} onChange={(e) => setPays(e.target.value)}>
            <option value="ch">Suisse</option>
            <option value="fr">France</option>
            <option value="de">Allemagne</option>
            <option value="lu">Luxembourg</option>
            <option value="be">Belgique</option>
          </Select>
        </Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveButton saved={saved} />
      </div>
    </form>
  );
}

// ── Agents IA section ──────────────────────────────────────────────────────

const TOOLS: { key: string; label: string; desc: string }[] = [
  { key: "analyze_data", label: "analyze_data", desc: "Analyse statistique des données CSV" },
  { key: "query_csv", label: "query_csv", desc: "Requêtes SQL sur les données de portefeuille" },
  { key: "save_memory", label: "save_memory", desc: "Mémorisation des préférences utilisateur" },
  { key: "search_web", label: "search_web", desc: "Recherche d'informations sur le web (expérimental)" },
];

function AgentsSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [model, setModel] = useState("mistral-large-latest");
  const [temperature, setTemperature] = useState(0.7);
  const [langueReponse, setLangueReponse] = useState("fr");
  const [memoire, setMemoire] = useState(true);
  const [outils, setOutils] = useState<Record<string, boolean>>({
    analyze_data: true,
    query_csv: true,
    save_memory: true,
    search_web: false,
  });

  const toggleOutil = (key: string) => {
    setOutils((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <Card title="Modèle de langage">
        <Field label="Modèle actif">
          <Select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="mistral-large-latest">Mistral Large (défaut)</option>
            <option value="mistral-medium">Mistral Medium</option>
            <option value="mistral-small">Mistral Small</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </Select>
        </Field>

        <Field
          label={`Température — ${temperature.toFixed(1)}`}
          hint="Une valeur basse produit des réponses précises et factuelles. Une valeur haute favorise la créativité."
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <span style={{ fontSize: "0.73rem", color: "var(--text-4)", minWidth: 24 }}>0.0</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: "var(--accent)",
                cursor: "pointer",
                height: 4,
              }}
            />
            <span style={{ fontSize: "0.73rem", color: "var(--text-4)", minWidth: 24, textAlign: "right" }}>
              1.0
            </span>
          </div>
        </Field>

        <Field label="Langue de réponse">
          <Select value={langueReponse} onChange={(e) => setLangueReponse(e.target.value)}>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </Select>
        </Field>
      </Card>

      <Card title="Mémoire & outils">
        {/* Memory toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            paddingBottom: "1rem",
            marginBottom: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <p style={{ fontWeight: 500, color: "var(--text)", fontSize: "0.875rem", marginBottom: "0.15rem" }}>
              Mémoire persistante
            </p>
            <p style={{ fontSize: "0.775rem", color: "var(--text-3)" }}>
              L'agent retient le contexte entre les sessions.
            </p>
          </div>
          <Toggle checked={memoire} onChange={setMemoire} />
        </div>

        {/* Tool checkboxes */}
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text-4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.625rem",
          }}
        >
          Outils autorisés
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {TOOLS.map(({ key, label, desc }) => {
            const active = outils[key] ?? false;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleOutil(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? "var(--accent-tint)" : "transparent",
                  border: "none",
                  textAlign: "left",
                  transition: "background 0.15s",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: active ? "var(--accent)" : "var(--surface-3)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  {active && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.825rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "var(--font-mono)",
                      marginBottom: "0.1rem",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: "0.745rem", color: "var(--text-3)" }}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveButton saved={saved} />
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParametresPage() {
  const [active, setActive] = useState<SectionKey>("profil");
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null);

  const handleSave = (key: SectionKey) => {
    setSavedSection(key);
    setTimeout(() => setSavedSection(null), 2200);
  };

  return (
    <AppShell mainStyle={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Paramètres
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-3)", marginTop: "0.3rem" }}>
          Configuration du workspace et de vos préférences
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>
        {/* Left nav */}
        <nav
          style={{
            width: 210,
            flexShrink: 0,
            position: "sticky",
            top: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          {NAV.map(({ key, label, sub, Icon, color, tint }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  background: isActive ? "var(--surface)" : "transparent",
                  boxShadow: isActive ? "var(--tier-1)" : "none",
                  transition: "background 0.15s, box-shadow 0.15s",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isActive ? tint : "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  <Icon
                    size={15}
                    color={isActive ? color : "var(--text-3)"}
                    strokeWidth={2}
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.845rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text)" : "var(--text-2)",
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: "0.71rem", color: "var(--text-4)", margin: 0 }}>
                    {sub}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight
                    size={13}
                    color="var(--text-4)"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {active === "profil" && (
                <ProfilSection
                  onSave={() => handleSave("profil")}
                  saved={savedSection === "profil"}
                />
              )}
              {active === "cabinet" && (
                <CabinetSection
                  onSave={() => handleSave("cabinet")}
                  saved={savedSection === "cabinet"}
                />
              )}
              {active === "agents" && (
                <AgentsSection
                  onSave={() => handleSave("agents")}
                  saved={savedSection === "agents"}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
