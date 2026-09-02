"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronLeft,
  CreditCard,
  FileStack,
  Folder,
  Gauge,
  LayoutGrid,
  LogOut,
  Mail,
  MapPinned,
  Menu,
  MessageSquare,
  Package,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Target,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";


import { LogoMark, RifahLogo } from "@shared/components/rifah/brand";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";









const navs = {
  customer: {
    title: "My RIFAH",
    primary: [
      { label: "Home", to: "/me", icon: Gauge },
      { label: "Discover", to: "/discover", icon: Search },
      { label: "Enquiries", to: "/me/enquiries", icon: FileStack },
      { label: "Saved", to: "/me/saved", icon: Bookmark },
      { label: "Account", to: "/me/profile", icon: UserRound },
    ],
    more: [
      { label: "Messages", to: "/me/messages", icon: MessageSquare },
      { label: "My events", to: "/me/events", icon: CalendarDays },
      { label: "Notifications", to: "/me/notifications", icon: Bell },
      { label: "Membership plans", to: "/membership", icon: Star },
    ],
  },
  business: {
    title: "Business workspace",
    primary: [
      { label: "Dashboard", to: "/biz", icon: Gauge },
      { label: "Leads", to: "/biz/leads", icon: Target },
      { label: "Messages", to: "/biz/messages", icon: MessageSquare },
      { label: "Business", to: "/biz/profile", icon: Building2 },
      { label: "More", to: "/biz/catalogue", icon: LayoutGrid },
    ],
    more: [
      { label: "Catalogue", to: "/biz/catalogue", icon: Package },
      { label: "Enquiries", to: "/biz/enquiries", icon: FileStack },
      { label: "Analytics", to: "/biz/analytics", icon: ChartNoAxesColumn },
      { label: "Membership", to: "/biz/membership", icon: Star },
      { label: "Verification", to: "/biz/verification", icon: ShieldCheck },
      { label: "Payments", to: "/biz/payments", icon: CreditCard },
      { label: "Notifications", to: "/biz/notifications", icon: Bell },
    ],
  },
  admin: {
    title: "RIFAH administration",
    primary: [
      { label: "Overview", to: "/admin", icon: Gauge },
      { label: "Businesses", to: "/admin/businesses", icon: Building2 },
      { label: "Verify", to: "/admin/verification", icon: ShieldCheck },
      { label: "Leads", to: "/admin/leads", icon: Target },
      { label: "More", to: "/admin/settings", icon: LayoutGrid },
    ],
    more: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Memberships", to: "/admin/memberships", icon: Star },
      { label: "Enquiries", to: "/admin/enquiries", icon: FileStack },
      { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
      { label: "Categories", to: "/admin/categories", icon: Folder },
      { label: "Chapters", to: "/admin/chapters", icon: MapPinned },
      { label: "Units", to: "/admin/units", icon: Users },
      { label: "Events", to: "/admin/events", icon: Ticket },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Reports", to: "/admin/reports", icon: ChartNoAxesColumn },
      { label: "Audit logs", to: "/admin/audit", icon: ScrollText },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
};

const roleSwitcher = [
  { role: "customer", label: "Customer", to: "/me" },
  { role: "business", label: "Business", to: "/biz" },
  { role: "admin", label: "Admin", to: "/admin" },
];

function useCurrentPath() {
  return usePathname();
}

function SidebarLink({ item, active }) {
  return (
    <Link
      href={item.to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AppShell({
  role,
  title,
  subtitle,
  actions,
  children,
  backTo,
}






) {
  const path = useCurrentPath();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Dynamically resolve navigation and branding for Chapter Admins
  let dynamicNavs = { ...navs };
  let finalTitle = title;
  let finalSubtitle = subtitle;

  if (role === "admin" && user?.role === "chapter_admin") {
    const slug = user.chapter.toLowerCase().replace(/\s+/g, '-');
    const prefix = `/${slug}`;
    
    // Update Branding
    if (title === "Chamber administration" || title === "Chapters and units" || title === "Overview") {
      finalTitle = `${user.chapter} Workspace`;
    }
    if (subtitle === "RIFAH Secretariat · all chapters" || subtitle === "Regional structure and branch desks of RIFAH Chamber") {
      finalSubtitle = "Regional branch dashboard";
    }

    // Deep clone and prepend slug to all admin routes
    dynamicNavs.admin = {
      title: user.chapter,
      primary: navs.admin.primary.map((n) => ({ ...n, to: n.to.replace("/admin", `${prefix}/admin`) })),
      more: navs.admin.more.map((n) => ({ ...n, to: n.to.replace("/admin", `${prefix}/admin`) })),
    };
  }

  const nav = dynamicNavs[role];
  const all = [...nav.primary.filter((i) => i.label !== "More"), ...nav.more];
  const isActive = (to) => {
    if (path === to) return true;
    
    // Root workspace routes should only match exactly
    const rootRoutes = ["/biz", "/admin", "/me", "/discover"];
    
    // Check if `to` is a dynamic root route (e.g., /mumbai-chapter/admin)
    if (rootRoutes.includes(to) || to.endsWith("/admin")) return false;
    
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
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {all.map((item) => (
            <SidebarLink key={item.to + item.label} item={item} active={isActive(item.to)} />
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {user && (
            <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="block truncate text-[10px] text-sidebar-foreground/50">{user.email}</span>
              </span>
            </div>
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
          <div className="flex h-14 items-center gap-3 px-4 md:h-16 md:px-6">
            {backTo ? (
              <Button asChild variant="ghost" size="icon" className="shrink-0 lg:hidden">
                <Link href={backTo} aria-label="Go back">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <div className="lg:hidden">
                <MoreSheet role={role} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold md:text-lg">{finalTitle}</h1>
              {finalSubtitle && <p className="truncate text-xs text-muted-foreground md:text-sm">{finalSubtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
                <Link href={"/discover"} aria-label="Search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link
                  href={(role === "admin" ? "/admin/notifications" : role === "business" ? "/biz/notifications" : "/me/notifications")}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand" />
                  )}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative inline-flex">
                <Link
                  href={(role === "business" ? "/biz/messages" : "/me/messages")}
                  aria-label="Messages"
                >
                  <Mail className="h-5 w-5" />
                  {unreadMsgs > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand" />
                  )}
                </Link>
              </Button>
              {actions}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive" title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-10 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-10">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>


    </div>
  );
}

function MoreSheet({ role }) {
  const nav = navs[role];
  const items = [...nav.primary.filter((i) => i.label !== "More"), ...nav.more];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-left">
            <RifahLogo />
          </SheetTitle>
        </SheetHeader>
        <nav className="grid gap-1 p-3">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {nav.title}
          </p>
          {items.map((i) => (
            <Link
              key={i.to + i.label}
              href={i.to}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted"
            >
              <i.icon className="h-[18px] w-[18px] text-primary" />
              {i.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-3">
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

export function BottomNav({ role }) {
  const path = useCurrentPath();
  const nav = navs[role];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {nav.primary.map((item) => {
          const active = path === item.to;
          return (
            <li key={item.label}>
              <Link
                href={item.to}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
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
