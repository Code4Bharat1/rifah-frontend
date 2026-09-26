"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/utils";

/**
 * RIFAH AI Bot Mascot Character
 * Renders the exact high-resolution mascot image with glow, rounded border, and smooth fallback.
 */
export function AiBotAvatar({ className = "h-8 w-8", glow = false, alt = "RIFAH AI Copilot Bot" }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center select-none overflow-visible",
        glow && "drop-shadow-[0_0_14px_rgba(0,180,255,0.65)]",
        className
      )}
    >
      {!hasError ? (
        <img
          src="/images/ai-bot-avatar.png"
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="badgeGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1B5BFF" />
              <stop offset="100%" stopColor="#0034CC" />
            </linearGradient>
            <linearGradient id="helmetGrad" x1="60" y1="60" x2="140" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <path
            d="M 100 12 C 148.6 12 188 51.4 188 100 C 188 148.6 148.6 188 100 188 C 76.5 188 55.1 178.8 39.3 163.7 L 24 184 L 32 144.5 C 19.5 131.6 12 114.7 12 100 C 12 51.4 51.4 12 100 12 Z"
            fill="url(#badgeGrad)"
          />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#FFFFFF" strokeWidth="8" />
          <ellipse cx="100" cy="110" rx="55" ry="42" fill="url(#helmetGrad)" />
          <rect x="65" y="90" width="70" height="42" rx="18" fill="#090D16" />
          <path d="M 78 110 C 80 102 90 102 92 110" fill="none" stroke="#00F5FF" strokeWidth="5" strokeLinecap="round" />
          <path d="M 108 110 C 110 102 120 102 122 110" fill="none" stroke="#00F5FF" strokeWidth="5" strokeLinecap="round" />
          <path d="M 94 118 Q 100 125 106 118" fill="#00F5FF" stroke="#00F5FF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

/**
 * Yellow 4-point Sparkle Icon matching Image 1
 */
export function YellowSparkleIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[#FDE047] shrink-0", className)}
    >
      {/* Central 4-point star */}
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        stroke="#FFDD00"
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="#FFEB3B"
      />
      {/* Top right satellite sparkle dot */}
      <circle cx="19" cy="5" r="1.6" fill="#FFDD00" />
      {/* Bottom left satellite sparkle dot */}
      <circle cx="5" cy="18" r="1.3" fill="#FFDD00" />
    </svg>
  );
}
