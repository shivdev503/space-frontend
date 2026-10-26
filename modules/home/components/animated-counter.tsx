"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
};

export function AnimatedCounter({ value, suffix = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });
  // Start at the real value so server HTML (and crawlers) show it — not "0+".
  const [count, setCount] = useState(value);
  const [animate, setAnimate] = useState(false);

  // Count up only for counters that are still off-screen after hydration (no visible flash).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { top } = el.getBoundingClientRect();
    if (top > window.innerHeight) {
      setCount(0);
      setAnimate(true);
    }
  }, []);

  useEffect(() => {
    if (!animate || !isInView) return;

    const duration = 1200;
    const start = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [animate, isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
