"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Building2,
  CalendarDays,
  FileStack,
  Home,
  Menu,
  Package,
  Search,
  Star,
  UserRound,
} from "lucide-react";


import { RifahLogo } from "@shared/components/rifah/brand";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cn } from "@shared/lib/utils";

const primaryNav = [
  { label: "Discover", to: "/discover" },
  { label: "Products & Services", to: "/catalogue" },
  { label: "Events", to: "/events" },
  { label: "Membership", to: "/membership" },
  { label: "About RIFAH", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const mobileTabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Discover", to: "/discover", icon: Search },
  { label: "Catalogue", to: "/catalogue", icon: Package },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Account", to: "/login", icon: UserRound },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="rifah-container flex h-14 items-center gap-3 md:h-[68px]">
        <RifahLogo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              href={item.to }
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/discover" aria-label="Search businesses">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="brand" className="hidden sm:inline-flex">
            <Link href="/register-business">Join RIFAH</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
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
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              href={item.to }
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2 border-t border-border pt-3">
            <Button asChild variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="brand">
              <Link href="/register-business">Join RIFAH</Link>
            </Button>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Prototype dashboards
            </p>
            <Link href="/me" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted">
              <Bookmark className="h-4 w-4 text-primary" /> Customer view
            </Link>
            <Link href="/biz" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted">
              <Building2 className="h-4 w-4 text-primary" /> Business view
            </Link>
            <Link href="/admin" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted">
              <FileStack className="h-4 w-4 text-primary" /> Admin view
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PublicFooter() {
  const cols = [
    {
      title: "Discover",
      links: [
        { label: "Business directory", to: "/discover" },
        { label: "Products & services", to: "/catalogue" },
        { label: "Events", to: "/events" },
      ],
    },
    {
      title: "Membership",
      links: [
        { label: "Plans", to: "/membership" },
        { label: "Register a business", to: "/register-business" },
        { label: "Member login", to: "/login" },
      ],
    },
    {
      title: "Chamber",
      links: [
        { label: "About RIFAH", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "Chapters & units", to: "/about" },
      ],
    },
  ];
  return (
    <footer className="mt-16 border-t border-border bg-navy text-navy-foreground">
      <div className="rifah-container grid gap-8 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:py-14">
        <div className="max-w-sm">
          <span className="inline-grid place-items-center rounded-lg bg-surface px-3 py-2">
            <RifahLogo showLabel={false} />
          </span>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/70">
            RIFAH Chamber of Commerce & Industry — RIFAH Connect is the chamber's digital business network for
            discovery, membership, enquiries and events. Prototype content shown for review.
          </p>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to }
                    className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="rifah-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-navy-foreground/60">
          <p>© 2026 RIFAH Chamber of Commerce & Industry. Prototype for stakeholder review.</p>
          <p className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> Together for a sustainable future
          </p>
        </div>
      </div>
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
                href={t.to }
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

export function PublicLayout({ children, bare = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      {!bare && <PublicFooter />}
      <PublicMobileTabs />
    </div>
  );
}
