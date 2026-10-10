"use client";
// App Shell Layout & Navigation (Updated)
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect, useRef, useMemo } from "react";
import {BirthdayBanner} from "@shared/components/rifah/birthday-banner";
import {TopPerformerSpotlight} from "@shared/components/rifah/top-performer-spotlight";
import { resolveMediaUrl } from "@shared/lib/media";
import {
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronLeft,
  Compass,
  CreditCard,
  FileStack,
  Gauge,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  MapPinned,
  Megaphone,
  Menu,
  MessageSquare,
  Wallet,
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
  AlertTriangle,
  XCircle,
  ArrowRight,
  Shield,
  Handshake,
  GraduationCap,
  TrendingUp,
  Zap,
  Radio,
  Mic,
  Link2,
  CalendarPlus,
  Award,
  Bot,
} from "lucide-react";
import { LogoMark, RifahLogo } from "@shared/components/rifah/brand";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { useNotifications, useConversations, useMyBusiness, useMyMembership } from "@shared/hooks/use-rifah-api";
import { useFeatureAccess } from "@shared/hooks/use-feature-access";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@shared/lib/socket";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { RifahCopilotWidget } from "@shared/components/rifah/rifah-copilot-widget";
import { UserAvatar } from "@shared/components/rifah/ui-bits";
import { isBusinessAccount } from "@shared/lib/workspace";

let globalSidebarScrollTop = typeof window !== "undefined"
  ? Number(sessionStorage.getItem("rifah_sidebar_scroll_top") || 0)
  : 0;

const navs = {
  user: {
    title: "Member Portal",
    primary: [
      { label: "Dashboard", to: "/user", icon: Gauge },
      { label: "Catalogue", to: "/user/catalogue", icon: Package },
      { label: "Feeds", to: "/user/feeds", icon: Compass },
      { label: "Enquiries", to: "/user/enquiries", icon: FileStack },
      { label: "My Asks", to: "/user/my-enquiries", icon: Send },
      { label: "More", to: "/user/profile", icon: LayoutGrid },
    ],
    more: [
      { label: "Networking", to: "/user/networking", icon: Handshake },
      { label: "Power Networking", to: "/user/power-networking", icon: Zap },
      { label: "Messages", to: "/user/messages", icon: MessageSquare },
      { label: "Events", to: "/user/events", icon: CalendarDays },
      { label: "LMS", to: "/user/lms", icon: GraduationCap },
      { label: "Membership Tiers", to: "/user/membership", icon: Star },
      { label: "My Profile", to: "/user/profile", icon: UserRound },
      { label: "Notifications", to: "/user/notifications", icon: Bell },
    ],
  },
  business: {
    title: "Business workspace",
    primary: [
      { label: "Dashboard", to: "/biz", icon: Gauge },
      { label: "Operations", to: "/biz/operations", icon: Radio },
      { label: "Feeds", to: "/biz/feeds", icon: Compass },
      { label: "Enquiries", to: "/biz/enquiries", icon: FileStack },
      { label: "My Ask", to: "/biz/my-enquiries", icon: Send },
      { label: "More", to: "/biz/profile", icon: LayoutGrid },
    ],
    more: [
      { label: "Networking", to: "/biz/networking", icon: Handshake },
      { label: "Power Networking", to: "/biz/power-networking", icon: Zap },
      { label: "Messages", to: "/biz/messages", icon: MessageSquare },
      { label: "Advertisements", to: "/biz/advertisements", icon: Megaphone },
      { label: "Events", to: "/biz/events", icon: CalendarDays },
      { label: "Analytics", to: "/biz/analytics", icon: ChartNoAxesColumn },
      { label: "My Profile", to: "/biz/profile", icon: UserRound },
      { label: "Support", to: "/biz/tickets", icon: LifeBuoy },
      { label: "Membership", to: "/biz/membership", icon: Star },
      { label: "Notifications", to: "/biz/notifications", icon: Bell },
      { label: "LMS", to: "/biz/lms", icon: GraduationCap },
    ],
  },
  admin: {
    title: "RIFAH Central Administration",
    primary: [
      { label: "Dashboard", to: "/admin", icon: Gauge },
      { label: "Event Operations", to: "/admin/operations", icon: Radio },
      { label: "Businesses", to: "/admin/businesses", icon: Building2 },
      { label: "Enquiries", to: "/admin/enquiries", icon: FileStack },
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "More", to: "/admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/admin/feeds", icon: Compass },
      { label: "Business Analytics", to: "/admin/networking-analytics", icon: TrendingUp },
      { label: "Memberships", to: "/admin/memberships", icon: Star },
      { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
      { label: "Central Admin", to: "/admin/central-admin", icon: Shield },
      { label: "Support", to: "/admin/tickets", icon: LifeBuoy },
      { label: "States", to: "/admin/states", icon: MapPin },
      { label: "Chapters", to: "/admin/chapters", icon: MapPinned },
      { label: "Events", to: "/admin/events", icon: Ticket },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Revenue Sharing", to: "/admin/revenue-sharing", icon: Wallet },

      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Reports", to: "/admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/admin/audit", icon: ScrollText },
      { label: "Roles & RBAC", to: "/admin/roles", icon: Award },
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
      { label: "Event Operations", to: "/chapter-admin/operations", icon: Radio },
      { label: "Members", to: "/chapter-admin/members", icon: Users },
      { label: "Businesses", to: "/chapter-admin/businesses", icon: Building2 },
      { label: "Verification", to: "/chapter-admin/verification", icon: ShieldCheck },
      { label: "Advertisements", to: "/chapter-admin/advertisements", icon: Megaphone },
      { label: "Events", to: "/chapter-admin/events", icon: CalendarDays },
      { label: "Support", to: "/chapter-admin/tickets", icon: LifeBuoy },
      { label: "Queries", to: "/chapter-admin/queries", icon: MessageSquareText },
      { label: "More", to: "/chapter-admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/chapter-admin/feeds", icon: Compass },
      { label: "Business Analytics", to: "/chapter-admin/networking-analytics", icon: TrendingUp },
      { label: "Enquiries", to: "/chapter-admin/enquiries", icon: FileStack },
      { label: "Roles & RBAC", to: "/chapter-admin/roles", icon: Award },
      { label: "Live Event Control", to: "/chapter-admin/live-control", icon: Sparkles },
      { label: "Notifications", to: "/chapter-admin/notifications", icon: Bell },
      { label: "Reports", to: "/chapter-admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/chapter-admin/audit", icon: ScrollText },
      { label: "Settings", to: "/chapter-admin/settings", icon: Settings },
      { label: "LMS", to: "/chapter-admin/lms", icon: GraduationCap },
      { label: "Revenue Sharing", to: "/chapter-admin/revenue-sharing", icon: Wallet },
    ],
  },
  state_admin: {
    title: "State admin",
    primary: [
      { label: "Dashboard", to: "/state-admin", icon: Gauge },
      { label: "Event Operations", to: "/state-admin/operations", icon: Radio },
      { label: "Chapters", to: "/state-admin/chapters", icon: MapPinned },
      { label: "Members", to: "/state-admin/members", icon: Users },
      { label: "Businesses", to: "/state-admin/businesses", icon: Building2 },
      { label: "Support", to: "/state-admin/tickets", icon: LifeBuoy },
      { label: "Advertisements", to: "/state-admin/advertisements", icon: Megaphone },
      { label: "More", to: "/state-admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Feeds", to: "/state-admin/feeds", icon: Compass },
      { label: "Business Analytics", to: "/state-admin/networking-analytics", icon: TrendingUp },
      { label: "Enquiries", to: "/state-admin/enquiries", icon: FileStack },
      { label: "Events", to: "/state-admin/events", icon: CalendarDays },
      { label: "Roles & RBAC", to: "/state-admin/roles", icon: Award },
      { label: "Notifications", to: "/state-admin/notifications", icon: Bell },
      { label: "Reports", to: "/state-admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/state-admin/audit", icon: ScrollText },
      { label: "Settings", to: "/state-admin/settings", icon: Settings },
      { label: "LMS", to: "/state-admin/lms", icon: GraduationCap },
      { label: "Revenue Sharing", to: "/state-admin/revenue-sharing", icon: Wallet },
    ],
  },
  central_admin: null,
  business: null,
  business_owner: null,
};

roleNavs.central_admin = navs.admin;
roleNavs.business = navs.business;
roleNavs.business_owner = navs.business;
roleNavs.customer = navs.user;
roleNavs.buyer = navs.user;
roleNavs.user = navs.user;

navs.business_owner = navs.business;
navs.customer = navs.user;
navs.buyer = navs.user;
navs.user = navs.user;
navs.central_admin = navs.admin;

const navRoles = [
  { role: "user", label: "Member Portal", to: "/user" },
  { role: "business", label: "Business", to: "/biz" },
  { role: "admin", label: "Central Admin", to: "/admin" },
];

function useResolvedNav(role) {
  const { user } = useAuth();
  const pathname = usePathname();

  const getBaseNav = () => {
    // If active in org_role workspace, route to corresponding panel nav
    if (user?.activeWorkspace?.type === "org_role") {
      const panel = user.activeWorkspace.panelType;
      if (panel === "chapter-admin") return roleNavs.chapter_admin;
      if (panel === "state-admin") return roleNavs.state_admin;
      if (panel === "central-admin") return navs.admin;
    }

    // 1. Explicit path prefix matching (each workspace strictly owns its URL tree)
    if (pathname?.startsWith("/chapter-admin")) {
      return roleNavs.chapter_admin;
    }
    if (pathname?.startsWith("/state-admin")) {
      return roleNavs.state_admin;
    }
    if (pathname?.startsWith("/admin")) {
      return navs.admin;
    }
    if (pathname?.startsWith("/user")) {
      return navs.user;
    }
    if (pathname?.startsWith("/customer")) {
      return navs.customer;
    }
    if (pathname?.startsWith("/biz")) {
      return navs.business;
    }

    // 2. Explicit role prop passed directly to AppShell
    if (role === "chapter_admin" || role === "chapter") {
      return roleNavs.chapter_admin;
    }
    if (role === "state_admin" || role === "state") {
      return roleNavs.state_admin;
    }
    if (role === "admin" || role === "central_admin") {
      return navs.admin;
    }
    if (role === "user") {
      return navs.user;
    }
    if (role === "customer" || role === "buyer") {
      return navs.customer;
    }
    if (role === "business" || role === "business_owner") {
      return navs.business;
    }

    // 3. Authenticated user's persistent role / accountType
    const userRole = user?.role;
    const accountType = user?.accountType;
    if (["central_admin", "super_admin", "admin", "secretariat"].includes(userRole)) {
      return navs.admin;
    }
    if (userRole === "state_admin") {
      return roleNavs.state_admin;
    }
    if (userRole === "chapter_admin") {
      return roleNavs.chapter_admin;
    }
    if (userRole === "business_owner" || userRole === "business" || accountType === "business" || (accountType !== "user" && Boolean(user?.businessId || user?.businessSlug))) {
      return navs.business;
    }
    if (accountType === "user" || Boolean(user?.subscriberTier)) {
      return navs.user;
    }
    if (userRole === "customer" || userRole === "buyer" || accountType === "customer") {
      return navs.customer;
    }

    return navs.business;
  };

  const baseNav = getBaseNav();

  // 4. Dynamic Sidebar Filtering for org-role members
  if (user?.activeWorkspace?.type === "org_role") {
    const allowedList = user.activeWorkspace.allowedNavRoutes || [];
    const panelDefault =
      user.activeWorkspace.panelType === "chapter-admin"
        ? "/chapter-admin"
        : user.activeWorkspace.panelType === "state-admin"
        ? "/state-admin"
        : "/admin";

    // If allowedNavRoutes is empty, strictly default to the panel's root overview
    const allowedRoutes = allowedList.length > 0 ? allowedList : [panelDefault];
    const allowed = new Set(allowedRoutes.map((r) => (r || "").replace(/\/$/, "")));

    const isItemAllowed = (item) => {
      if (!item?.to) return false;
      const cleanTo = item.to.replace(/\/$/, "");
      return allowed.has(cleanTo);
    };

    const filteredMore = (baseNav.more || []).filter((item) => isItemAllowed(item));
    const filteredPrimary = (baseNav.primary || []).filter((item) => {
      if (!item?.to) return false;
      if (item.label === "More") {
        return filteredMore.length > 0;
      }
      return isItemAllowed(item);
    });

    let finalPrimary = [...filteredPrimary];
    const regularPrimary = finalPrimary.filter((i) => i.label !== "More");
    if (regularPrimary.length === 0 && filteredMore.length > 0) {
      finalPrimary = filteredMore.slice(0, 4);
    }

    return {
      title: user.activeWorkspace.roleName || baseNav.title,
      primary: finalPrimary,
      more: filteredMore,
    };
  }

  return baseNav;
}

function toRoleAwarePath(path, role, user) {
  // If the user is currently within an Admin shell (Central, State, or Chapter), preserve their admin routes!
  if (
    role === "admin" ||
    role === "state" ||
    role === "chapter" ||
    role === "state_admin" ||
    role === "chapter_admin" ||
    role === "central_admin"
  ) {
    return path;
  }

  // Member (subscriber/customer) workspace: shared header links (bell, profile, messages) are
  // authored as /biz/*; keep them inside /user so a member is never dropped into the business panel.
  if (role === "user" || role === "customer" || role === "buyer") {
    return path.replace(/^\/biz(?=\/|$)/, "/user");
  }

  // If in business shell, deterministically keep business paths across SSR & client
  if (role === "business" || role === "business_owner") {
    if (path.startsWith("/admin/notifications")) return "/biz/notifications";
    if (path.startsWith("/admin/messages")) return "/biz/messages";
    if (path.startsWith("/admin/")) return path.replace(/^\/admin/, "/biz");
    return path;
  }

  const effectiveRole = user?.role || role;
  if (effectiveRole === "business_owner" || effectiveRole === "business") {
    if (path.startsWith("/admin/notifications")) return "/biz/notifications";
    if (path.startsWith("/admin/messages")) return "/biz/messages";
    if (path.startsWith("/admin/")) return path.replace(/^\/admin/, "/biz");
    return path;
  }
  if (effectiveRole === "chapter_admin") {
    if (path.startsWith("/admin/notifications")) return "/chapter-admin/notifications";
    if (path.startsWith("/admin/")) return path.replace(/^\/admin/, "/chapter-admin");
    return path;
  }
  if (effectiveRole === "state_admin") {
    if (path.startsWith("/admin/notifications")) return "/state-admin/notifications";
    if (path === "/admin" || path === "/chapter-admin") return "/state-admin";
    if (path === "/admin/chapters" || path === "/chapter-admin/chapter") return "/state-admin/chapters";
    if (path === "/admin/leads" || path === "/chapter-admin/leads") return "/state-admin/enquiries";
    if (path.startsWith("/admin/")) return path.replace(/^\/admin/, "/state-admin");
    return path;
  }
  if (effectiveRole === "customer" || effectiveRole === "buyer") {
    return path.replace(/^\/biz(?=\/|$)/, "/user");
  }
  return path;
}

function isAccessibleUnverifiedPath(pathname) {
  if (!pathname) return true;
  const clean = pathname.split("?")[0].replace(/\/$/, "");
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
    clean.startsWith("/biz/business/") ||
    clean === "/biz/lms" ||
    clean.startsWith("/biz/lms/") ||
    clean === "/biz/events" ||
    clean.startsWith("/biz/events/") ||
    clean === "/biz/operations" ||
    clean.startsWith("/biz/operations/") ||
    clean === "/biz/messages" ||
    clean.startsWith("/biz/messages/") ||
    clean === "/biz/my-duty" ||
    clean.startsWith("/biz/my-duty/")
  );
}


function useCurrentPath() {
  return usePathname();
}

// BUG-021: nav links here used to pass `scroll={false}` to Next's <Link>,
// which stops it resetting the window scroll on navigation. That was meant to
// preserve the *sidebar's own* scroll position, but the sidebar already
// restores its scroll independently via sessionStorage (see setNavRef /
// globalSidebarScrollTop below), so `scroll={false}` only had the side effect
// of leaving the *page* wherever it was scrolled on the previous route —
// e.g. landing on Verification already scrolled past its own heading after a
// redirect from a page the user had scrolled down on. Links below rely on
// the default scroll-to-top behavior now.
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
      data-active={active ? "true" : "false"}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
          toast.error(`${item.label} is locked. Upgrade your plan to unlock this module.`);
          return;
        }
        onSelect?.(e);
      }}
      data-sidebar-active={active ? "true" : undefined}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-xs hover:bg-cyan-500/20 hover:text-cyan-300",
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

function SidebarCategoryGroup({
  group,
  isActive,
  unreadMsgs,
  unreadNotifs,
  isBizLoading,
  businessData,
  hasEverBeenVerified,
  isAdminSwitchedToBusiness,
  role,
  onSelect,
}) {
  if (group.isStandalone && group.item) {
    const item = group.item;
    let badge = null;
    if (item.label === "Messages") badge = unreadMsgs;
    if (item.label === "Notifications") badge = unreadNotifs;
    const isItemLocked =
      role === "business" &&
      !isBizLoading &&
      Boolean(businessData) &&
      !hasEverBeenVerified &&
      !isAccessibleUnverifiedPath(item.to) &&
      !isAdminSwitchedToBusiness;

    return (
      <div className="py-1">
        <SidebarLink
          item={item}
          active={isActive(item.to)}
          badge={badge}
          isLocked={isItemLocked}
          onSelect={onSelect}
        />
      </div>
    );
  }

  const items = group.items || [];
  const hasActiveChild = items.some((item) => isActive(item.to));
  // Keep closed by default unless the active route belongs to this category
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/75 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/50 transition-colors group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="truncate">{group.category}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-sidebar-foreground/60 transition-transform duration-200 shrink-0",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-1 space-y-0.5 pl-1.5">
          {items.map((item, index) => {
            let badge = null;
            if (item.label === "Messages") badge = unreadMsgs;
            if (item.label === "Notifications") badge = unreadNotifs;
            const isItemLocked =
              role === "business" &&
              !isBizLoading &&
              Boolean(businessData) &&
              !hasEverBeenVerified &&
              !isAccessibleUnverifiedPath(item.to) &&
              !isAdminSwitchedToBusiness;

            return (
              <SidebarLink
                key={`sidebar-${group.category}-${item.to}-${item.label}-${index}`}
                item={item}
                active={isActive(item.to)}
                badge={badge}
                isLocked={isItemLocked}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}
    </div>
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
  const [mounted, setMounted] = useState(false);
  const effectiveUser = mounted ? user : null;
  const nav = useResolvedNav(role) || navs.admin || navs.business;

  const isDashboardPage = useMemo(() => {
    if (!path) return false;
    const cleanPath = path.split("?")[0].replace(/\/$/, "");
    return [
      "/biz",
      "/user",
      "/admin",
      "/state-admin",
      "/chapter-admin",
      "/biz/networking",
      "/user/networking",
      "/admin/networking-analytics",
      "/state-admin/networking-analytics",
      "/chapter-admin/networking-analytics",
    ].includes(cleanPath);
  }, [path]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    if (!loading && user) {
      // Members (customers / subscriber "user" accounts) never belong in the business panel: any
      // /biz/* link rendered by a shared component is bounced to its /user/* twin, query intact.
      // Admin accounts must never be treated as member users.
      const isAdminRole = ["central_admin", "super_admin", "admin", "secretariat", "state_admin", "chapter_admin"].includes(user.role);
      const isMemberUser =
        !isAdminRole &&
        (user.role === "customer" || user.role === "buyer" ||
        (user.accountType === "user" && !isBusinessAccount(user)));
      if (isMemberUser && (path === "/biz" || path?.startsWith("/biz/"))) {
        const target = path.replace(/^\/biz/, "/user") + (typeof window !== "undefined" ? window.location.search : "");
        router.replace(target || "/user");
      }
    }
  }, [user, loading, path, router]);

  const queryClient = useQueryClient();

  // Real-time WebSockets synchronization for notifications and conversations
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join_room", user._id);

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const handleMessageUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("receive_message", handleMessageUpdate);
    socket.on("update_conversations", handleMessageUpdate);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("receive_message", handleMessageUpdate);
      socket.off("update_conversations", handleMessageUpdate);
    };
  }, [user?._id, queryClient]);

  const { data: notifData } = useNotifications();
  const unreadNotifs = notifData?.unreadCount ?? 0;

  const { data: convData } = useConversations();
  const unreadMsgs = (convData || []).reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // BUG-FIX: Only fetch and use business data for business-workspace roles.
  // Admin roles (chapter_admin, state_admin, central_admin) should NEVER be
  // subject to the business verification gate. Previously, useMyBusiness() ran
  // for every role — if an admin also had a business account, the returned data
  // (or the response-wrapper fallback from the || res bug) would make
  // Boolean(businessData)=true and hasEverBeenVerified=false, which after a
  // background refetch would lock their sidebar items.
  const isBusinessRole =
    (role === "business" || user?.role === "business_owner" || user?.role === "business") &&
    role !== "customer" &&
    role !== "buyer" &&
    user?.role !== "customer" &&
    user?.role !== "buyer";

  const { data: rawBusinessData, isLoading: isBizLoading } = useMyBusiness();
  const { isRouteLocked, isExpired: isSubscriptionExpired, planName: currentPlanName } = useFeatureAccess();

  // Only treat the data as valid when the user is actually in a business role
  const businessData = isBusinessRole ? rawBusinessData : null;

  const rawVerification = businessData?.verification || businessData?.verificationStatus;
  const isBizVerified =
    !isBusinessRole || // Admins are always "verified" — never lock their sidebar
    (rawVerification || "").toLowerCase() === "verified" ||
    (rawVerification || "").toLowerCase() === "approved" ||
    businessData?.isVerified === true ||
    (businessData?.status || "").toLowerCase() === "active" ||
    (businessData?.status || "").toLowerCase() === "live";
  const hasEverBeenVerified = isBizVerified;

  // If the user is an admin who switched to business_owner, bypass the verification gate
  // Central/State/Chapter admins who own a business should always see the full workspace
  const isAdminSwitchedToBusiness =
    user?.previousRole === "central_admin" ||
    user?.previousRole === "state_admin" ||
    user?.previousRole === "chapter_admin";

  const isUserRole =
    (role === "customer" || role === "user" || user?.role === "customer" || user?.role === "buyer") &&
    !isBusinessRole;
  const isUserRouteLocked = isUserRole && isRouteLocked(path);
  const isRoutePlanLocked =
    (isBusinessRole && !isBizLoading && !isAdminSwitchedToBusiness && isRouteLocked(path)) ||
    isUserRouteLocked;
  const isVerificationLocked =
    isBusinessRole &&
    !isBizLoading &&
    Boolean(businessData) &&
    !hasEverBeenVerified &&
    !isAccessibleUnverifiedPath(path) &&
    !isAdminSwitchedToBusiness;

  const isGatedPage = isRoutePlanLocked || isVerificationLocked;

  let finalTitle = title;
  let finalSubtitle = subtitle;

  if (effectiveUser?.activeWorkspace?.type === "org_role") {
    if (title === "Central administration" || title === "Overview") {
      finalTitle = `${effectiveUser.activeWorkspace.roleName || "Leadership"} Desk`;
    }
    if (subtitle === "RIFAH Central Admin · all chapters") {
      finalSubtitle = `${effectiveUser.activeWorkspace.level || "Central"} Level Portal`;
    }
  } else if (role === "admin" && effectiveUser?.role === "chapter_admin") {
    if (title === "Central administration" || title === "Chapters and units" || title === "Overview") {
      finalTitle = `${effectiveUser.chapter || "Regional"} Workspace`;
    }
    if (subtitle === "RIFAH Central Admin · all chapters" || subtitle === "Regional structure and branch desks of RIFAH Chamber") {
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
      } catch { }
    }
  };

  const recordScroll = () => {
    if (navRef.current) {
      const top = navRef.current.scrollTop;
      globalSidebarScrollTop = top;
      try {
        sessionStorage.setItem(`rifah-sidebar-scroll-${role}`, String(top));
        sessionStorage.setItem("rifah_sidebar_scroll_top", String(top));
      } catch { }
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
    const rootRoutes = ["/user", "/biz", "/admin", "/chapter-admin", "/state-admin", "/me", "/discover"];
    if (rootRoutes.includes(to)) return false;
    return to !== "/" && path.startsWith(to + "/");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const all = useMemo(() => {
    const primaryItems = (nav?.primary || []).filter((item) => item.label !== "More");
    const moreItems = nav?.more || [];
    const combined = [...primaryItems, ...moreItems];
    const seen = new Set();
    return combined.filter((item) => {
      if (seen.has(item.to)) return false;
      seen.add(item.to);
      return true;
    });
  }, [nav]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2">
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
          {all.map((item, index) => {
            let badge = null;
            if (item.label === "Messages") badge = unreadMsgs;
            if (item.label === "Notifications") badge = unreadNotifs;
            const isUserRole = role === "customer" || role === "user" || effectiveUser?.role === "customer" || effectiveUser?.role === "buyer";
            const isItemPlanLocked = isBusinessRole && !isBizLoading && !isAdminSwitchedToBusiness && isRouteLocked(item.to);
            const isItemUnverifiedLocked = isBusinessRole && !isBizLoading && Boolean(businessData) && !hasEverBeenVerified && !isAccessibleUnverifiedPath(item.to) && !isAdminSwitchedToBusiness;
            const isItemUserLocked = isUserRole && isRouteLocked(item.to);
            const isItemLocked = isItemPlanLocked || isItemUnverifiedLocked || isItemUserLocked;
            return (
              <SidebarLink
                key={`sidebar-${item.to}-${item.label}-${index}`}
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
          {mounted ? (
            <>
          {effectiveUser && (
            <Link
              href={
                role === "business"
                  ? "/biz/profile"
                  : role === "customer" || role === "user" || effectiveUser?.role === "customer" || effectiveUser?.role === "buyer"
                    ? "/user/profile"
                    : effectiveUser?.role === "state_admin"
                      ? "/state-admin/settings"
                      : effectiveUser?.role === "chapter_admin"
                        ? "/chapter-admin/settings"
                        : "/admin/settings"
              }
              onClick={recordScroll}
              className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
              title="View profile"
            >
              <UserAvatar user={effectiveUser} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-sidebar-foreground group-hover:text-primary transition-colors">{effectiveUser.name}</span>
                <span className="block truncate text-[10px] text-sidebar-foreground/50">{effectiveUser.email}</span>
              </span>
            </Link>
          )}
          {effectiveUser?.activeWorkspace?.type === "org_role" ? (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-primary uppercase tracking-wider">
                  {effectiveUser.activeWorkspace.roleName || "LEADERSHIP"}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase truncate max-w-[120px]">
                  {effectiveUser.activeWorkspace.level ? `${effectiveUser.activeWorkspace.level} LEVEL` : "ORGANIZATION"}
                </span>
              </div>
            </div>
          ) : effectiveUser?.role === "central_admin" ? (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-blue-500 uppercase tracking-wider">CENTRAL ADMIN</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold uppercase truncate max-w-[120px]">
                  ALL CHAPTERS
                </span>
              </div>
            </div>
          ) : null}
          {effectiveUser?.role === "state_admin" && (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-emerald-500 uppercase tracking-wider">STATE ADMIN</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold uppercase truncate max-w-[120px]">
                  {effectiveUser?.state || "STATE"}
                </span>
              </div>
            </div>
          )}
          {effectiveUser?.role === "chapter_admin" && (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border/60">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-cyan-400 uppercase tracking-wider">CHAPTER ADMIN</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold uppercase truncate max-w-[120px]">
                  {effectiveUser?.chapter ? effectiveUser.chapter.replace(/\s*[Cc]hapter\s*/g, "").toUpperCase() : "CHAPTER"}
                </span>
              </div>
            </div>
          )}
          {(effectiveUser?.role === "customer" || effectiveUser?.role === "buyer" || role === "user" || role === "customer") && (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-blue-500 uppercase tracking-wider">MEMBER TIER</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold uppercase truncate max-w-[120px]">
                  {effectiveUser?.subscriberTier || effectiveUser?.membershipPlan || "Tier I (Free)"}
                </span>
              </div>
            </div>
          )}
          {(effectiveUser?.role === "business_owner" || effectiveUser?.role === "business") && (
            <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-primary uppercase tracking-wider">BUSINESS</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold uppercase truncate max-w-[120px]">
                  {effectiveUser?.chapter ? effectiveUser.chapter.replace(/\s*[Cc]hapter\s*/g, "").toUpperCase() : "MEMBER"}
                </span>
              </div>
            </div>
          )}
          {/* Multi-workspace / Org-role switcher */}
          {effectiveUser?.availableWorkspaces && effectiveUser.availableWorkspaces.length > 1 && (
            <div className="mb-2 rounded-xl bg-sidebar-accent/50 p-2 border border-sidebar-border">
              <div className="px-1.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Switch Workspace</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {effectiveUser.availableWorkspaces.length} Panels
                </span>
              </div>
              <div className="space-y-1">
                {effectiveUser.availableWorkspaces.map((ws) => {
                  const isCurrentActive = ws.type === "org_role"
                    ? effectiveUser.activeWorkspace?.workspaceId === ws.workspaceId
                    : (!effectiveUser.activeWorkspace || effectiveUser.activeWorkspace.type !== "org_role") &&
                      (effectiveUser.role === ws.workspaceId || (ws.workspaceId === "business_owner" && (effectiveUser.role === "business_owner" || effectiveUser.role === "business")));

                  return (
                    <button
                      key={ws.workspaceId || ws.roleName}
                      disabled={isCurrentActive}
                      onClick={async () => {
                        if (isCurrentActive) return;
                        try {
                          if (ws.type === "org_role") {
                            await switchRole(ws.panelType || "chapter-admin", ws.workspaceId);
                            const allowedDest = ws.allowedNavRoutes?.[0];
                            if (ws.panelType === "chapter-admin") router.push(allowedDest || "/chapter-admin");
                            else if (ws.panelType === "state-admin") router.push(allowedDest || "/state-admin");
                            else router.push(allowedDest || "/admin");
                          } else {
                            await switchRole(ws.workspaceId);
                            if (ws.workspaceId === "central_admin") router.push("/admin");
                            else if (ws.workspaceId === "state_admin") router.push("/state-admin");
                            else if (ws.workspaceId === "chapter_admin") router.push("/chapter-admin");
                            else router.push("/biz");
                          }
                        } catch (err) {
                          toast.error(err.message || "Failed to switch workspace");
                        }
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left",
                        isCurrentActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold cursor-default"
                          : "text-sidebar-foreground/80 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <RotateCcw className={cn("h-3.5 w-3.5 shrink-0", isCurrentActive ? "opacity-100" : "opacity-50")} />
                        <span className="truncate">{ws.roleName}</span>
                      </div>
                      {isCurrentActive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                      ) : (
                        ws.level && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-muted font-bold text-muted-foreground uppercase shrink-0">
                            {ws.level}
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Return to Previous Role */}
          {effectiveUser?.previousRole && effectiveUser.previousRole !== effectiveUser?.role && (
            <button
              onClick={async () => {
                try {
                  const targetRole = effectiveUser.previousRole;
                  const res = await switchRole(targetRole);
                  const resultingRole = res?.role || targetRole;
                  if (["central_admin", "admin", "super_admin", "secretariat"].includes(resultingRole)) {
                    router.push("/admin");
                  } else if (resultingRole === "state_admin") {
                    router.push("/state-admin");
                  } else if (resultingRole === "chapter_admin") {
                    router.push("/chapter-admin");
                  } else if (resultingRole === "business_owner") {
                    router.push("/biz");
                  } else {
                    router.push("/biz");
                  }
                } catch (err) {
                  toast.error(err.message || "Failed to switch role");
                }
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-primary/10 hover:text-primary mb-1"
            >
              <RotateCcw className="h-[18px] w-[18px] shrink-0" />
              <span>
                {["central_admin", "admin", "super_admin", "secretariat"].includes(effectiveUser.previousRole)
                  ? "Switch to Admin Panel"
                  : effectiveUser.previousRole === "state_admin"
                    ? "Switch to State Admin Panel"
                    : effectiveUser.previousRole === "chapter_admin"
                      ? "Switch to Chapter Admin Panel"
                      : "Switch to Business Panel"}
              </span>
            </button>
          )}

          {/* Show switch-to-business for admins who have a business but haven't switched yet */}
          {effectiveUser && (!effectiveUser?.previousRole || effectiveUser.previousRole === effectiveUser?.role) && (!effectiveUser?.availableWorkspaces || effectiveUser.availableWorkspaces.length <= 1) && ["central_admin", "state_admin", "chapter_admin"].includes(effectiveUser?.role) && (effectiveUser?.businessId || effectiveUser?.businessSlug) && (
            <button
              onClick={async () => {
                try {
                  await switchRole("business_owner");
                  router.push("/biz");
                } catch (err) {
                  toast.error(err.message || "Failed to switch role");
                }
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-amber-500/10 hover:text-amber-500 mb-1"
            >
              <RotateCcw className="h-[18px] w-[18px] shrink-0" />
              <span>Switch to Business Panel</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span>Logout</span>
          </button>
            </>
          ) : (
            <div className="h-16"></div>
          )}        </div>
      </aside>

      <div className="lg:pl-64 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 md:h-16 md:px-6">
            {backTo ? (
              <Button asChild variant="ghost" size="icon" className="shrink-0">
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
              <h1 suppressHydrationWarning className="truncate text-sm sm:text-base font-semibold md:text-lg">{finalTitle}</h1>
              {finalSubtitle && <p suppressHydrationWarning className="truncate text-[11px] sm:text-xs text-muted-foreground md:text-sm">{finalSubtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
                <Link href={"/discover"} aria-label="Search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link
                  href={
                    path?.startsWith("/state-admin") || role === "state_admin" || role === "state"
                      ? "/state-admin/notifications"
                      : path?.startsWith("/chapter-admin") || role === "chapter_admin" || role === "chapter"
                      ? "/chapter-admin/notifications"
                      : path?.startsWith("/admin") || role === "admin" || role === "central_admin"
                      ? "/admin/notifications"
                      : role === "customer" || role === "user" || effectiveUser?.role === "customer" || effectiveUser?.role === "buyer"
                      ? "/user/notifications"
                      : "/biz/notifications"
                  }
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
              {role === "business" && (
                <Button asChild variant="ghost" size="icon" className="relative">
                  <Link
                    href={toRoleAwarePath("/biz/messages", role, effectiveUser)}
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
              )}
              {actions}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive" title="Logout">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="w-full max-w-full overflow-x-hidden px-3 pb-24 pt-3 sm:px-4 sm:pb-24 sm:pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-10">
          <div className="mx-auto w-full min-w-0 max-w-[1440px]">
            <BirthdayBanner />
            {isDashboardPage && <TopPerformerSpotlight role={role} />}
            {isGatedPage ? (
              <UnderApprovalAccessGate
                business={businessData}
                path={path}
                isSubscriptionExpired={isSubscriptionExpired}
                planName={currentPlanName}
                isRoutePlanLocked={isRoutePlanLocked}
              />
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Floating AI Copilot across all panels */}
      <RifahCopilotWidget role={role} user={user} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav role={role} isBizVerified={isBizVerified} />
    </div>
  );
}

function UnderApprovalAccessGate({ business, path, isSubscriptionExpired, planName, isRoutePlanLocked }) {
  const vStatus = (business?.verification || business?.verificationStatus || "").toLowerCase();
  const isChangesReq = vStatus === "changes_required" || vStatus === "correction" || vStatus === "correction_requested";
  const isRejected = vStatus === "rejected";

  const missingFields = [];
  if (!business?.name?.trim()) missingFields.push("Business Name");
  if (!business?.industry?.trim() && !business?.category?.trim() && (!business?.categories || business.categories.length === 0)) missingFields.push("Industry Category");
  if (!business?.city?.trim()) missingFields.push("City");
  if (!business?.state?.trim()) missingFields.push("State");
  if (!business?.address?.trim()) missingFields.push("Business Address");
  if (!business?.phone?.trim()) missingFields.push("Phone Number");
  if (!business?.about?.trim() || business.about.trim().toLowerCase() === "no description provided.") missingFields.push("About / Description");

  const isProfileIncomplete = missingFields.length > 0;
  const isNotSubmitted = isProfileIncomplete || vStatus === "unverified" || vStatus === "not_submitted" || vStatus === "draft" || vStatus === "";
  const isUnderReview = !isChangesReq && !isRejected && !isNotSubmitted;

  const accessibleModules = [
    {
      title: "Membership & Subscription Plans",
      description: "Upgrade or renew your membership plan, review billing tier privileges and download invoices.",
      to: "/biz/membership",
      icon: Star,
      badge: planName || "Plans",
      actionText: "Manage / Upgrade Plan →",
    },
    {
      title: "Business Profile & Details",
      description: "Review and update your enterprise profile, address, business type, founded year, and contact details.",
      to: "/biz/profile",
      icon: Building2,
      badge: isNotSubmitted ? "Action Required" : "Accessible",
      actionText: isNotSubmitted ? "Complete Profile Now →" : "Edit Business Profile →",
    },
    {
      title: "Verification & Document Upload",
      description: "Upload and replace official business documents (GST, PAN, Trade License) and track review status.",
      to: "/biz/verification",
      icon: ShieldCheck,
      badge: isChangesReq ? "Action Required" : "Accessible",
      actionText: "Open Verification Desk →",
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
      {/* 1. Subscription Expired State */}
      {isSubscriptionExpired ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-50/95 dark:border-red-800 dark:bg-red-950/40 p-6 sm:p-8 shadow-sm relative overflow-hidden text-red-950 dark:text-red-100">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  SUBSCRIPTION EXPIRED (1 MONTH COMPLETED)
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-semibold text-foreground/80">{business?.name || "Business Enterprise"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-red-950 dark:text-red-100">
                1-Month Subscription Validity Expired — Features Locked
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-red-900/90 dark:text-red-200">
                Your monthly membership period has concluded. All workspace modules, lead unlocks, buyer enquiries, direct messaging, and analytics are currently locked. Please renew or upgrade your plan to immediately restore full privileges.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Button asChild size="sm" className="font-semibold shadow-xs gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/biz/membership">
                    <Star className="h-4 w-4" />
                    <span>Renew / Upgrade Membership Plan</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="font-semibold gap-2 border-red-300 text-red-900 hover:bg-red-100 dark:border-red-800 dark:text-red-200">
                  <Link href="/biz/profile">
                    <Building2 className="h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : isRoutePlanLocked ? (
        /* 2. Route Plan Restricted State */
        <div className="rounded-3xl border border-indigo-500/30 bg-indigo-50/90 dark:border-indigo-800 dark:bg-indigo-950/40 p-6 sm:p-8 shadow-sm relative overflow-hidden text-indigo-950 dark:text-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  PLAN TIER UPGRADE REQUIRED
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-semibold text-foreground/80">{planName || "Tier I (Free)"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-indigo-950 dark:text-indigo-100">
                Feature Restricted on {planName || "Tier I (Free)"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-indigo-900/90 dark:text-indigo-200">
                This workspace module is not available on your current <strong>{planName || "Tier I (Free)"}</strong> plan. Upgrade your subscription to unlock this feature along with higher enquiry limits, lead unlocking, direct chat, and premium visibility.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Button asChild size="sm" className="font-semibold shadow-xs gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href={isUserRole ? "/user/membership" : "/biz/membership"}>
                    <Star className="h-4 w-4" />
                    <span>Upgrade Membership Plan</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="font-semibold gap-2 border-indigo-300 text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-200">
                  <Link href={isUserRole ? "/user/profile" : "/biz/profile"}>
                    <Building2 className="h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Verification Approval State */
        <div
          className={cn(
            "rounded-3xl border p-6 sm:p-8 shadow-xs relative overflow-hidden",
            isNotSubmitted && "border-red-400 bg-red-50/95 dark:border-red-800 dark:bg-red-950/40 text-red-950 dark:text-red-100",
            isChangesReq && "border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100",
            isRejected && "border-rose-300 bg-rose-50/90 dark:border-rose-800 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100",
            isUnderReview && "border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            <div
              className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-xs",
                isNotSubmitted && "bg-red-600 text-white shadow-red-500/20",
                isChangesReq && "bg-blue-600 text-white",
                isRejected && "bg-rose-600 text-white",
                isUnderReview && "bg-amber-500 text-white"
              )}
            >
              {isNotSubmitted ? (
                <AlertTriangle className="h-7 w-7 text-white" />
              ) : isChangesReq ? (
                <RotateCcw className="h-7 w-7" />
              ) : isRejected ? (
                <XCircle className="h-7 w-7" />
              ) : (
                <Clock className="h-7 w-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    isNotSubmitted && "bg-red-600 text-white dark:bg-red-600 dark:text-white",
                    isChangesReq && "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
                    isRejected && "bg-rose-600 text-white dark:bg-rose-600 dark:text-white",
                    isUnderReview && "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                  )}
                >
                  {isNotSubmitted
                    ? "PROFILE INCOMPLETE — NOT SUBMITTED"
                    : isChangesReq
                      ? "CHANGES REQUESTED"
                      : isRejected
                        ? "VERIFICATION REJECTED"
                        : "UNDER CENTRAL ADMIN APPROVAL"}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-semibold text-foreground/80">{business?.name || "Business Enterprise"}</span>
              </div>

              <h2
                className={cn(
                  "text-lg sm:text-xl font-bold tracking-tight",
                  isNotSubmitted ? "text-red-950 dark:text-red-100" : "text-foreground"
                )}
              >
                {isNotSubmitted
                  ? "Workspace Access Restricted — Profile Incomplete & Not Submitted"
                  : isChangesReq
                    ? "Action Required: Central Admin Requested Changes"
                    : isRejected
                      ? "Verification Application Rejected"
                      : "Workspace Access Restricted — Under Central Admin Approval"}
              </h2>

              <p
                className={cn(
                  "mt-2 text-xs sm:text-sm leading-relaxed",
                  isNotSubmitted
                    ? "text-red-900/90 dark:text-red-200 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {isNotSubmitted
                  ? "Your business profile is incomplete and has not been submitted for Central Admin verification. Workspace features like Direct Enquiries, Catalogue Publishing, Analytics, and Messaging will remain restricted until your profile details are completed and submitted for review."
                  : isChangesReq
                    ? "The RIFAH Chamber Central Admin has reviewed your business application and requested specific changes or additional paperwork before granting verification approval."
                    : isRejected
                      ? "Your verification application has been rejected by the Central Admin. Please review the feedback reason below and update your documents to re-submit."
                      : "Your business profile is currently in the RIFAH Central Admin Verification queue. Workspace features like Direct Enquiries, Catalogue Publishing, Analytics, and Messaging will be activated as soon as your business documents are verified."}
              </p>

              {isNotSubmitted && missingFields.length > 0 && (
                <div className="mt-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 p-3.5 border border-red-200 dark:border-red-900/60 text-xs shadow-2xs">
                  <span className="block font-bold text-red-700 dark:text-red-400 text-[11px] uppercase tracking-wider mb-1.5">
                    Missing required profile information:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingFields.map((field) => (
                      <span
                        key={field}
                        className="rounded-md bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
                      >
                        • {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "font-semibold shadow-xs gap-2",
                    isNotSubmitted
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  <Link href="/biz/profile">
                    <Building2 className="h-4 w-4" />
                    <span>{isNotSubmitted ? "Complete Business Profile" : "Edit Business Profile"}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className={cn(
                    "font-semibold gap-2",
                    isNotSubmitted && "border-red-300 text-red-900 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/40"
                  )}
                >
                  <Link href="/biz/verification">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Go to Verification & Documents</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Pages Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-foreground">
            Accessible Pages & Services
          </h3>
          <span className="text-xs text-muted-foreground font-medium">4 Modules Accessible</span>
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
          <strong>Restricted Features:</strong> Lead unlocks, direct messaging, enquiry posting limits, and advanced networking groups depend on your active plan tier. Upgrades apply immediately.
        </p>
      </div>
    </div>
  );
}

function MobileCategoryGroup({ group, isActive, role, isBizVerified, onSelect }) {
  const items = group.items || [];
  const hasActiveChild = items.some((item) => isActive(item.to));
  const { isRouteLocked } = useFeatureAccess();
  // Keep closed by default unless the active route belongs to this category
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="truncate">{group.category}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-1 space-y-0.5 pl-1.5">
          {items.map((i, idx) => {
            const isLocked = role === "business" && (isRouteLocked(i.to) || (!isBizVerified && !isAccessibleUnverifiedPath(i.to)));
            return (
              <Link
                key={`ms-${group.category}-${i.to}-${i.label}-${idx}`}
                href={i.to}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    toast.error(`${i.label} is locked on your current plan. Upgrade your plan to unlock.`);
                    return;
                  }
                  onSelect?.(e);
                }}
                className={cn(
                  "flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted transition-colors",
                  isActive(i.to) && "bg-primary/10 text-primary font-bold",
                  isLocked && "opacity-75"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <i.icon className="h-[18px] w-[18px] text-primary shrink-0" />
                  <span className="truncate">{i.label}</span>
                </div>
                {isLocked && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MoreSheet({ role, isBizVerified = true }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const path = useCurrentPath();
  const router = useRouter();
  const { user, switchRole } = useAuth();
  const { isRouteLocked } = useFeatureAccess();
  const effectiveUser = mounted ? user : null;
  const nav = useResolvedNav(role);
  const items = role === "chapter_admin" ? [...(nav?.primary || []), ...(nav?.more || [])] : (nav?.more || []);

  // BUG-014: mobile "More" sheet had no way back to the admin workspace
  // after switching into the Business view; mirror the desktop sidebar's
  // switch-back control here using user.previousRole from the session.
  const handleSwitchBack = async () => {
    const targetRole = effectiveUser?.previousRole;
    if (!targetRole) return;
    const res = await switchRole(targetRole);
    setOpen(false);
    const resultingRole = res?.role || targetRole;
    if (["central_admin", "admin", "super_admin", "secretariat"].includes(resultingRole)) router.push("/admin");
    else if (resultingRole === "state_admin") router.push("/state-admin");
    else if (resultingRole === "chapter_admin") router.push("/chapter-admin");
    else router.push("/biz");
  };
  const switchBackLabel =
    ["central_admin", "admin", "super_admin", "secretariat"].includes(effectiveUser?.previousRole)
      ? "Switch to Admin Panel"
      : effectiveUser?.previousRole === "state_admin"
        ? "Switch to State Admin Panel"
        : effectiveUser?.previousRole === "chapter_admin"
          ? "Switch to Chapter Admin Panel"
          : "Switch to Business Panel";

  const isActive = (to) => {
    if (path === to) return true;
    const rootRoutes = ["/user", "/biz", "/admin", "/chapter-admin", "/state-admin", "/me", "/discover"];
    if (rootRoutes.includes(to)) return false;
    return to !== "/" && path.startsWith(to + "/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4 flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LogoMark className="h-4" />
            </span>
            <div>
              <span className="block font-bold leading-none">RIFAH</span>
              {role === "chapter_admin" && (
                <span className="block text-[9px] font-black text-cyan-500 uppercase tracking-wider mt-0.5">
                  OPERATIONS CENTER
                </span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {nav.title}
          </p>
          {items.map((i, idx) => {
            const isLocked = role === "business" && (isRouteLocked(i.to) || (!isBizVerified && !isAccessibleUnverifiedPath(i.to)));
            return (
              <div key={`ms-item-${i.to}-${i.label}-${idx}`} className="py-1">
                <Link
                  href={i.to}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      toast.error(`${i.label} is locked on your current plan. Upgrade your plan to unlock.`);
                      return;
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted",
                    isActive(i.to) && "bg-primary/10 text-primary font-bold",
                    isLocked && "opacity-75"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <i.icon className="h-[18px] w-[18px] text-primary" />
                    <span>{i.label}</span>
                  </div>
                  {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </Link>
              </div>
            );
          })}
          <div className="mt-4 border-t border-border pt-3">
            {effectiveUser?.availableWorkspaces && effectiveUser.availableWorkspaces.length > 1 && (
              <div className="mb-3 rounded-xl bg-muted/40 p-2 border border-border">
                <div className="px-1.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Switch Workspace</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {effectiveUser.availableWorkspaces.length} Panels
                  </span>
                </div>
                <div className="space-y-1">
                  {effectiveUser.availableWorkspaces.map((ws) => {
                    const isCurrentActive = ws.type === "org_role"
                      ? effectiveUser.activeWorkspace?.workspaceId === ws.workspaceId
                      : (!effectiveUser.activeWorkspace || effectiveUser.activeWorkspace.type !== "org_role") &&
                        (effectiveUser.role === ws.workspaceId || (ws.workspaceId === "business_owner" && (effectiveUser.role === "business_owner" || effectiveUser.role === "business")));

                    return (
                      <button
                        key={ws.workspaceId || ws.roleName}
                        disabled={isCurrentActive}
                        onClick={async () => {
                          if (isCurrentActive) return;
                          try {
                            setOpen(false);
                            if (ws.type === "org_role") {
                              await switchRole(ws.panelType || "chapter-admin", ws.workspaceId);
                              const allowedDest = ws.allowedNavRoutes?.[0];
                              if (ws.panelType === "chapter-admin") router.push(allowedDest || "/chapter-admin");
                              else if (ws.panelType === "state-admin") router.push(allowedDest || "/state-admin");
                              else router.push(allowedDest || "/admin");
                            } else {
                              await switchRole(ws.workspaceId);
                              if (ws.workspaceId === "central_admin") router.push("/admin");
                              else if (ws.workspaceId === "state_admin") router.push("/state-admin");
                              else if (ws.workspaceId === "chapter_admin") router.push("/chapter-admin");
                              else router.push("/biz");
                            }
                          } catch (err) {
                            toast.error(err.message || "Failed to switch workspace");
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all text-left",
                          isCurrentActive
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground/80 hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <RotateCcw className={cn("h-3.5 w-3.5 shrink-0", isCurrentActive ? "opacity-100" : "opacity-50")} />
                          <span className="truncate">{ws.roleName}</span>
                        </div>
                        {isCurrentActive ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                        ) : (
                          ws.level && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground uppercase shrink-0">
                              {ws.level}
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Return to Previous Role */}
            {effectiveUser?.previousRole && effectiveUser.previousRole !== effectiveUser?.role && (
              <button
                type="button"
                onClick={handleSwitchBack}
                className="flex w-full min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-primary hover:bg-primary/10 mb-1"
              >
                <RotateCcw className="h-[18px] w-[18px] shrink-0" />
                <span>{switchBackLabel}</span>
              </button>
            )}
            {/* Show switch-to-business for admins who have a business but haven't switched yet */}
            {effectiveUser && (!effectiveUser?.previousRole || effectiveUser.previousRole === effectiveUser?.role) && (!effectiveUser?.availableWorkspaces || effectiveUser.availableWorkspaces.length <= 1) && ["central_admin", "state_admin", "chapter_admin"].includes(effectiveUser?.role) && (effectiveUser?.businessId || effectiveUser?.businessSlug) && (
              <button
                type="button"
                onClick={async () => {
                  await switchRole("business_owner");
                  setOpen(false);
                  router.push("/biz");
                }}
                className="flex w-full min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-amber-600 hover:bg-amber-500/10 mb-1"
              >
                <RotateCcw className="h-[18px] w-[18px] shrink-0" />
                <span>Switch to Business Panel</span>
              </button>
            )}
            <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted">
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
  const { isRouteLocked } = useFeatureAccess();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden max-w-full overflow-hidden"
      aria-label="Primary"
    >
      <ul className={cn("grid w-full", primary.length === 6 ? "grid-cols-6" : "grid-cols-5")}>
        {primary.map((item) => {
          const active = path === item.to;
          const isLocked = mounted && role === "business" && (isRouteLocked(item.to) || (!isBizVerified && !isAccessibleUnverifiedPath(item.to)));
          return (
            <li key={item.label} className="min-w-0">
              <Link
                href={item.to}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    toast.error(`${item.label} is locked on your current plan. Upgrade your plan to unlock.`);
                  }
                }}
                className={cn(
                  "flex min-h-[54px] flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground relative leading-tight",
                  active && "text-primary font-semibold",
                  isLocked && "opacity-70"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0", active && "text-primary")} />
                  {isLocked && (
                    <Lock className="h-2.5 w-2.5 absolute -top-1 -right-1 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate max-w-full text-center">{item.label}</span>
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const effectiveUser = mounted ? user : null;
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };
  return (
    <>
      {effectiveUser && (
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <UserAvatar user={effectiveUser} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{effectiveUser.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{effectiveUser.email}</span>
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
