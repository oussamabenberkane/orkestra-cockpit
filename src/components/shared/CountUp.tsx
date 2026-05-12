"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 800, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export function formatThousands(n: number) {
  return Math.round(n).toLocaleString("fr-CH").replace(/[  ,]/g, " ");
}

export function CountUp({
  value,
  format,
  duration = 800,
  delay = 0,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
}) {
  const animated = useCountUp(value, duration, delay);
  const formatter = format ?? ((n: number) => formatThousands(n));
  return <>{formatter(animated)}</>;
}
