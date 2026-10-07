"use client";
import React from "react";
import Link from "next/link";
import {
  Compass,
  FileStack,
  MessageSquare,
  Users,
  CalendarDays,
  GraduationCap,
  Crown,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  Lock,
  CheckCircle2,
  Bell,
  Star,
  Zap,
  Package,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/providers/auth-provider";
import { useFeatureAccess } from "@shared/hooks/use-feature-access";
import { SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";
import { cn } from "@shared/lib/utils";

export function UserDashboard() {
  const { user } = useAuth();
  const { currentTier, planName, canAccess } = useFeatureAccess();

  const chatAccess = canAccess("chat");
  const networkingAccess = canAccess("networking_groups");
  const meetingAccess = canAccess("meeting_request");
  const lmsAccess = canAccess("lms");

  const statCards = [
    {
      label: "My Catalogue",
      count: currentTier?.features?.product_listing ? `${currentTier.features.product_listing} listings` : "Active",
      desc: "Manage products & services",
      href: "/user/catalogue",
      icon: Package,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 text-amber-700",
    },
    {
      label: "My Enquiries",
      count: "Active",
      desc: "Post & track buyer enquiries",
      href: "/user/my-enquiries",
      icon: Send,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-700",
    },
    {
      label: "Chamber Feeds",
      count: "Community",
      desc: "Explore member posts & updates",
      href: "/user/feeds",
      icon: Compass,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Networking Hub",
      count: networkingAccess.isAllowed ? "Active" : "Locked",
      desc: "Connect with chapter members",
      href: "/user/networking",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50 text-purple-700",
      locked: !networkingAccess.isAllowed,
    },
  ];

  return (
    <AppShell
      role="user"
      title="Member Workspace"
      subtitle={`Welcome back, ${user?.name || "Member"}. Explore chamber trade, enquiries, and networking.`}
    >
      <div className="space-y-6 max-w-6xl mx-auto py-6 px-3 sm:px-6">
        {/* Hero Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  <span>{planName || "Tier I (Free)"}</span>
                </span>
                {user?.businessName && (
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{user.businessName}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {user?.name || "Valued Member"}!
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Connect with verified chamber businesses across 28+ chapters, showcase your catalogue products, post customized requirements, and explore opportunities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button asChild className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 hover:text-slate-950 font-bold text-xs shadow-md transition-all">
                <Link href="/user/catalogue">
                  <Package className="h-4 w-4 mr-1.5" />
                  <span>My Catalogue</span>
                </Link>
              </Button>
              <Button asChild className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white hover:text-white font-bold text-xs shadow-md transition-all">
                <Link href="/user/enquiries">
                  <Compass className="h-4 w-4 mr-1.5" />
                  <span>Explore Enquiries</span>
                </Link>
              </Button>
              <Button asChild className="h-11 px-5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 text-white hover:text-white font-bold text-xs shadow-sm backdrop-blur-sm transition-all">
                <Link href="/user/membership" className="text-white hover:text-white">
                  <Sparkles className="h-4 w-4 mr-1.5 text-amber-300" />
                  <span className="text-white hover:text-white">View Member Tiers</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Feature Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2.5 rounded-xl", card.bgLight)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  {card.locked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-700">{card.count}</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {card.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {card.desc}
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Open module</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Current Plan Privileges & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Plan summary */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Your Plan Entitlements</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privileges included in your active <strong>{planName || "Tier I (Free)"}</strong> subscription.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                <Link href="/user/membership">Upgrade Plan →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Feed Posting</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentTier?.features?.feed_posting || "None"}
                  </p>
                </div>
                <Compass className="h-4 w-4 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Direct Chat / Messages</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentTier?.features?.chat || "None"}
                  </p>
                </div>
                {chatAccess.isAllowed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Networking Groups</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentTier?.features?.networking_groups || "None"}
                  </p>
                </div>
                {networkingAccess.isAllowed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Enquiry Postings</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentTier?.features?.enquiry_posting || "2"} per month
                  </p>
                </div>
                <Send className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50/70 border border-blue-200/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">Need more enquiries or direct chat?</p>
                  <p className="text-[11px] text-blue-700">Tier II starts at just ₹50/mo with 5 direct chats & 10 enquiries.</p>
                </div>
              </div>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0">
                <Link href="/user/membership">Upgrade Now</Link>
              </Button>
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Quick Shortcuts</h3>
            <div className="space-y-2">
              <Link
                href="/user/events"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span>Chamber Events</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/user/lms"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <span>Learning & LMS</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/user/profile"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span>Profile & Business Info</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/user/notifications"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-amber-600" />
                  <span>Chamber Notifications</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
