"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getActiveLanguage,
  applyDocumentLanguageDirection,
  reapplyGoogleTranslate,
} from "@shared/lib/google-translate";

/**
 * Ensures Google Translate stays active and re-translates newly rendered DOM nodes
 * on client-side route navigation without losing the user's selected language.
 */
export function GoogleTranslateRouteSync() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = getActiveLanguage();
    if (lang && lang !== "en") {
      applyDocumentLanguageDirection(lang);
      // Run once when route mounts and once again slightly later for async data/components
      const timer1 = setTimeout(() => {
        reapplyGoogleTranslate(lang);
      }, 150);
      const timer2 = setTimeout(() => {
        reapplyGoogleTranslate(lang);
      }, 450);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      applyDocumentLanguageDirection("en");
    }
  }, [pathname]);

  return null;
}
