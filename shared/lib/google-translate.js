import { RTL_LANGUAGES } from "@shared/config/languages";

/**
 * Resolves current Google Translate language from cookie or localStorage
 */
export function getActiveLanguage() {
  if (typeof document === "undefined") return "en";
  try {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const stored = localStorage.getItem("rifah_locale");
    if (stored) return stored;
  } catch {}
  return "en";
}

/**
 * Sets and synchronizes Google Translate cookie cleanly across all domain variations
 */
export function setGoogleTranslateCookie(langCode) {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname;
  const isIp = /^(\d+\.){3}\d+$/.test(hostname);
  const parts = hostname.split(".");
  const rootDomain = parts.length > 2 ? `.${parts.slice(-2).join(".")}` : `.${hostname}`;

  if (!langCode || langCode === "en") {
    // Clear cookie variants
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (hostname !== "localhost" && !isIp) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
    }
    try {
      localStorage.setItem("rifah_locale", "en");
    } catch {}
  } else {
    const cookieVal = `/en/${langCode}`;
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `googtrans=${cookieVal}; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (hostname !== "localhost" && !isIp) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname}; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname}; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain}; max-age=${maxAge}; SameSite=Lax`;
    }
    try {
      localStorage.setItem("rifah_locale", langCode);
    } catch {}
  }
}

/**
 * Updates DOM document direction and language attributes (supports Urdu, Arabic, etc.)
 */
export function applyDocumentLanguageDirection(langCode) {
  if (typeof document === "undefined") return;
  const isRtl = RTL_LANGUAGES.includes(langCode);
  document.documentElement.lang = langCode || "en";
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
}

/**
 * Dynamically changes the active Google Translate language without a full page reload
 */
export function changeGoogleTranslateLanguage(langCode) {
  setGoogleTranslateCookie(langCode);
  applyDocumentLanguageDirection(langCode);

  const select = document.querySelector(".goog-te-combo");

  // If restoring to English, clear combo and reload to strip all Google DOM font wraps cleanly
  if (!langCode || langCode === "en") {
    if (select) {
      select.value = "";
      select.dispatchEvent(new Event("change"));
    }
    window.location.reload();
    return true;
  }

  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    return true;
  }

  // If combo isn't mounted yet, reload once so Google script picks up the cookie
  window.location.reload();
  return false;
}

/**
 * Re-triggers translation on route change for newly mounted client DOM
 */
export function reapplyGoogleTranslate(langCode) {
  if (typeof window === "undefined") return;
  const targetLang = langCode || getActiveLanguage();
  if (!targetLang || targetLang === "en") return;

  applyDocumentLanguageDirection(targetLang);

  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = targetLang;
    select.dispatchEvent(new Event("change"));
  }
}
