"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Placement = "bottom-end" | "bottom-start" | "top-end" | "right-end" | "right-start";

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void; close: () => void }) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  placement?: Placement;
  width?: number | string;
  offset?: number;
  /** Render the popup in a portal (document.body) using fixed positioning.
   *  Use when the trigger lives inside an overflow:hidden ancestor. */
  portal?: boolean;
}

export function Popover({
  trigger,
  children,
  placement = "bottom-end",
  width,
  offset = 8,
  portal = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inWrapper = wrapperRef.current?.contains(target);
      const inContent = contentRef.current?.contains(target);
      if (!inWrapper && !inContent) setOpen(false);
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => {
    if (!open && portal && wrapperRef.current) {
      setTriggerRect(wrapperRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  };

  /* Absolute position (non-portal) */
  const positionStyle: React.CSSProperties = (() => {
    switch (placement) {
      case "bottom-end":   return { top: `calc(100% + ${offset}px)`, right: 0 };
      case "bottom-start": return { top: `calc(100% + ${offset}px)`, left: 0 };
      case "top-end":      return { bottom: `calc(100% + ${offset}px)`, right: 0 };
      case "right-end":    return { left: `calc(100% + ${offset}px)`, bottom: 0 };
      case "right-start":  return { left: `calc(100% + ${offset}px)`, top: 0 };
    }
  })();

  /* Fixed position (portal) — derived from trigger's bounding rect */
  const fixedStyle: React.CSSProperties = (() => {
    if (!triggerRect) return {};
    switch (placement) {
      case "bottom-end":
        return { top: triggerRect.bottom + offset, right: window.innerWidth - triggerRect.right };
      case "bottom-start":
        return { top: triggerRect.bottom + offset, left: triggerRect.left };
      case "top-end":
        return { bottom: window.innerHeight - triggerRect.top + offset, right: window.innerWidth - triggerRect.right };
      case "right-end":
        return { left: triggerRect.right + offset, bottom: window.innerHeight - triggerRect.bottom };
      case "right-start":
        return { left: triggerRect.right + offset, top: triggerRect.top };
    }
  })();

  const transformOrigin: string = (() => {
    switch (placement) {
      case "bottom-end":   return "top right";
      case "bottom-start": return "top left";
      case "top-end":      return "bottom right";
      case "right-end":    return "bottom left";
      case "right-start":  return "top left";
    }
  })();

  const popoverContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.97, y: placement.startsWith("right") ? 0 : (placement.startsWith("top") ? 4 : -4) }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: placement.startsWith("right") ? 0 : (placement.startsWith("top") ? 4 : -4) }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: portal ? "fixed" : "absolute",
            ...(portal ? fixedStyle : positionStyle),
            width: width,
            zIndex: portal ? 9999 : 60,
            transformOrigin,
          }}
        >
          {typeof children === "function" ? children(close) : children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-flex" }}>
      {trigger({ open, toggle, close })}
      {portal && typeof document !== "undefined"
        ? createPortal(popoverContent, document.body)
        : popoverContent}
    </div>
  );
}
