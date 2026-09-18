"use client";
// App Shell Layout & Navigation (Updated)
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { resolveMediaUrl } from "@shared/lib/media";
import {
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronLeft,
  Compass,
  CreditCard,
  FileStack,
  Gauge,
  LayoutGrid,
  LogOut,
  Mail,
  MapPin,
  MapPinned,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Target,
  Ticket,
  UserRound,
  Users,
  MessageSquareText,
  RotateCcw,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Shield,
  Handshake,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { LogoMark, RifahLogo } from "@shared/components/rifah/brand";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { useNotifications, useConversations, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { BirthdayBanner } from "@shared/components/rifah/birthday-banner";

let globalSidebarScrollTop = typeof window !== "undefined"
  ? Number(sessionStorage.getItem("rifah_sidebar_scroll_top") || 0)
  : 0;

const navs = {
  business: {
    title: "Business workspace",
    primary: [
      { label: "Dashboard", to: "/biz", icon: Gauge },
      { label: "Feeds", to: "/biz/feeds", icon: Compass },
      { label: "Enquiries", to: "/biz/enquiries", icon: FileStack },
      { label: "My Enquiries", to: "/biz/my-enquiries", icon: Send },
      { label: "Networking", to: "/biz/networking", icon: Handshake },
      { label: "More", to: "/biz/profile", icon: LayoutGrid },
    ],
    more: [
      { label: "Messages", to: "/biz/messages", icon: MessageSquare },
      { label: "My Profile", to: "/biz/profile", icon: UserRound },
      { label: "Analytics", to: "/biz/analytics", icon: ChartNoAxesColumn },
      { label: "Membership", to: "/biz/membership", icon: Star },
      { label: "Notifications", to: "/biz/notifications", icon: Bell },
      { label: "LMS", to: "/biz/lms", icon: GraduationCap },
    ],
  },
  admin: {
    title: "RIFAH administration",
    primary: [
      { label: "Overview", to: "/admin", icon: Gauge },
      { label: "Businesses", to: "/admin/businesses", icon: Building2 },
      { label: "Enquiries", to: "/admin/enquiries", icon: FileStack },
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "More", to: "/admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/biz/feeds", icon: Compass },
      { label: "Verification", to: "/admin/verification", icon: ShieldCheck },
      { label: "Business Analytics", to: "/admin/networking-analytics", icon: TrendingUp },
      { label: "Memberships", to: "/admin/memberships", icon: Star },
      { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
      { label: "States", to: "/admin/states", icon: MapPin },
      { label: "Chapters", to: "/admin/chapters", icon: MapPinned },
      { label: "Units", to: "/admin/units", icon: Users },
      { label: "Events", to: "/admin/events", icon: Ticket },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Reports", to: "/admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/admin/audit", icon: ScrollText },
      { label: "Settings", to: "/admin/settings", icon: Settings },
      { label: "LMS", to: "/admin/lms", icon: GraduationCap },
    ],
  },
};

const roleNavs = {
  chapter_admin: {
    title: "Chapter admin",
    primary: [
      { label: "Dashboard", to: "/chapter-admin", icon: Gauge },
      { label: "Members", to: "/chapter-admin/members", icon: Users },
      { label: "Businesses", to: "/chapter-admin/businesses", icon: Building2 },
      { label: "Events", to: "/chapter-admin/events", icon: CalendarDays },
      { label: "More", to: "/chapter-admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/biz/feeds", icon: Compass },
      { label: "Verification", to: "/chapter-admin/verification", icon: ShieldCheck },
      { label: "Business Analytics", to: "/chapter-admin/networking-analytics", icon: TrendingUp },
      { label: "Enquiries", to: "/chapter-admin/enquiries", icon: FileStack },
      { label: "Announcements", to: "/chapter-admin/announcements", icon: Megaphone },
      { label: "Notifications", to: "/chapter-admin/notifications", icon: Bell },
      { label: "Users", to: "/chapter-admin/users", icon: Users },
      { label: "Reports", to: "/chapter-admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/chapter-admin/audit", icon: ScrollText },
      { label: "Settings", to: "/chapter-admin/settings", icon: Settings },
      { label: "LMS", to: "/chapter-admin/lms", icon: GraduationCap },
    ],
  },
  state_admin: {
    title: "State admin",
    primary: [
      { label: "Dashboard", to: "/state-admin", icon: Gauge },
      { label: "Chapters", to: "/state-admin/chapters", icon: MapPinned },
      { label: "Members", to: "/state-admin/members", icon: Users },
      { label: "Businesses", to: "/state-admin/businesses", icon: Building2 },
      { label: "More", to: "/state-admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/biz/feeds", icon: Compass },
      { label: "Business Analytics", to: "/state-admin/networking-analytics", icon: TrendingUp },
      { label: "Enquiries", to: "/state-admin/enquiries", icon: FileStack },
      { label: "Events", to: "/state-admin/events", icon: CalendarDays },
      { label: "Announcements", to: "/state-admin/announcements", icon: Megaphone },
      { label: "Reports", to: "/state-admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/state-admin/audit", icon: ScrollText },
      { label: "Settings", to: "/state-admin/settings", icon: Settings },
      { label: "LMS", to: "/state-admin/lms", icon: GraduationCap },
    ],
  },
  secretariat: {
    title: "Secretariat Desk",
    primary: [
      { label: "Overview", to: "/admin", icon: Gauge },
      { label: "Businesses", to: "/admin/businesses", icon: Building2 },
      { label: "Leads", to: "/admin/leads", icon: Target },
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "More", to: "/admin/settings", icon: LayoutGrid },
    ],
    more: navs.admin.more,
  },
};

const navRoles = [
  { role: "business", label: "Business", to: "/biz" },
  { role: "admin", label: "Admin", to: "/admin" },
];

function useResolvedNav(role) {
  const { user } = useAuth();
  if (user?.role && roleNavs[user.role]) {
    return roleNavs[user.role];
  }
  return navs[role] || navs.business || navs.admin;
}

function toRoleAwarePath(path, role, user) {
  if (role === "admin" && (user?.role === "chapter_admin" || user?.role === "state_admin")) {
    if (path.startsWith("/admin/notifications")) return `/${user.role.replace("_", "-")}/notifications`;
  }
  if (user?.role === "state_admin") {
    if (path === "/admin" || path === "/chapter-admin") return "/state-admin";
    if (path === "/admin/chapters" || path === "/chapter-admin/chapter") return "/state-admin/chapters";
    if (path === "/admin/leads" || path === "/chapter-admin/leads") return "/state-admin/enquiries";
    if (path.startsWith("/admin/")) return path.replace(/^\/admin/, "/state-admin");
    return path;
  }
  if (role === "admin" && user?.role === "chapter_admin" && path.startsWith("/admin")) {
    return path.replace(/^\/admin/, "/chapter-admin");
  }
  return path;
}

function isAccessibleUnverifiedPath(pathname) {
  if (!pathname) return true;
  const clean = pathname.split("?")[0];
  return (
    clean === "/biz/feeds" ||
    clean.startsWith("/biz/feeds/") ||
    clean === "/feeds" ||
    clean.startsWith("/feeds/") ||
    clean === "/biz/verification" ||
    clean.startsWith("/biz/verification/") ||
    clean === "/biz/membership" ||
    clean.startsWith("/biz/membership/") ||
    clean === "/biz/payments" ||
    clean.startsWith("/biz/payments/") ||
    clean === "/biz/notifications" ||
    clean.startsWith("/biz/notifications/") ||
    clean === "/biz/profile" ||
    clean.startsWith("/biz/profile/") ||
    clean === "/biz/business" ||
    clean.startsWith("/biz/business/")
  );
}

function useCurrentPath() {
  return usePathname();
}

function SidebarLink({ item, active, badge, isLocked, onSelect }) {
  const linkRef = useRef(null);

  useEffect(() => {
    if (active && linkRef.current) {
      linkRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [active]);

  return (
    <Link
      ref={linkRef}
      href={item.to}
      scroll={false}
      data-active={active ? "true" : "false"}
      onClick={onSelect}
      data-sidebar-active={active ? "true" : undefined}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
        isLocked && "opacity-75"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">{item.label}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isLocked && <Lock className="h-3 w-3 text-sidebar-foreground/50" />}
        {Boolean(badge && badge > 0) && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-xs">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function UserSidebarAvatar({ user }) {
  const [imgError, setImgError] = useState(false);
  const rawAvatar = user?.avatar || user?.picture || user?.image;
  const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : "";

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "Profile"}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover border border-sidebar-border bg-muted shadow-xs"
      />
    );
  }

  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {user?.name?.charAt(0)?.toUpperCase() || "U"}
    </span>
  );
}

export function AppShell({
  role,
  title,
  subtitle,
  actions,
  children,
  backTo,
}) {
  const path = useCurrentPath();
  const router = useRouter();
  const { user, logout, switchRole, loading } = useAuth();
  const nav = useResolvedNav(role) || navs.admin || navs.customer;
  const primary = nav?.primary || [];
  const more = nav?.more || [];
  const all = [...primary.filter((i) => i.label !== "More"), ...more];

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  }, [user, loading, path, router]);

  const { data: notifData } = useNotifications();
  const unreadNotifs = notifData?.unreadCount ?? 0;

  const { data: convData } = useConversations();
  const unreadMsgs = (convData || []).reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const { data: businessData, isLoading: isBizLoading } = useMyBusiness();
  const rawVerification = businessData?.verification || businessData?.verificationStatus;
  const isBizVerified = (rawVerification || "").toLowerCase() === "verified";
  const hasEverBeenVerified = businessData?.isVerified === true || isBizVerified;

  const isGatedPage =
    role === "business" &&
    !isBizLoading &&
    Boolean(businessData) &&
    !hasEverBeenVerified &&
    !isAccessibleUnverifiedPath(path);

  let finalTitle = title;
  let finalSubtitle = subtitle;

  if (role === "admin" && user?.role === "chapter_admin") {
    if (title === "Central administration" || title === "Chapters and units" || title === "Overview") {
      finalTitle = `${user.chapter || "Regional"} Workspace`;
    }
    if (subtitle === "RIFAH Central Admin · all chapters" || subtitle === "RIFAH Secretariat · all chapters" || subtitle === "Regional structure and branch desks of RIFAH Chamber") {
      finalSubtitle = "Regional branch dashboard";
    }
  }

  const navRef = useRef(null);

  const handleNavScroll = (e) => {
    if (e?.currentTarget) {
      const top = e.currentTarget.scrollTop;
      globalSidebarScrollTop = top;
      try {
        sessionStorage.setItem(`rifah-sidebar-scroll-${role}`, String(top));
        sessionStorage.setItem("rifah_sidebar_scroll_top", String(top));
      } catch {}
    }
  };

  const recordScroll = () => {
    if (navRef.current) {
      const top = navRef.current.scrollTop;
      globalSidebarScrollTop = top;
      try {
        sessionStorage.setItem(`rifah-sidebar-scroll-${role}`, String(top));
        sessionStorage.setItem("rifah_sidebar_scroll_top", String(top));
      } catch {}
    }
  };

  const setNavRef = (node) => {
    navRef.current = node;
    if (node) {
      const saved = sessionStorage.getItem(`rifah-sidebar-scroll-${role}`) || sessionStorage.getItem("rifah_sidebar_scroll_top");
      if (saved !== null && Number(saved) > 0) {
        node.scrollTop = Number(saved);
      } else if (globalSidebarScrollTop > 0) {
        node.scrollTop = globalSidebarScrollTop;
      } else {
        const activeLink = node.querySelector('[data-sidebar-active="true"]') || node.querySelector('[data-active="true"]');
        if (activeLink) {
          activeLink.scrollIntoView({ block: "nearest", behavior: "instant" });
          globalSidebarScrollTop = node.scrollTop;
        }
      }
    }
  };

  useEffect(() => {
    if (navRef.current) {
      const saved = sessionStorage.getItem(`rifah-sidebar-scroll-${role}`) || sessionStorage.getItem("rifah_sidebar_scroll_top");
      if (saved !== null && Number(saved) > 0) {
        navRef.current.scrollTop = Number(saved);
      } else if (globalSidebarScrollTop > 0) {
        navRef.current.scrollTop = globalSidebarScrollTop;
      } else {
        const activeLink = navRef.current.querySelector('[data-sidebar-active="true"]') || navRef.current.querySelector('[data-active="true"]');
        if (activeLink) {
          activeLink.scrollIntoView({ block: "nearest", behavior: "instant" });
        }
      }
    }
  }, [path, role]);

  const isActive = (to) => {
    if (path === to) return true;
    const rootRoutes = ["/biz", "/admin", "/chapter-admin", "/state-admin", "/me", "/discover"];
    if (rootRoutes.includes(to)) return false;
    return to !== "/" && path.startsWith(to + "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Link href="/" scroll={false} className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
              <LogoMark className="h-5" />
            </span>
            <span className="text-sm font-semibold text-sidebar-accent-foreground">RIFAH Connect</span>
          </Link>
        </div>
        <div className="px-4 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            {nav.title}
          </p>
        </div>
        <nav
          ref={setNavRef}
          onScroll={handleNavScroll}
          className="mt-2 flex-1 space-y-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3 pb-4"
        >
          {all.map((item) => {
            let badge = null;
            if (item.label === "Messages") badge = unreadMsgs;
            if (item.label === "Notifications") badge = unreadNotifs;
            const isItemLocked = role === "business" && !isBizLoading && Boolean(businessData) && !hasEverBeenVerified && !isAccessibleUnverifiedPath(item.to);
            return (
              <SidebarLink
                key={item.to + item.label}
                item={item}
                active={isActive(item.to)}
                badge={badge}
                isLocked={isItemLocked}
                onSelect={recordScroll}
              />
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {user && (
            <Link
              href={
                role === "business"
                  ? "/biz/profile"
                  : user?.role === "state_admin"
                  ? "/state-admin/settings"
                  : user?.role === "chapter_admin"
                  ? "/chapter-admin/settings"
                  : "/admin/settings"
              }
              scroll={false}
              onClick={recordScroll}
              className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
              title="View profile"
            >
              <UserSidebarAvatar user={user} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-sidebar-foreground group-hover:text-primary transition-colors">{user.name}</span>
                <span className="block truncate text-[10px] text-sidebar-foreground/50">{user.email}</span>
              </span>
            </Link>
          )}
          {user?.previousRole && (
            <button
              onClick={async () => {
                await switchRole(user.previousRole);
                if (user.previousRole === "chapter_admin") router.push("/chapter-admin");
                else if (user.previousRole === "business_owner") router.push("/biz");
                else router.push("/biz");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-primary/10 hover:text-primary mb-1"
            >
              <RotateCcw className="h-[18px] w-[18px] shrink-0" />
              <span>Switch to {user.previousRole === "chapter_admin" ? "Admin" : "User"} View</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 md:h-16 md:px-6">
            {backTo ? (
              <Button asChild variant="ghost" size="icon" className="shrink-0 lg:hidden">
                <Link href={backTo} aria-label="Go back">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <div className="lg:hidden">
                <MoreSheet role={role} isBizVerified={isBizVerified} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm sm:text-base font-semibold md:text-lg">{finalTitle}</h1>
              {finalSubtitle && <p className="truncate text-[11px] sm:text-xs text-muted-foreground md:text-sm">{finalSubtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
                <Link href={"/discover"} aria-label="Search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link
                  href={toRoleAwarePath(role === "admin" ? "/admin/notifications" : "/biz/notifications", role, user)}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link
                  href={toRoleAwarePath(isBizVerified ? "/biz/messages" : "/biz/verification", role, user)}
                  aria-label="Messages"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadMsgs > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
                    </span>
                  )}
                </Link>
              </Button>
              {actions}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive" title="Logout">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 pb-24 pt-3 sm:px-4 sm:pb-24 sm:pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-10">
          <div className="mx-auto w-full max-w-[1440px]">
            <BirthdayBanner />
            {isGatedPage ? (
              <UnderApprovalAccessGate business={businessData} path={path} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav role={role} isBizVerified={isBizVerified} />
    </div>
  );
}

function UnderApprovalAccessGate({ business, path }) {
  const vStatus = (business?.verification || business?.verificationStatus || "under_review").toLowerCase();
  const isChangesReq = vStatus === "changes_required" || vStatus === "correction" || vStatus === "correction_requested";
  const isRejected = vStatus === "rejected";
  const isUnderReview = !isChangesReq && !isRejected;

  const accessibleModules = [
    {
      title: "Verification & Document Upload",
      description: "Upload and replace official business documents (GST, PAN, Trade License) and track review status.",
      to: "/biz/verification",
      icon: ShieldCheck,
      badge: isChangesReq ? "Action Required" : "Accessible",
      actionText: "Open Verification Desk →",
    },
    {
      title: "Business Profile & Details",
      description: "Review and update your enterprise profile, address, business type, founded year, and contact details.",
      to: "/biz/profile",
      icon: Building2,
      badge: "Accessible",
      actionText: "Edit Business Profile →",
    },
    {
      title: "Membership & Payments",
      description: "Check your subscription plan tier, payment invoice receipt, and tier privileges.",
      to: "/biz/membership",
      icon: Star,
      badge: business?.membership ? `${business.membership} Tier` : "Accessible",
      actionText: "Manage Membership →",
    },
    {
      title: "Central Admin Notifications",
      description: "Receive real-time notifications, status updates, and Central Admin review announcements.",
      to: "/biz/notifications",
      icon: Bell,
      badge: "Accessible",
      actionText: "View Notifications →",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
      {/* Primary Alert Banner */}
      <div
        className={cn(
          "rounded-3xl border p-6 sm:p-8 shadow-xs relative overflow-hidden",
          isChangesReq && "border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100",
          isRejected && "border-rose-300 bg-rose-50/90 dark:border-rose-800 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100",
          isUnderReview && "border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <div
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-xs",
              isChangesReq && "bg-blue-600 text-white",
              isRejected && "bg-rose-600 text-white",
              isUnderReview && "bg-amber-500 text-white"
            )}
          >
            {isChangesReq ? <RotateCcw className="h-7 w-7" /> : isRejected ? <XCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isChangesReq && "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
                  isRejected && "bg-rose-600 text-white dark:bg-rose-600 dark:text-white",
                  isUnderReview && "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                )}
              >
                {isChangesReq ? "CHANGES REQUESTED" : isRejected ? "VERIFICATION REJECTED" : "UNDER CENTRAL ADMIN APPROVAL"}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-foreground/80">{business?.name || "Business Enterprise"}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {isChangesReq
                ? "Action Required: Central Admin Requested Changes"
                : isRejected
                ? "Verification Application Rejected"
                : "Workspace Access Restricted — Under Central Admin Approval"}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isChangesReq
                ? "The RIFAH Chamber Central Admin has reviewed your business application and requested specific changes or additional paperwork before granting verification approval."
                : isRejected
                ? "Your verification application has been rejected by the Central Admin. Please review the feedback reason below and update your documents to re-submit."
                : "Your business profile is currently in the RIFAH Central Admin Verification queue. Workspace features like Buyer Leads, Direct Enquiries, Catalogue Publishing, Analytics, and Messaging will be activated as soon as your business documents are verified."}
            </p>

            {business?.verificationReviewReason && (
              <div className="mt-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 p-4 border border-border/80 text-xs">
                <span className="block font-bold text-foreground text-[11px] uppercase tracking-wider mb-1 text-primary">
                  Central Admin Review Notes:
                </span>
                <p className="text-foreground/90 font-medium leading-relaxed">
                  {business.verificationReviewReason}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs gap-2">
                <Link href="/biz/verification">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Go to Verification & Documents</span>
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="font-semibold gap-2">
                <Link href="/biz/profile">
                  <Building2 className="h-4 w-4" />
                  <span>Edit Business Profile</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Pages Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-foreground">
            Accessible Pages During Approval Stage
          </h3>
          <span className="text-xs text-muted-foreground font-medium">4 Pages Accessible</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {accessibleModules.map((m) => (
            <Link
              key={m.to}
              href={m.to}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {m.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {m.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {m.description}
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {m.actionText}
              </span>
            </Link>
          ))}
        </div>
      </div>
      {/* Locked Workspace Modules Notice */}
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground flex items-center gap-3">
        <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
        <p className="leading-relaxed">
          <strong>Locked Modules:</strong> Buyer Leads, Open Enquiries, Catalogue Items, Analytics Reports, and Direct Messaging are locked while under review to maintain Chamber buyer safety standards. They will unlock automatically upon Central Admin verification.
        </p>
      </div>
    </div>
  );
}

export function MoreSheet({ role, isBizVerified = true }) {
  const [open, setOpen] = useState(false);
  const nav = useResolvedNav(role);
  const items = nav.more;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LogoMark className="h-4" />
            </span>
            <span className="font-bold">RIFAH</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {nav.title}
          </p>
          {items.map((i) => {
            const isLocked = role === "business" && !isBizVerified && !isAccessibleUnverifiedPath(i.to);
            return (
              <Link
                key={i.to + i.label}
                href={i.to}
                scroll={false}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted",
                  isLocked && "opacity-75"
                )}
              >
                <div className="flex items-center gap-3">
                  <i.icon className="h-[18px] w-[18px] text-primary" />
                  <span>{i.label}</span>
                </div>
                {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border pt-3">
            <Link href="/" scroll={false} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted">
              Public website
            </Link>
            <MobileLogoutButton />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function BottomNav({ role, isBizVerified = true }) {
  const path = useCurrentPath();
  const nav = useResolvedNav(role);
  const primary = nav.primary;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {primary.map((item) => {
          const active = path === item.to;
          const isLocked = role === "business" && !isBizVerified && !isAccessibleUnverifiedPath(item.to);
          return (
            <li key={item.label}>
              <Link
                href={item.to}
                scroll={false}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground relative",
                  active && "text-primary",
                  isLocked && "opacity-70"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                  {isLocked && (
                    <Lock className="h-2.5 w-2.5 absolute -top-1 -right-1 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileLogoutButton() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <>
      {user && (
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{user.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{user.email}</span>
          </span>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Logout
      </button>
    </>
  );
}
