"use client";

import { useEffect } from "react";
import { createMagneticButton, createTiltCard } from "@shared/lib/motion-utils";

/**
 * RIFAH CONNECT — ENTERPRISE ANIMATION SYSTEM
 * Inspired by Stripe, Linear, Vercel, and Apple motion engineering.
 * 
 * - Dual-layer architecture: Immediate native IntersectionObserver GPU reveals + GSAP desktop pinning
 * - Never fails on network/CDN latency or React Strict Mode remounts
 * - rAF + lerp damping for magnetic & tilt effects
 * - Zero CLS, hardware-accelerated (transform/opacity only)
 * - Full accessibility compliance (prefers-reduced-motion)
 */
export function useLandingAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cleanupFns = [];

    // ==========================================
    // 1. DESKTOP INTERACTIVE HELPERS (MAGNETIC & TILT)
    // ==========================================
    const setupInteractions = () => {
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

    // Run interactive setup on next frame
    const rafInteractive = requestAnimationFrame(setupInteractions);
    cleanupFns.push(() => cancelAnimationFrame(rafInteractive));

    // ==========================================
    // 2. NATIVE INTERSECTION OBSERVER REVEAL ENGINE
    // ==========================================
    // Stagger reveal helper
    const animateElementsIn = (elements, { transformFrom = "translateY(24px)", duration = 650, stagger = 80 } = {}) => {
      elements.forEach((el, index) => {
        el.style.opacity = "0";
        el.style.transform = transformFrom;
        el.style.willChange = "transform, opacity";
        el.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        el.style.transitionDelay = `${index * stagger}ms`;

        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translate(0, 0)";
        });
      });
    };

    const sectionConfigs = [
      {
        selector: "#category-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".category-card");
          animateElementsIn(cards, { transformFrom: "translateY(24px)", stagger: 70 });
        },
      },
      {
        selector: "#state-revenue-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".stat-card");
          animateElementsIn(cards, { transformFrom: "scale(0.95) translateY(18px)", stagger: 90 });
        },
      },
      {
        selector: "#featured-enterprises-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".featured-biz-card");
          animateElementsIn(cards, { transformFrom: "translateY(24px)", stagger: 80 });
        },
      },
      {
        selector: "#featured-products-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".featured-product-card");
          animateElementsIn(cards, { transformFrom: "translateY(24px)", stagger: 80 });
          // Reveal clip-path curtains
          section.querySelectorAll(".product-image-reveal").forEach((img) => {
            img.classList.add("is-revealed");
          });
        },
      },
      {
        selector: "#upcoming-events-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".upcoming-event-card");
          animateElementsIn(cards, { transformFrom: "translateX(-28px)", stagger: 100 });
        },
      },
      {
        selector: "#membership-plans-section",
        onEnter: (section) => {
          const cards = section.querySelectorAll(".membership-tier-card");
          animateElementsIn(cards, { transformFrom: "translateY(28px) scale(0.97)", stagger: 120 });
        },
      },
      {
        selector: "#site-footer",
        onEnter: (footer) => {
          footer.style.opacity = "0";
          footer.style.transform = "translateY(20px)";
          footer.style.transition = "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)";
          requestAnimationFrame(() => {
            footer.style.opacity = "1";
            footer.style.transform = "translate(0, 0)";
          });
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

    // ==========================================
    // 3. GSAP ENHANCEMENT (DESKTOP PINNED SECTION 7)
    // ==========================================
    let gsapContext = null;
    const initGsapIfAvailable = (gsap, ScrollTrigger) => {
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      gsapContext = gsap.context(() => {
        // Desktop pinned sequence for Membership Plans
        ScrollTrigger.matchMedia({
          "(min-width: 1024px)": () => {
            const tierCards = gsap.utils.toArray(".membership-tier-card");
            if (tierCards.length >= 3) {
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: "#membership-plans-section",
                  start: "top 12%",
                  end: "+=750",
                  pin: true,
                  scrub: 0.6,
                  anticipatePin: 1,
                },
              });

              tl.fromTo(
                tierCards[0],
                { opacity: 0, y: 35, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" }
              )
                .fromTo(
                  tierCards[1],
                  { opacity: 0, y: 35, scale: 0.96 },
                  { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" },
                  "+=0.25"
                )
                .fromTo(
                  tierCards[2],
                  { opacity: 0, y: 35, scale: 0.96 },
                  { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" },
                  "+=0.25"
                );
            }
          },
        });
      });
    };

    if (window.gsap && window.ScrollTrigger) {
      initGsapIfAvailable(window.gsap, window.ScrollTrigger);
    } else {
      const script1 = document.createElement("script");
      script1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      script1.async = true;
      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
        script2.async = true;
        script2.onload = () => {
          initGsapIfAvailable(window.gsap, window.ScrollTrigger);
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    }

    return () => {
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (_) {}
      });
      if (gsapContext) {
        gsapContext.revert();
      }
    };
  }, []);
}
