"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

/** Shared field wrapper: label on top, input below, error/help underneath. */
function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-2)",
          }}
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--danger)",
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      ) : hint ? (
        <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>{hint}</span>
      ) : null}
    </div>
  );
}

const baseControl = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "11px",
  padding: "0.7rem 0.85rem",
  minHeight: 44,
  fontFamily: "inherit",
  fontSize: "16px",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxShadow: "var(--tier-1)",
  boxSizing: "border-box" as const,
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Input({ label, error, hint, id, ...props }: InputProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <input
        id={id}
        {...props}
        style={{
          ...baseControl,
          borderColor: error ? "var(--danger)" : "var(--border)",
          ...(props.style ?? {}),
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--border)";
        }}
      />
    </Field>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Textarea({ label, error, hint, id, ...props }: TextareaProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <textarea
        id={id}
        {...props}
        style={{
          ...baseControl,
          minHeight: 96,
          resize: "vertical",
          lineHeight: 1.5,
          borderColor: error ? "var(--danger)" : "var(--border)",
          ...(props.style ?? {}),
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--border)";
        }}
      />
    </Field>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export function Select({
  label,
  error,
  hint,
  id,
  options,
  ...props
}: SelectProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <select
        id={id}
        {...props}
        style={{
          ...baseControl,
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236E6E73' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.85rem center",
          paddingRight: "2.25rem",
          cursor: props.disabled ? "not-allowed" : "pointer",
          opacity: props.disabled ? 0.6 : 1,
          borderColor: error ? "var(--danger)" : "var(--border)",
          ...(props.style ?? {}),
        }}
        onFocus={(e) => {
          if (!error && !props.disabled)
            e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
