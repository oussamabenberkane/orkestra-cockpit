"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, FileText, LifeBuoy } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea, Select } from "./FormControls";
import type { TicketCategory, TicketType } from "@/lib/support-types";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => Promise<void> | void;
  initialCategory?: TicketCategory;
  initialType?: TicketType;
  /** When true, disables submit + shows progress. */
  busy?: boolean;
}

export interface TicketFormData {
  type: TicketType;
  category: TicketCategory;
  customCategory?: string;
  subject: string;
  description: string;
  attachments: File[];
}

const categoryOptions: { value: TicketCategory; label: string }[] = [
  { value: "request_new_report", label: "Nouveau rapport" },
  { value: "technical_issue", label: "Problème technique" },
  { value: "feature_request", label: "Demande de fonctionnalité" },
  { value: "billing", label: "Facturation" },
  { value: "other", label: "Autre" },
];

const typeOptions: { value: TicketType; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "request", label: "Demande" },
];

const emptyForm: TicketFormData = {
  type: "incident",
  category: "technical_issue",
  subject: "",
  description: "",
  attachments: [],
};

export function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  initialCategory,
  initialType,
  busy = false,
}: CreateTicketModalProps) {
  const [form, setForm] = useState<TicketFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>(
    {},
  );

  // Apply initial values on open. We deliberately don't sync on every change —
  // once the modal is open, the user owns the state.
  useEffect(() => {
    if (!isOpen) return;
    setForm((prev) => ({
      ...prev,
      ...(initialType ? { type: initialType } : {}),
      ...(initialCategory
        ? { category: initialCategory }
        : initialType === "incident"
          ? { category: "technical_issue" as TicketCategory }
          : {}),
    }));
  }, [isOpen, initialType, initialCategory]);

  const setField = <K extends keyof TicketFormData>(key: K, value: TicketFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleTypeChange = (type: TicketType) => {
    setForm((prev) => ({
      ...prev,
      type,
      // Incident forces technical_issue. Switching back to Demande from a
      // forced technical_issue lands on request_new_report by default.
      category:
        type === "incident"
          ? "technical_issue"
          : prev.category === "technical_issue"
            ? "request_new_report"
            : prev.category,
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...valid] }));
  };

  const removeAttachment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof TicketFormData, string>> = {};
    if (!form.subject.trim()) next.subject = "Le sujet est requis.";
    if (!form.description.trim()) next.description = "La description est requise.";
    if (form.category === "other" && !form.customCategory?.trim()) {
      next.customCategory = "Précisez la catégorie.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;
    await onSubmit(form);
  };

  const handleClose = () => {
    if (busy) return;
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="support-create-modal"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: 0,
          width: "min(640px, calc(100vw - 24px))",
          maxWidth: "none",
          maxHeight: "calc(100dvh - 32px)",
          overflowX: "hidden",
          overflowY: "auto",
          boxSizing: "border-box",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 32px 80px -24px rgba(0,0,0,0.22), 0 8px 20px -12px rgba(0,0,0,0.08)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.1rem 1.25rem 0.9rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "var(--accent-tint)",
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              <LifeBuoy size={17} strokeWidth={2.5} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  letterSpacing: "-0.022em",
                  color: "var(--text)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Nouveau ticket de support
              </h2>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-3)",
                  margin: "0.15rem 0 0",
                }}
              >
                Décrivez votre demande ou signalez un incident — l&apos;équipe
                vous répond sous 24 h.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fermer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-3)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
                e.currentTarget.style.color = "var(--text-2)";
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "0 1.25rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Type toggle */}
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-2)",
                  marginBottom: "0.5rem",
                }}
              >
                Type
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {typeOptions.map((opt) => {
                  const active = form.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleTypeChange(opt.value)}
                      aria-pressed={active}
                      style={{
                        flex: 1,
                        padding: "0.7rem 0.85rem",
                        fontFamily: "inherit",
                        fontSize: "0.86rem",
                        fontWeight: 600,
                        borderRadius: "11px",
                        cursor: "pointer",
                        border: active
                          ? "1px solid var(--accent-2)"
                          : "1px solid var(--border)",
                        background: active
                          ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)"
                          : "var(--surface)",
                        color: active ? "#fff" : "var(--text-2)",
                        boxShadow: active
                          ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(88,86,214,0.22)"
                          : "var(--tier-1)",
                        transition: "transform 0.15s, background 0.15s",
                      }}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.985)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <Select
              id="ticket-category"
              label="Catégorie"
              value={form.category}
              onChange={(e) => setField("category", e.target.value as TicketCategory)}
              disabled={form.type === "incident"}
              hint={
                form.type === "incident"
                  ? "Catégorie figée à « Problème technique » pour les incidents."
                  : undefined
              }
              options={categoryOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                disabled: form.type === "request" && opt.value === "technical_issue",
              }))}
            />

            {/* Custom category */}
            {form.category === "other" && (
              <Input
                id="ticket-custom-category"
                label="Précisez la catégorie"
                placeholder="Décrivez la catégorie"
                value={form.customCategory ?? ""}
                onChange={(e) => setField("customCategory", e.target.value)}
                error={errors.customCategory ?? null}
              />
            )}

            {/* Subject */}
            <Input
              id="ticket-subject"
              label="Sujet"
              placeholder="Brève description du problème"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              error={errors.subject ?? null}
            />

            {/* Description */}
            <Textarea
              id="ticket-description"
              label="Description"
              placeholder="Donnez le maximum de détails sur votre demande ou l'incident…"
              rows={6}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              error={errors.description ?? null}
            />

            {/* Attachments */}
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-2)",
                  marginBottom: "0.5rem",
                }}
              >
                Pièces jointes (optionnel)
              </span>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.85rem",
                  border: "1.5px dashed var(--border-strong)",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  fontSize: "0.82rem",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-tint)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                <Upload size={16} />
                Cliquez pour ajouter des fichiers (10 Mo max chacun)
                <input
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept="image/*,.pdf,.doc,.docx,.txt,.log"
                />
              </label>

              {form.attachments.length > 0 && (
                <div
                  style={{
                    marginTop: "0.6rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {form.attachments.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.55rem",
                        padding: "0.55rem 0.75rem",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "11px",
                      }}
                    >
                      <FileText size={15} color="var(--accent)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-4)",
                            margin: 0,
                          }}
                        >
                          {formatSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        aria-label={`Supprimer ${file.name}`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          background: "transparent",
                          border: "none",
                          color: "var(--text-4)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--danger-tint)";
                          e.currentTarget.style.color = "var(--danger)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-4)";
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p
                style={{
                  marginTop: "0.45rem",
                  fontSize: "0.7rem",
                  color: "var(--text-4)",
                }}
              >
                Formats acceptés : images, PDF, DOC, TXT, LOG.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              padding: "0.95rem 1.25rem",
              borderTop: "1px solid var(--border)",
              background: "var(--surface-2)",
              position: "sticky",
              bottom: 0,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              style={{
                padding: "0.6rem 1.05rem",
                minHeight: 40,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontFamily: "inherit",
                fontSize: "0.84rem",
                fontWeight: 500,
                cursor: busy ? "not-allowed" : "pointer",
                borderRadius: "9px",
                opacity: busy ? 0.6 : 1,
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              style={{
                padding: "0.6rem 1.15rem",
                minHeight: 40,
                background:
                  "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
                border: "1px solid var(--accent-2)",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: busy ? "wait" : "pointer",
                borderRadius: "9px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(88,86,214,0.22), 0 6px 16px -8px rgba(88,86,214,0.5)",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Envoi…" : "Créer le ticket"}
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
