"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Apple,
  ArrowUp,
  Bookmark,
  Building2,
  CalendarDays,
  FileStack,
  Globe,
  Home,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { RifahLogo } from "@shared/components/rifah/brand";
import { LanguageSelector } from "@shared/components/rifah/language-selector";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { RifahCopilotWidget } from "@shared/components/rifah/rifah-copilot-widget";
import { PolicyDialog } from "@shared/components/rifah/policy-dialog";

const primaryNav = [
  { tKey: "discover", to: "/discover" },
  { label: "Our Presence", to: "/presence" },
  { tKey: "events", to: "/events" },
  { label: "Our Leadership", to: "/members" },
  { tKey: "membership", to: "/membership" },
  { tKey: "about", to: "/about" },
  { tKey: "contact", to: "/contact" },
];

const mobileTabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Discover", to: "/discover", icon: Search },
  { label: "Presence", to: "/presence", icon: MapPin },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Account", to: "/login", icon: UserRound },
];

export function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations("Navbar");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const dashboardPath =
    user?.role === "central_admin"
      ? "/admin"
      : user?.role === "state_admin"
        ? "/state-admin"
        : user?.role === "chapter_admin"
          ? "/chapter-admin"
          : "/biz";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="rifah-container flex h-14 items-center gap-3 md:h-[68px]">
        <RifahLogo />

        <nav className="ml-4 xl:ml-6 hidden items-center gap-0.5 xl:gap-1 lg:flex flex-nowrap shrink-0" aria-label="Main">
          {primaryNav.map((item) => {
            const isActive = pathname === item.to || (item.to !== "/" && pathname?.startsWith(`${item.to}/`));
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "rounded-lg px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.tKey ? t(`nav.${item.tKey}`) : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/discover" aria-label="Search businesses">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <LanguageSelector />
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href={dashboardPath}>{t("dashboard")}</Link>
              </Button>
              <div className="hidden items-center gap-1.5 md:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive" title="Logout">
                  <LogOut className="h-4.5 w-4.5" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <LanguageSelector />
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild variant="brand" className="hidden sm:inline-flex">
                <Link href="/register-business">{t("register")}</Link>
              </Button>
            </>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations("Navbar");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const dashboardPath =
    user?.role === "central_admin"
      ? "/admin"
      : user?.role === "state_admin"
        ? "/state-admin"
        : user?.role === "chapter_admin"
          ? "/chapter-admin"
          : "/biz";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-left">
            <RifahLogo />
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-1 p-3">
          {primaryNav.map((item) => {
            const isActive = pathname === item.to || (item.to !== "/" && pathname?.startsWith(`${item.to}/`));
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.tKey ? t(`nav.${item.tKey}`) : item.label}
              </Link>
            );
          })}
          {isAuthenticated ? (
            <div className="mt-2 border-t border-border pt-3">
              {user && (
                <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                </div>
              )}
              <Link href={dashboardPath} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-muted">
                <UserRound className="h-4 w-4 text-primary" /> My Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 border-t border-border pt-3">
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="brand">
                <Link href="/register-business">Join RIFAH</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PublicFooter() {
  const [activePolicy, setActivePolicy] = useState(null);

  const quickLinks = [
    { key: "faqs", label: "Frequently Asked Questions (FAQs)" },
    { key: "terms", label: "Terms & Conditions" },
    { key: "payment", label: "Payment Policy" },
    { key: "membership", label: "Membership Policy" },
  ];

  const socialLinks = [
    {
      name: "WhatsApp",
      href: "https://wa.me/+918097781851",
      icon: (
        <svg className="h-4 w-4 fill-current text-emerald-400" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/rifahindia/",
      icon: (
        <svg className="h-4 w-4 fill-current text-blue-400" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/rifahchamberofcommerce/",
      icon: (
        <svg className="h-4 w-4 fill-current text-pink-400" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://in.linkedin.com/company/rifahindia",
      icon: (
        <svg className="h-4 w-4 fill-current text-sky-400" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@rifahindia",
      icon: (
        <svg className="h-4 w-4 fill-current text-red-500" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const handleScrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-10 sm:mt-12 border-t border-navy-foreground/10 bg-navy text-navy-foreground">
      {/* Tier 1: Action CTAs & Connect App Download Badges */}
      <div className="border-b border-navy-foreground/10 bg-navy/95 backdrop-blur">
        <div className="rifah-container flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-foreground/90">
              QUICK ACTIONS:
            </span>
            <Link
              href="/register-business"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition shadow-sm"
            >
              Connect With Us
            </Link>
            <a
              href="https://wa.me/918097781851?text=Hello%0AI%20would%20like%20to%20know%20more%20about%20your%20services.%20Please%20share%20the%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition shadow-sm"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat With Us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-400/15 px-4 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500 hover:text-white transition shadow-sm"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact Us
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-foreground/80">
              DOWNLOAD THE RIFAH CONNECT APP
            </span>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-navy-foreground/20 bg-black/40 px-3 py-1.5 transition hover:border-emerald-500/50 hover:bg-black/60"
              title="Download RIFAH Connect on Google Play"
            >
              <svg className="h-4 w-4 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.61-1.637V3.451c0-.624.226-1.2.609-1.637zm11.236 11.239l2.484 2.484-11.83 6.72c-.17.098-.349.16-.531.189l9.877-9.393zm0-2.106L4.968 1.554c.182.029.361.091.531.189l11.83 6.72-2.484 2.484zm1.485 1.053l4.085 2.32c.983.559.983 1.469 0 2.028l-4.085 2.32-2.12-2.12 2.12-2.548z" />
              </svg>
              <div className="text-left leading-none">
                <div className="text-[8px] uppercase tracking-wider text-navy-foreground/60">GET IT ON</div>
                <div className="mt-0.5 text-xs font-semibold text-navy-foreground">Google Play</div>
              </div>
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-navy-foreground/20 bg-black/40 px-3 py-1.5 transition hover:border-sky-400/50 hover:bg-black/60"
              title="Download RIFAH Connect on Apple App Store"
            >
              <Apple className="h-4 w-4 text-white shrink-0" />
              <div className="text-left leading-none">
                <div className="text-[8px] uppercase tracking-wider text-navy-foreground/60">Download on the</div>
                <div className="mt-0.5 text-xs font-semibold text-navy-foreground">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Tier 2: 3-Column Core Content Grid */}
      <div className="rifah-container grid gap-8 py-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-10">
        {/* Column 1: Brand Logo & Mission */}
        <div className="space-y-3.5 md:col-span-2 lg:col-span-5 lg:pr-6">
          <div>
            <RifahLogo showLabel={true} onDark={true} className="inline-flex" />
          </div>
          <p className="text-xs leading-relaxed text-navy-foreground/75 sm:text-[13px]">
            Rifah’s mission is to create a platform where business is generated through effective networking, and to scale up existing businesses by implementing proper systems using the latest management techniques.
          </p>
        </div>

        {/* Column 2: GET IN TOUCH */}
        <div className="space-y-3.5 md:col-span-1 lg:col-span-4 lg:px-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-foreground">
            GET IN TOUCH
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            {/* Sub-col 1: Contact Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-navy-foreground">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Contact Details</span>
              </div>
              <div className="space-y-1.5 pl-5 text-navy-foreground/75">
                <div>
                  <a href="tel:+918097781851" className="hover:text-primary transition-colors block font-mono text-[11px]">
                    +91-8097781851
                  </a>
                </div>
                <div>
                  <a href="tel:+917304078398" className="hover:text-primary transition-colors block font-mono text-[11px]">
                    +91-730-407-8398
                  </a>
                </div>
                <div>
                  <a href="tel:+919136130398" className="hover:text-primary transition-colors block font-mono text-[11px]">
                    +91-913-613-0398
                  </a>
                </div>
              </div>
            </div>

            {/* Sub-col 2: Email Queries & Website */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-navy-foreground">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Email &amp; Web</span>
              </div>
              <div className="space-y-1.5 pl-5 text-navy-foreground/75">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-foreground/50 block">Primary:</span>
                  <a href="mailto:office@rifah.org" className="hover:text-primary transition-colors block">
                    office@rifah.org
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-foreground/50 block">Secondary:</span>
                  <a href="mailto:info@rifah.org" className="hover:text-primary transition-colors block">
                    info@rifah.org
                  </a>
                </div>
                <div className="pt-1 flex items-center gap-1 text-primary">
                  <Globe className="h-3 w-3 shrink-0" />
                  <a href="https://www.rifah.org" target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold text-[11px]">
                    www.rifah.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Links */}
        <div className="space-y-3.5 md:col-span-1 lg:col-span-3 lg:pl-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-foreground">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-xs text-navy-foreground/75">
            {quickLinks.map((l) => (
              <li key={l.key}>
                <button
                  type="button"
                  onClick={() => setActivePolicy(l.key)}
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-primary cursor-pointer text-left text-navy-foreground/75 hover:text-navy-foreground"
                  title={`View ${l.label}`}
                >
                  <span className="text-primary/70 transition-transform group-hover:translate-x-0.5">•</span>
                  <span>{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Horizontal Registered Office & Corporate Office Banner across full width */}
        <div className="rounded-xl border border-navy-foreground/15 bg-black/25 p-4 text-xs text-navy-foreground/80 shadow-inner md:col-span-2 lg:col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-navy-foreground/15">
            {/* Registered Office */}
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                  REGISTERED OFFICE:
                </span>
                <p className="text-[11px] leading-relaxed text-navy-foreground/75 sm:text-xs">
                  Flat No. 4 C &amp; D, 1st Floor, Plot No. 96, 77C, Hamid Building, Hafiz Ali Bahadur Khan Marg, Mominpura, Jacob Circle, Byculla West, Mumbai - 400011, Maharashtra
                </p>
              </div>
            </div>

            {/* Corporate Office */}
            <div className="flex items-start gap-2.5 pt-3 md:pt-0 md:pl-4">
              <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                  CORPORATE OFFICE:
                </span>
                <p className="text-[11px] leading-relaxed text-navy-foreground/75 sm:text-xs">
                  D-321, Dawat Nagar, Abul Fazal Enclave, Jamia Nagar, New Delhi, Delhi 110025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Legal Copyright, Social Media & Back-to-Top Bar */}
      <div className="border-t border-navy-foreground/10 bg-navy/95">
        <div className="rifah-container flex flex-wrap items-center justify-between gap-4 py-4 text-xs text-navy-foreground/70">
          <p>© 2026 RIFAH Chamber of Commerce and Industry | All rights reserved</p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px] text-navy-foreground/75">
              <Star className="h-3.5 w-3.5 text-amber-400" /> TOGETHER FOR A SUSTAINABLE FUTURE
            </span>
            <span className="hidden lg:inline text-navy-foreground/30">•</span>
            {/* Social Media Handles at the Bottom */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-navy-foreground/15 bg-black/25 text-navy-foreground transition hover:border-primary/50 hover:bg-black/50 hover:scale-105"
                  title={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={handleScrollTop}
            className="inline-flex items-center gap-1.5 text-xs text-navy-foreground/75 hover:text-primary transition"
            type="button"
          >
            <span>Back to Top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Global Policy Dialog for Quick Links */}
      <PolicyDialog
        openKey={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </footer>
  );
}

export function PublicMobileTabs() {
  const path = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {mobileTabs.map((t) => {
          const active = path === t.to;
          return (
            <li key={t.label}>
              <Link
                href={t.to}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="truncate">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PublicLayout({ children, bare = false, className, mainClassName }) {
  const { user } = useAuth();
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <PublicHeader />
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      {!bare && <PublicFooter />}
      <RifahCopilotWidget role={user?.role || "business_owner"} user={user} />
    </div>
  );
}
