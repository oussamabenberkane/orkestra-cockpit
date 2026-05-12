"use client";

import { useState } from "react";

export type NavTab = {
  label: string;
  active?: boolean;
  subSections?: string[];
};

interface ExpandingNavProps {
  tabs: NavTab[];
  bgColor?: string;
}

export function ExpandingNav({ tabs, bgColor = "var(--surface)" }: ExpandingNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const t of tabs) {
      if (t.active && t.subSections?.[0]) out[t.label] = t.subSections[0];
    }
    return out;
  });

  return (
    <div
      className="exnav-root"
      onMouseLeave={() => setHovered(null)}
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        height: "100%",
      }}
    >
      <div
        className="exnav-scroll"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.2rem",
          height: "100%",
          overflow: "hidden",
          paddingRight: "70px",
          maskImage:
            "linear-gradient(to right, black 0, black calc(100% - 70px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0, black calc(100% - 70px), transparent 100%)",
        }}
      >
        {tabs.map((tab) => {
          const isHover = hovered === tab.label;
          const isExpanded = isHover && (tab.subSections?.length ?? 0) > 0;
          return (
            <div
              key={tab.label}
              className="exnav-group"
              onMouseEnter={() => setHovered(tab.label)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                flexShrink: 0,
                height: "100%",
              }}
            >
              <button
                className="exnav-tab"
                data-active={tab.active ? "true" : undefined}
                style={{
                  background: tab.active ? "var(--surface-2)" : "transparent",
                  border: "none",
                  padding: "0.45rem 0.75rem",
                  fontFamily: "inherit",
                  fontSize: "0.86rem",
                  fontWeight: tab.active ? 600 : 500,
                  color: tab.active ? "var(--text)" : "var(--text-3)",
                  cursor: "pointer",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  transition: "color 0.18s, background 0.18s",
                }}
              >
                {tab.label}
              </button>

              <div
                className="exnav-subs"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  overflow: "hidden",
                  maxWidth: isExpanded ? "700px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateX(0)" : "translateX(-6px)",
                  transition:
                    "max-width 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease-out, transform 0.26s ease-out",
                  marginLeft: isExpanded ? "0.1rem" : "0",
                }}
                aria-hidden={!isExpanded}
              >
                <span
                  aria-hidden
                  style={{
                    width: 1,
                    height: "14px",
                    background: "var(--border-strong)",
                    flexShrink: 0,
                    marginRight: "0.15rem",
                  }}
                />
                {tab.subSections?.map((s, i) => {
                  const isSubActive = activeSub[tab.label] === s;
                  return (
                    <button
                      key={s}
                      className="exnav-sub"
                      onClick={() =>
                        setActiveSub((prev) => ({ ...prev, [tab.label]: s }))
                      }
                      style={{
                        background: isSubActive ? "var(--accent-tint)" : "transparent",
                        color: isSubActive ? "var(--accent)" : "var(--text-3)",
                        border: "none",
                        padding: "0.3rem 0.55rem",
                        fontFamily: "inherit",
                        fontSize: "0.78rem",
                        fontWeight: isSubActive ? 600 : 500,
                        cursor: "pointer",
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        transition: "color 0.15s, background 0.15s, transform 0.22s",
                        transitionDelay: isExpanded ? `${50 + i * 28}ms` : "0ms",
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? "translateY(0)" : "translateY(-2px)",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right-edge blur layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "60px",
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to right, transparent, black 70%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 70%)",
        }}
      />
      {/* Right-edge fade overlay (atop the blur, for color blend) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "70px",
          pointerEvents: "none",
          background: `linear-gradient(to right, transparent 0%, ${bgColor} 90%)`,
        }}
      />

      <style>{`
        .exnav-tab:hover:not([data-active="true"]) {
          color: var(--text);
          background: var(--surface-2);
        }
        .exnav-sub:hover {
          color: var(--text);
          background: var(--surface-3);
        }
      `}</style>
    </div>
  );
}
