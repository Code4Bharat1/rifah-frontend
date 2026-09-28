"use client";

import { useEffect } from "react";
import { createMagneticButton, createTiltCard } from "@shared/lib/motion-utils";

/**
 * RIFAH CONNECT — ENTERPRISE ANIMATION SYSTEM
 * High-performance GPU-accelerated motion engine:
 * - Fluid native IntersectionObserver reveals with staggered GPU hardware acceleration
 * - Dynamic mutation observation for asynchronously loaded sections
 * - Complete style cleanup after entrance so CSS hover states (:hover, :active) remain 100% responsive
 * - Zero CLS, transforms/opacity only
 * - Full accessibility compliance (prefers-reduced-motion)
 */
export function useLandingAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Accessibility check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanupFns = [];

    // ==========================================
    // 1. DESKTOP INTERACTIVE HELPERS (MAGNETIC & TILT)
    // ==========================================
    const setupInteractions = () => {
      if (prefersReducedMotion) return;

      // Magnetic Buttons
      const magneticButtons = document.querySelectorAll(".magnetic-btn");
      magneticButtons.forEach((btn) => {
        const cleanup = createMagneticButton(btn, { maxMove: 8, damping: 0.18, radius: 90 });
        cleanupFns.push(cleanup);
      });

      // 3D Tilt Cards with localized cursor glow
      const tiltCards = document.querySelectorAll(".featured-biz-card, .featured-product-card");
      tiltCards.forEach((card) => {
        const cleanup = createTiltCard(card, { maxTilt: 7, damping: 0.15 });
        cleanupFns.push(cleanup);
      });
    };

    // Run interactive setup on initial mount frame
    const rafInteractive = requestAnimationFrame(setupInteractions);
    cleanupFns.push(() => cancelAnimationFrame(rafInteractive));

    // ==========================================
    // 2. NATIVE GPU REVEAL ENGINE
    // ==========================================
    const animateElementsIn = (
      elements,
      { transformFrom = "translateY(24px)", duration = 550, stagger = 75 } = {}
    ) => {
      if (!elements || elements.length === 0) return;

      elements.forEach((el, index) => {
        if (prefersReducedMotion) {
          el.style.opacity = "1";
          el.style.transform = "none";
          return;
        }

        const delay = index * stagger;
        el.style.opacity = "0";
        el.style.transform = transformFrom;
        el.style.willChange = "transform, opacity";
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        el.style.transitionDelay = `${delay}ms`;

        // Force browser layout flush
        void el.offsetHeight;

        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translate(0, 0)";
        });

        // Clean up inline styles once entrance transition completes
        // so CSS hover transforms and active states work with zero delay
        const totalDuration = duration + delay + 80;
        const timer = setTimeout(() => {
          el.style.opacity = "";
          el.style.transform = "";
          el.style.transition = "";
          el.style.transitionDelay = "";
          el.style.willChange = "";
        }, totalDuration);
        cleanupFns.push(() => clearTimeout(timer));
      });
    };

    // Helper to reveal elements immediately or wait for async mount via MutationObserver
    const observeOrWait = (section, cardSelector, animationOptions, onRevealed) => {
      const run = () => {
        const items = section.querySelectorAll(cardSelector);
        if (items.length > 0) {
          animateElementsIn(items, animationOptions);
          if (onRevealed) onRevealed(items);
          setupInteractions();
          return true;
        }
        return false;
      };

      if (!run()) {
        const mo = new MutationObserver(() => {
          if (run()) mo.disconnect();
        });
        mo.observe(section, { childList: true, subtree: true });
        cleanupFns.push(() => mo.disconnect());
      }
    };

    const sectionConfigs = [
      {
        selector: "#category-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".category-card");
          animateElementsIn(cards, { transformFrom: "translateY(24px)", duration: 500, stagger: 60 });
        },
      },
      {
        selector: "#state-revenue-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".stat-card");
          animateElementsIn(cards, { transformFrom: "scale(0.95) translateY(18px)", duration: 500, stagger: 70 });
        },
      },
      {
        selector: "#featured-enterprises-section",
        onEnter: (section) => {
          observeOrWait(section, ".featured-biz-card", { transformFrom: "translateY(24px)", duration: 550, stagger: 80 });
        },
      },
      {
        selector: "#featured-products-section",
        onEnter: (section) => {
          observeOrWait(
            section,
            ".featured-product-card",
            { transformFrom: "translateY(24px)", duration: 550, stagger: 80 },
            () => {
              section.querySelectorAll(".product-image-reveal").forEach((img) => {
                img.classList.add("is-revealed");
              });
            }
          );
        },
      },
      {
        selector: "#upcoming-events-section",
        onEnter: (section) => {
          observeOrWait(section, ".upcoming-event-card", { transformFrom: "translateX(-24px)", duration: 550, stagger: 90 });
        },
      },
      {
        selector: "#membership-plans-section",
        onEnter: (section) => {
          observeOrWait(
            section,
            ".membership-tier-card",
            { transformFrom: "translateY(28px) scale(0.97)", duration: 600, stagger: 90 }
          );
        },
      },
      {
        selector: "#site-footer",
        onEnter: (footer) => {
          footer.style.opacity = "0";
          footer.style.transform = "translateY(20px)";
          footer.style.transition = "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)";
          void footer.offsetHeight;
          requestAnimationFrame(() => {
            footer.style.opacity = "1";
            footer.style.transform = "translate(0, 0)";
          });
          const timer = setTimeout(() => {
            footer.style.opacity = "";
            footer.style.transform = "";
            footer.style.transition = "";
          }, 700);
          cleanupFns.push(() => clearTimeout(timer));
        },
      },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const config = sectionConfigs.find((c) => entry.target.matches(c.selector));
            if (config && config.onEnter) {
              config.onEnter(entry.target);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Initial check and observe
    sectionConfigs.forEach((c) => {
      const el = document.querySelector(c.selector);
      if (el) observer.observe(el);
    });

    cleanupFns.push(() => observer.disconnect());

    return () => {
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (_) {}
      });
    };
  }, []);
}
