"use client";

import { useState, useEffect, useRef } from "react";

// Animates a number from 0 → value once it enters the viewport
export default function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          if (value === 0) return;
          setTriggered(true);
          let current = 0;
          const step = Math.max(1, Math.ceil(value / 55));
          const timer = setInterval(() => {
            current = Math.min(current + step, value);
            setCount(current);
            if (current >= value) clearInterval(timer);
          }, 22);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, triggered]);
  return <span ref={ref}>{count}{suffix}</span>;
}
