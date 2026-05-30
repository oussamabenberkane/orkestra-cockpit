"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  CheckCheck,
  X,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Minus,
  ChevronDown,
  AlertTriangle,
  Clock,
  Save,
  User,
  FileText,
  Flame,
  DollarSign,
  RefreshCw,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useAlerts } from "@/components/dashboard/AlertsProvider";
import { SEV_CONFIG } from "@/lib/alerts-data";

const VARIABLES = [
  { key: "nom_client",    label: "Nom du client",     example: "Sophie Fontaine" },
  { key: "ref_contrat",   label: "Référence contrat",  example: "CHX-0187" },
  { key: "email_client",  label: "E-mail client",      example: "s.fontaine@…" },
  { key: "date_echeance", label: "Date d'échéance",    example: "2 juin 2026" },
  { key: "courtier",      label: "Nom du cabinet",     example: "Helvebroker" },
];

const CATEGORY_LABELS: Record<string, string> = {
  contrat: "Contrat",
  sinistre: "Sinistre",
  finance: "Finance",
  renouvellement: "Renouvellement",
};

const CATEGORY_ICONS = {
  contrat: FileText,
  sinistre: Flame,
  finance: DollarSign,
  renouvellement: RefreshCw,
};

function processForPreview(html: string, vars: Record<string, string>): string {
  let result = html.replace(
    /<span[^>]*contenteditable="false"[^>]*>(.*?)<\/span>/gi,
    "$1"
  );
  result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = vars[varName];
    return value
      ? `<mark>${value}</mark>`
      : match;
  });
  return result;
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        background: "transparent",
        border: "none",
        borderRadius: "6px",
        color: "var(--text-3)",
        cursor: "pointer",
        transition: "background 0.12s, color 0.12s",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-3)";
        e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      {children}
    </button>
  );
}

function TBDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 18,
        background: "var(--border-strong)",
        margin: "0 0.2rem",
        flexShrink: 0,
      }}
    />
  );
}

export default function AlertEmailEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { getAlert, updateEmailDraft, sendAlert, dismiss } = useAlerts();
  const alert = getAlert(id);

  const [subject, setSubject] = useState(alert?.email.subject ?? "");
  const [recipientEmail, setRecipientEmail] = useState(alert?.client.email ?? "");
  const [bodyHtml, setBodyHtml] = useState(alert?.email.body ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [showVarMenu, setShowVarMenu] = useState(false);

  // Derived from context — persists across navigations
  const isSent = !!alert?.emailSent;

  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize editor content once on mount
  useEffect(() => {
    if (editorRef.current && !initializedRef.current && alert) {
      editorRef.current.innerHTML = alert.email.body;
      initializedRef.current = true;
    }
  }, [alert]);

  // Close variable menu on outside click
  useEffect(() => {
    if (!showVarMenu) return;
    const handler = () => setShowVarMenu(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showVarMenu]);

  const syncBody = useCallback(() => {
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  }, []);

  const format = useCallback(
    (cmd: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(cmd, false, value ?? undefined);
      syncBody();
    },
    [syncBody]
  );

  const insertVariable = useCallback(
    (varKey: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const chip = `<span contenteditable="false" style="display:inline-flex;align-items:center;font-size:0.82em;font-weight:600;color:var(--accent);background:var(--accent-tint);padding:1px 8px;border-radius:100px;font-family:var(--font-mono);cursor:default;user-select:none;">{{${varKey}}}</span>`;
      document.execCommand("insertHTML", false, chip + " ");
      syncBody();
      setShowVarMenu(false);
    },
    [syncBody]
  );

  const handleSaveDraft = () => {
    updateEmailDraft(id, { subject, body: bodyHtml });
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const handleSend = () => {
    if (isSent) return;
    updateEmailDraft(id, { subject, body: bodyHtml });
    sendAlert(id);
    setTimeout(() => router.push("/alertes"), 1800);
  };

  const handleDismiss = () => {
    dismiss(id);
    router.push("/alertes");
  };

  if (!alert) {
    return (
      <AppShell>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "5rem 2rem",
            color: "var(--text-3)",
            textAlign: "center",
          }}
        >
          <AlertTriangle size={32} strokeWidth={1.5} color="var(--text-4)" />
          <p style={{ fontSize: "0.9rem", margin: 0 }}>Alerte introuvable.</p>
          <Link href="/alertes" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
            ← Retour aux alertes
          </Link>
        </div>
      </AppShell>
    );
  }

  const cfg = SEV_CONFIG[alert.severity];
  const CategoryIcon = CATEGORY_ICONS[alert.category];

  const previewVars: Record<string, string> = {
    nom_client:    alert.client.name,
    ref_contrat:   alert.id,
    email_client:  alert.client.email,
    date_echeance: "2 juin 2026",
    courtier:      "Helvebroker",
    email_courtier:"system@helvebroker.ch",
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 800 }}>

        {/* ── Breadcrumb ── */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Link
            href="/alertes"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-3)",
              textDecoration: "none",
              padding: "0.35rem 0.75rem",
              borderRadius: "8px",
              background: "var(--surface-2)",
              boxShadow: "var(--tier-1)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)";
            }}
          >
            <ArrowLeft size={13} />
            Alertes
          </Link>
          <span style={{ color: "var(--text-4)", fontSize: "0.78rem" }}>›</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            {alert.id}
          </span>
          <span
            className="alert-detail-breadcrumb-tag"
            style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-4)", fontWeight: 500 }}
          >
            Composition d&apos;e-mail
          </span>
        </motion.div>

        {/* ── Sent banner ── */}
        <AnimatePresence>
          {isSent && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.125rem",
                borderRadius: "12px",
                background: "var(--success-tint)",
                border: "1px solid rgba(52,168,83,0.18)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  background: "rgba(52,168,83,0.15)",
                  color: "var(--success)",
                  flexShrink: 0,
                }}
              >
                <CheckCheck size={15} strokeWidth={2.5} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--success)", margin: 0 }}>
                  E-mail envoyé
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--success)", opacity: 0.8, margin: 0 }}>
                  Cet e-mail a été envoyé à {alert.client.name}
                  {alert.sentAt ? ` · ${alert.sentAt}` : ""}. Il ne peut plus être modifié.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Alert context banner ─────────────────────────────────────
            Layout: 3-col grid on desktop ( icon | body | meta ), collapses
            to 2-col on mobile with the meta moved into a hairline-separated
            footer row. See .alert-detail-banner in globals.css. */}
        <motion.div
          className="alert-detail-banner"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: "0.875rem 1.125rem",
            borderRadius: "12px",
            background: cfg.tint,
            border: `1px solid ${cfg.color}22`,
          }}
        >
          <span
            className="alert-detail-banner-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "9px",
              background: cfg.color + "20",
              color: cfg.color,
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={16} strokeWidth={2.5} />
          </span>
          <div className="alert-detail-banner-body" style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.2rem",
                flexWrap: "wrap",
                rowGap: "0.15rem",
              }}
            >
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color }}>
                {cfg.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <CategoryIcon size={10} color={cfg.color + "88"} strokeWidth={2} />
                <span style={{ fontSize: "0.68rem", color: cfg.color + "99", fontFamily: "var(--font-mono)" }}>
                  {alert.id}
                </span>
              </div>
              <span style={{ fontSize: "0.65rem", color: cfg.color + "88" }}>
                · {CATEGORY_LABELS[alert.category]}
              </span>
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>
              {alert.title}
            </p>
          </div>
          <div
            className="alert-detail-banner-meta"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.72rem", color: "var(--text-3)" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", minWidth: 0 }}>
              <User size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {alert.client.name}
              </span>
            </span>
            <span style={{ color: "var(--text-4)", flexShrink: 0 }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Clock size={12} />
              {alert.timestamp}
            </span>
          </div>
        </motion.div>

        {/* ── Email composer card ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: "16px",
            background: "var(--surface)",
            boxShadow: "var(--tier-2)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            opacity: isSent ? 0.85 : 1,
            pointerEvents: isSent ? "none" : "auto",
            transition: "opacity 0.3s",
          }}
        >
          {/* Card header */}
          <div
            className="alert-email-card-head"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: "6px",
                  background: "var(--accent-tint)",
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                <Send size={11} strokeWidth={2.5} />
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                E-mail automatique
              </span>
            </div>
            {isSent ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--success)",
                  background: "var(--success-tint)",
                  padding: "0.22rem 0.65rem",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <CheckCheck size={10} strokeWidth={2.5} />
                Envoyé {alert.sentAt}
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-tint)",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Brouillon
              </span>
            )}
          </div>

          {/* Meta fields */}
          <div style={{ borderBottom: "1px solid var(--border)" }}>
            {/* De */}
            <div
              className="alert-email-meta-row-de"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
            >
              <span className="alert-email-meta-label" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-4)" }}>De</span>
              <div className="alert-email-meta-value">
                <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Helvebroker</span>
                <span style={{ marginLeft: "0.4rem", color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                  &lt;system@helvebroker.ch&gt;
                </span>
              </div>
            </div>

            {/* À */}
            <div
              className="alert-email-meta-row"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
            >
              <span className="alert-email-meta-label" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-4)" }}>À</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", background: "var(--surface-2)", padding: "0.2rem 0.6rem", borderRadius: "6px", flexShrink: 0, maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {alert.client.name}
                </span>
                <input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  readOnly={isSent}
                  style={{ flex: 1, fontSize: "0.78rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", background: "transparent", border: "none", outline: "none", minWidth: 0, width: "100%" }}
                />
              </div>
            </div>

            {/* Objet */}
            <div
              className="alert-email-meta-row"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span className="alert-email-meta-label" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-4)" }}>Objet</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                readOnly={isSent}
                placeholder="Objet de l'e-mail"
                style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", minWidth: 0, width: "100%" }}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="alert-email-toolbar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.15rem",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
              flexWrap: "wrap",
              rowGap: "0.3rem",
            }}
          >
            <ToolbarBtn onClick={() => format("bold")} title="Gras">
              <Bold size={13} strokeWidth={2.5} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => format("italic")} title="Italique">
              <Italic size={13} strokeWidth={2} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => format("underline")} title="Souligné">
              <Underline size={13} strokeWidth={2} />
            </ToolbarBtn>
            <TBDivider />
            <ToolbarBtn onClick={() => format("insertUnorderedList")} title="Liste à puces">
              <List size={13} strokeWidth={2} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => format("insertOrderedList")} title="Liste numérotée">
              <ListOrdered size={13} strokeWidth={2} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => format("insertHorizontalRule")} title="Séparateur">
              <Minus size={13} strokeWidth={2} />
            </ToolbarBtn>
            <TBDivider />

            {/* Variables dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowVarMenu((v) => !v); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-tint)",
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.28rem 0.6rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "opacity 0.15s",
                  height: 28,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>{"{{}}"}</span>
                Variable
                <ChevronDown size={10} strokeWidth={2.5} />
              </button>

              <AnimatePresence>
                {showVarMenu && (
                  <motion.div
                    className="alert-variables-menu"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        onMouseDown={(e) => { e.preventDefault(); insertVariable(v.key); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "0.45rem 0.625rem",
                          background: "transparent",
                          border: "none",
                          borderRadius: "7px",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          textAlign: "left",
                          transition: "background 0.12s",
                          gap: "0.75rem",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.1rem", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {v.label}
                          </div>
                          <div style={{ fontSize: "0.63rem", color: "var(--accent)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {"{{" + v.key + "}}"}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-4)", flexShrink: 0, maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {v.example}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preview toggle */}
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => {
                  if (!previewMode) syncBody();
                  setPreviewMode((v) => !v);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: previewMode ? "var(--text)" : "var(--text-3)",
                  background: previewMode ? "var(--surface-3)" : "transparent",
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.28rem 0.625rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                  height: 28,
                }}
              >
                {previewMode ? <EyeOff size={12} /> : <Eye size={12} />}
                {previewMode ? "Éditer" : "Aperçu"}
              </button>
            </div>
          </div>

          {/* ── Editor + Preview (editor always stays mounted to preserve content) ── */}
          <div style={{ position: "relative", minHeight: 300 }}>
            {/* ContentEditable — always mounted, hidden during preview */}
            <div
              ref={editorRef}
              contentEditable={!isSent}
              suppressContentEditableWarning
              onInput={syncBody}
              onBlur={syncBody}
              className="email-body alert-email-editor"
              style={{
                display: previewMode ? "none" : "block",
                fontSize: "0.875rem",
                color: "var(--text-2)",
                lineHeight: 1.78,
                minHeight: 300,
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />

            {/* Preview overlay — rendered from current bodyHtml */}
            {previewMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="email-body alert-email-preview"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-2)",
                  lineHeight: 1.78,
                  minHeight: 300,
                  fontFamily: "var(--font-sans)",
                }}
                dangerouslySetInnerHTML={{
                  __html: processForPreview(bodyHtml, previewVars),
                }}
              />
            )}
          </div>

          {/* Actions bar */}
          <div
            className="alert-email-actions"
            style={{
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--surface-2)",
              flexWrap: "wrap",
            }}
          >
            {!isSent && (
              <button
                onClick={handleSaveDraft}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: savedDraft ? "var(--success)" : "var(--text-3)",
                  background: savedDraft ? "var(--success-tint)" : "var(--surface-3)",
                  border: "none",
                  borderRadius: "9px",
                  padding: "0.55rem 1rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {savedDraft ? <CheckCheck size={13} /> : <Save size={13} />}
                {savedDraft ? "Sauvegardé" : "Brouillon"}
              </button>
            )}

            <div className="alert-email-actions-spacer" style={{ flex: 1 }} />

            {!isSent && (
              <button
                onClick={handleDismiss}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "9px",
                  padding: "0.55rem 0.875rem",
                  cursor: "pointer",
                  transition: "color 0.15s, background 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--danger-tint)";
                  e.currentTarget.style.color = "var(--danger)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                <X size={13} />
                Ignorer l&apos;alerte
              </button>
            )}

            {isSent ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--success)",
                  background: "var(--success-tint)",
                  borderRadius: "9px",
                  padding: "0.55rem 1.25rem",
                }}
              >
                <Lock size={13} />
                E-mail déjà envoyé
              </div>
            ) : (
              <button
                onClick={handleSend}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#fff",
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "9px",
                  padding: "0.55rem 1.375rem",
                  cursor: "pointer",
                  boxShadow: "var(--tier-1)",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <Send size={13} />
                <span className="alert-send-label-long">Envoyer l&apos;e-mail</span>
                <span className="alert-send-label-short">Envoyer</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
