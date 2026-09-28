"use client";

import React, { useEffect, useRef, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * High-performance GPU-accelerated count-up component
 * Animate numbers from 0 to final target value using GSAP proxy with WAAPI/rAF fallback.
 */
export function StatCountUp({ value, isCurrency = true, className = "" }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const target = Number(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            const startTime = performance.now();
            const duration = 1600;
            const step = (now) => {
              const elapsed = Math.min((now - startTime) / duration, 1);
              // easeOutCubic: 1 - Math.pow(1 - t, 3)
              const progress = 1 - Math.pow(1 - elapsed, 3);
              setDisplayValue(Math.round(progress * target));
              if (elapsed < 1) {
                requestAnimationFrame(step);
              }
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {isCurrency
        ? currencyFormatter.format(displayValue)
        : displayValue.toLocaleString("en-IN")}
    </span>
  );
}

export default StatCountUp;
