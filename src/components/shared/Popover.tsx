"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Placement = "bottom-end" | "bottom-start" | "top-end" | "right-end" | "right-start";

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void; close: () => void }) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  placement?: Placement;
  width?: number | string;
  offset?: number;
}

export function Popover({
  trigger,
  children,
  placement = "bottom-end",
  width,
  offset = 8,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
  const toggle = () => setOpen((o) => !o);

  const positionStyle: React.CSSProperties = (() => {
    switch (placement) {
      case "bottom-end":
        return { top: `calc(100% + ${offset}px)`, right: 0 };
      case "bottom-start":
        return { top: `calc(100% + ${offset}px)`, left: 0 };
      case "top-end":
        return { bottom: `calc(100% + ${offset}px)`, right: 0 };
      case "right-end":
        return { left: `calc(100% + ${offset}px)`, bottom: 0 };
      case "right-start":
        return { left: `calc(100% + ${offset}px)`, top: 0 };
    }
  })();

  const transformOrigin: string = (() => {
    switch (placement) {
      case "bottom-end":
        return "top right";
      case "bottom-start":
        return "top left";
      case "top-end":
        return "bottom right";
      case "right-end":
        return "bottom left";
      case "right-start":
        return "top left";
    }
  })();

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {trigger({ open, toggle, close })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: placement.startsWith("top") ? 4 : -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement.startsWith("top") ? 4 : -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              ...positionStyle,
              width: width,
              zIndex: 60,
              transformOrigin,
            }}
          >
            {typeof children === "function" ? children(close) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
