"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trophy,
  Crown,
  Handshake,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  X,
  Medal,
  Sparkles,
  IndianRupee,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Checkbox } from "@shared/components/ui/checkbox";
import { MemberPicker } from "@shared/components/rifah/member-picker";
import { useAuth } from "@shared/providers/auth-provider";
import { useNetworkingSpotlight, useChapters, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { thankYouNoteApi, referralApi } from "@shared/lib/api-services";
import { ALL_INDIAN_STATES } from "@shared/lib/indian-states-cities";
import { cn } from "@shared/lib/utils";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={cn("fill-current", className)} viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
    </svg>
  );
}

function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return "₹0";
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatWhatsappLink(number, message) {
  if (!number) return null;
  let digits = String(number).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) digits = `91${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function TopPerformerSpotlight({ className = "", role = "" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: myBusiness } = useMyBusiness();

  const [isDismissed, setIsDismissed] = useState(false);
  const [period, setPeriod] = useState("this_month");

  const pathname = usePathname();

  const isAdminPath =
    pathname?.startsWith("/chapter-admin") ||
    pathname?.startsWith("/state-admin") ||
    pathname?.startsWith("/admin");

  const userRole = user?.role;
  const isCentral = ["central_admin", "secretariat", "super_admin", "admin"].includes(userRole);
  const isState = userRole === "state_admin";
  const isChapter = userRole === "chapter_admin" || userRole === "chapter_secretary" || userRole === "secretary";
  const isOrgRole = user?.activeWorkspace?.type === "org_role" || Boolean(user?.activeWorkspace?.roleName);
  const isWorkspaceAdmin = ["chapter_admin", "state_admin", "central_admin", "admin"].includes(user?.activeWorkspace?.workspaceId) ||
    ["chapter_admin", "state_admin", "central_admin", "admin"].includes(user?.activeWorkspace?.panelType);

  const isAdmin =
    role === "admin" ||
    role?.includes("admin") ||
    isAdminPath ||
    isCentral ||
    isState ||
    isChapter ||
    isOrgRole ||
    isWorkspaceAdmin ||
    user?.accountType === "admin";

  // Only show personal "My Rank" for actual business members on member panels
  const hasBusiness = Boolean(myBusiness?._id || user?.businessId);
  const showMyRank = !isAdmin && hasBusiness;

  const adminReportsPath = (isChapter || pathname?.startsWith("/chapter-admin"))
    ? "/chapter-admin/reports"
    : (isState || pathname?.startsWith("/state-admin"))
    ? "/state-admin/reports"
    : "/admin/reports";

  const defaultScope = useMemo(() => {
    if (pathname?.startsWith("/admin") || isCentral) return "national";
    if (pathname?.startsWith("/state-admin") || isState) return "state";
    return "chapter";
  }, [pathname, isCentral, isState]);

  const [scope, setScope] = useState(defaultScope);
  const [selectedState, setSelectedState] = useState(user?.state || "");
  const [selectedChapterId, setSelectedChapterId] = useState(user?.chapterId || "");

  // Keep chapter and state synced once user auth loads
  useEffect(() => {
    if (user?.state && !selectedState) {
      setSelectedState(user.state);
    }
    if (user?.chapterId && !selectedChapterId) {
      setSelectedChapterId(user.chapterId);
    }
  }, [user?.state, user?.chapterId]);

  // ==================== DIALOG STATES ====================
  // Thank You Note Dialog
  const [isThankYouDialogOpen, setIsThankYouDialogOpen] = useState(false);
  const [thankYouMember, setThankYouMember] = useState(null);
  const [thankYouAmount, setThankYouAmount] = useState("");
  const [thankYouNote, setThankYouNote] = useState("");
  const [isSavingThankYou, setIsSavingThankYou] = useState(false);

  // Referral Dialog
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [referralMember, setReferralMember] = useState(null);
  const [referralForm, setReferralForm] = useState({
    leadName: "",
    leadContact: "",
    leadIsMember: false,
    description: "",
  });
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  const { data: chaptersRaw } = useChapters();
  const allChapters = useMemo(() => {
    return Array.isArray(chaptersRaw) ? chaptersRaw : chaptersRaw?.chapters || [];
  }, [chaptersRaw]);

  const availableChapters = useMemo(() => {
    if (!allChapters.length) return [];
    if (isState && user?.state) {
      return allChapters.filter(
        (c) => (c.state || "").toLowerCase() === (user.state || "").toLowerCase()
      );
    }
    if (selectedState) {
      return allChapters.filter(
        (c) => (c.state || "").toLowerCase() === selectedState.toLowerCase()
      );
    }
    return allChapters;
  }, [allChapters, isState, user?.state, selectedState]);

  const { data } = useNetworkingSpotlight(
    {
      scope,
      period,
      chapterId: scope === "chapter" ? (selectedChapterId || user?.chapterId || undefined) : undefined,
      state: scope === "state" ? (selectedState || user?.state || undefined) : undefined,
      businessId: myBusiness?._id || user?.businessId || undefined,
    },
    { enabled: !!user }
  );

  // ==================== SUBMISSION HANDLERS ====================
  const handleSaveThankYou = async () => {
    if (!thankYouMember) {
      toast.error("Please select the member you're thanking.");
      return;
    }
    const amount = Number(thankYouAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    setIsSavingThankYou(true);
    try {
      await thankYouNoteApi.create({
        counterpartBusinessId: thankYouMember._id,
        amount,
        note: thankYouNote.trim(),
      });
      toast.success("Thank you note recorded successfully!");
      setIsThankYouDialogOpen(false);
      setThankYouMember(null);
      setThankYouAmount("");
      setThankYouNote("");

      // Live invalidate queries to update spotlight and counters
      queryClient.invalidateQueries({ queryKey: ["networking-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["thank-you-notes"] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    } catch (error) {
      toast.error(error.message || "Failed to record thank you note");
    } finally {
      setIsSavingThankYou(false);
    }
  };

  const handleSaveReferral = async () => {
    if (!referralMember) {
      toast.error("Please select the member you're referring business to.");
      return;
    }
    if (!referralForm.leadName.trim()) {
      toast.error("Please enter the contact or lead name.");
      return;
    }
    if (!referralForm.description.trim()) {
      toast.error("Please describe the requirement you're referring.");
      return;
    }

    setIsSavingReferral(true);
    try {
      await referralApi.create({
        referredBusinessId: referralMember._id,
        leadName: referralForm.leadName.trim(),
        leadContact: referralForm.leadContact.trim(),
        leadIsMember: referralForm.leadIsMember,
        description: referralForm.description.trim(),
      });
      toast.success("Referral passed successfully!");
      setIsReferralDialogOpen(false);
      setReferralMember(null);
      setReferralForm({ leadName: "", leadContact: "", leadIsMember: false, description: "" });

      // Live invalidate queries to update spotlight and counters
      queryClient.invalidateQueries({ queryKey: ["networking-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
    } catch (error) {
      toast.error(error.message || "Failed to pass referral");
    } finally {
      setIsSavingReferral(false);
    }
  };

  if (!mounted || isDismissed) return null;

  const spotlight = data || {};
  const referralChampion = spotlight.referralChampion || {};
  const tynChampion = spotlight.thankYouNoteChampion || {};

  const refTop1 = referralChampion.top1;
  const refStatus = referralChampion.myStatus || {};

  const tynTop1 = tynChampion.top1;
  const tynStatus = tynChampion.myStatus || {};

  const scopeDisplayName =
    scope === "national" || scope === "central" || spotlight.scope?.level === "national" || spotlight.scope?.level === "central"
      ? "Central"
      : scope === "state"
      ? (spotlight.scope?.name || selectedState || user?.state || "State")
      : (spotlight.scope?.name || user?.chapter || "Chapter");

  const scopeTotalLabel =
    scope === "chapter"
      ? "Chapter Total"
      : scope === "state"
      ? "State Total"
      : "Central Total";

  return (
    <>
      <div
        className={cn(
          "relative mb-5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-4",
          className
        )}
      >
        {/* Header bar: Minimalist, clean single-line controls */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800/80">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Spotlight Champions
                </h3>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  #1 Leaders
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Top network contributors in {scopeDisplayName}
              </p>
            </div>
          </div>

          {/* Right: Clean, aligned controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Scope Segmented Control */}
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setScope("chapter")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  scope === "chapter"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                Chapter
              </button>
              <button
                type="button"
                onClick={() => setScope("state")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  scope === "state"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                State
              </button>
              <button
                type="button"
                onClick={() => setScope("national")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  scope === "national"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                Central
              </button>
            </div>

            {/* Sub-Scope Selectors (when applicable) */}
            {scope === "chapter" && availableChapters.length > 0 && (
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="h-7.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 max-w-[130px] sm:max-w-[160px] truncate"
              >
                <option value="">{user?.chapter || "Select Chapter"}</option>
                {availableChapters.map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            )}

            {scope === "state" && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="h-7.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 max-w-[120px] truncate"
              >
                <option value="">{user?.state || "Select State"}</option>
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}

            {/* Period Dropdown */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-7.5 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="all_time">All-Time</option>
            </select>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss spotlight"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Main Grid: 2 Clean Minimalist Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* ================= CARD 1: REFERRAL CHAMPION ================= */}
          <div className="relative flex flex-col justify-between rounded-xl border border-amber-200/60 bg-amber-50/20 p-3.5 transition-all hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/10">
            <div>
              {/* Card Header Tag & Congratulate Action */}
              <div className="mb-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Referral Champion
                </span>

                {refTop1?.whatsapp && formatWhatsappLink(
                  refTop1.whatsapp,
                  `Congratulations ${refTop1.contactPerson || refTop1.businessName}! 🏆 Saw you as the #1 Top Referral Champion (${refTop1.score} referrals) at RIFAH Chamber! Keep inspiring us!`
                ) && (
                  <a
                    href={formatWhatsappLink(
                      refTop1.whatsapp,
                      `Congratulations ${refTop1.contactPerson || refTop1.businessName}! 🏆 Saw you as the #1 Top Referral Champion (${refTop1.score} referrals) at RIFAH Chamber! Keep inspiring us!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  >
                    <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                    Congratulate
                  </a>
                )}
              </div>

              {/* Business Content */}
              {refTop1 ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      {refTop1.logo ? (
                        <img
                          src={refTop1.logo}
                          alt={refTop1.businessName}
                          className="h-10 w-10 rounded-lg border border-slate-200/80 object-cover dark:border-slate-800"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          {refTop1.businessName?.charAt(0) || "R"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {refTop1.businessName}
                      </h4>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {refTop1.contactPerson || "Member"} · {refTop1.chapterName || refTop1.state || "RIFAH"}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {refTop1.score}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500">
                      referrals
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 px-3 rounded-lg border border-dashed border-amber-300/60 bg-amber-50/40 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    🏆 #1 Spot is currently open!
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Be the first to pass a referral in {scopeDisplayName} to claim #1!
                  </p>
                </div>
              )}
            </div>

            {/* Administrative Summary for Admins (hidden for members since they have dedicated standing card) */}
            {!showMyRank && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200/70 bg-amber-50/40 px-3 py-2 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  <span>
                    {scopeTotalLabel}: <strong className="font-bold text-slate-900 dark:text-white">{referralChampion.totalScopeActivity || 0}</strong> referrals (All members in {scopeDisplayName})
                  </span>
                </div>
                <Link
                  href={adminReportsPath}
                  className="font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline text-[11px] shrink-0"
                >
                  View Reports →
                </Link>
              </div>
            )}
          </div>

          {/* ================= CARD 2: THANK YOU NOTE / BUSINESS GENERATOR ================= */}
          <div className="relative flex flex-col justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/20 p-3.5 transition-all hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-950/10">
            <div>
              {/* Card Header Tag & Congratulate Action */}
              <div className="mb-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Medal className="h-3.5 w-3.5 text-emerald-600" />
                  Business Generator
                </span>

                {tynTop1?.whatsapp && formatWhatsappLink(
                  tynTop1.whatsapp,
                  `Congratulations ${tynTop1.contactPerson || tynTop1.businessName}! 💎 Applauding your contribution of ${formatCurrency(tynTop1.totalAmount)} business given at RIFAH Chamber! Keep inspiring us!`
                ) && (
                  <a
                    href={formatWhatsappLink(
                      tynTop1.whatsapp,
                      `Congratulations ${tynTop1.contactPerson || tynTop1.businessName}! 💎 Applauding your contribution of ${formatCurrency(tynTop1.totalAmount)} business given at RIFAH Chamber! Keep inspiring us!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  >
                    <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                    Congratulate
                  </a>
                )}
              </div>

              {/* Business Content */}
              {tynTop1 ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      {tynTop1.logo ? (
                        <img
                          src={tynTop1.logo}
                          alt={tynTop1.businessName}
                          className="h-10 w-10 rounded-lg border border-slate-200/80 object-cover dark:border-slate-800"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          {tynTop1.businessName?.charAt(0) || "B"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {tynTop1.businessName}
                      </h4>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {tynTop1.contactPerson || "Member"} · {tynTop1.chapterName || tynTop1.state || "RIFAH"}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(tynTop1.totalAmount)}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500">
                      {tynTop1.noteCount || 1} {tynTop1.noteCount === 1 ? "note" : "notes"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 px-3 rounded-lg border border-dashed border-emerald-300/60 bg-emerald-50/40 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    💎 #1 Spot is currently open!
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Be the first to record a Thank You Note in {scopeDisplayName} to claim #1!
                  </p>
                </div>
              )}
            </div>

            {/* Administrative Summary for Admins (hidden for members since they have dedicated standing card) */}
            {!showMyRank && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200/70 bg-emerald-50/40 px-3 py-2 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>
                    {scopeTotalLabel}: <strong className="font-bold text-slate-900 dark:text-white">{formatCurrency(tynChampion.totalScopeAmount || 0)}</strong> (All members · {tynChampion.totalScopeNotes || 0} notes)
                  </span>
                </div>
                <Link
                  href={adminReportsPath}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline text-[11px] shrink-0"
                >
                  View Reports →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= DEDICATED "MY RANK & STANDING" CARD ================= */}
        {showMyRank && (
          <div className="mt-3 rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70 p-3 shadow-2xs dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80">
            {/* Header / Subtitle */}
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                  🎯
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  My Performance & Standing
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {scopeDisplayName} · {period === "this_month" ? "This Month" : period === "last_month" ? "Last Month" : "All-Time"}
                </span>
              </div>
            </div>

            {/* 2 Sub-Columns: Left = Referrals Given, Right = Business Generated */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {/* My Referrals Rank */}
              <div className="flex flex-col justify-between rounded-lg border border-amber-200/80 bg-amber-50/50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">Referrals Given:</span>
                    {refStatus.isChampion ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        #1 Champion 🏆
                      </span>
                    ) : refStatus.rank ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        Rank #{refStatus.rank} ({refStatus.score} given)
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Unranked (0 given)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReferralDialogOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-[11px] font-bold text-white shadow-2xs transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 shrink-0"
                  >
                    + Pass Referral
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                  {refStatus.isChampion ? (
                    "🎉 Mubarak! You are currently leading as the #1 Referral Champion!"
                  ) : refStatus.rank && refStatus.gapToTop > 0 ? (
                    <span>
                      Pass <strong className="font-bold text-amber-700 dark:text-amber-400">{refStatus.gapToTop} more referral{refStatus.gapToTop === 1 ? "" : "s"}</strong> to claim the #1 spot! 🚀
                    </span>
                  ) : refStatus.rank ? (
                    <span>
                      Pass <strong className="font-bold text-amber-700 dark:text-amber-400">1 more referral</strong> to claim the #1 spot! 🚀
                    </span>
                  ) : (
                    "Pass your 1st referral to enter the leaderboard rankings! 🚀"
                  )}
                </p>
              </div>

              {/* My Business Rank */}
              <div className="flex flex-col justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Business Given:</span>
                    {tynStatus.isChampion ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        #1 Champion 💎
                      </span>
                    ) : tynStatus.rank ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        Rank #{tynStatus.rank} ({formatCurrency(tynStatus.totalAmount)})
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Unranked (₹0 given)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsThankYouDialogOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-2xs transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shrink-0"
                  >
                    + Send TY Note
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                  {tynStatus.isChampion ? (
                    "🎉 Mubarak! You are currently leading as the #1 Business Generator!"
                  ) : tynStatus.rank && tynStatus.gapToTop > 0 ? (
                    <span>
                      Give <strong className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(tynStatus.gapToTop)} more</strong> to claim the #1 spot! 🚀
                    </span>
                  ) : tynStatus.rank ? (
                    <span>
                      Give more business to claim the #1 spot! 🚀
                    </span>
                  ) : (
                    "Record your 1st Thank You Note to enter the leaderboard rankings! 🚀"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== DIRECT POPUP: THANK YOU NOTE DIALOG ==================== */}
      <Dialog
        open={isThankYouDialogOpen}
        onOpenChange={(open) => {
          setIsThankYouDialogOpen(open);
          if (!open) {
            setThankYouMember(null);
            setThankYouAmount("");
            setThankYouNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Give a Thank You Note</DialogTitle>
            <DialogDescription>
              Thank a member who gave you business. This adds directly to their champion business score!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Select Member *</Label>
              <MemberPicker
                idPrefix="spotlight-ty"
                value={thankYouMember}
                excludeBusinessId={myBusiness?._id}
                onChange={setThankYouMember}
                disabled={isSavingThankYou}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="spotlight-ty-amount" className="text-xs font-medium">
                Business Amount (₹) *
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="spotlight-ty-amount"
                  type="number"
                  min="1"
                  className="pl-9 h-10 text-xs sm:text-sm"
                  placeholder="e.g. 50000"
                  value={thankYouAmount}
                  onChange={(e) => setThankYouAmount(e.target.value)}
                  disabled={isSavingThankYou}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="spotlight-ty-note" className="text-xs font-medium">
                Note / Remarks (optional)
              </Label>
              <Textarea
                id="spotlight-ty-note"
                rows={2}
                placeholder="e.g. Thanks for the client referral that closed this deal"
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value)}
                disabled={isSavingThankYou}
                className="text-xs sm:text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsThankYouDialogOpen(false)}
              disabled={isSavingThankYou}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveThankYou}
              disabled={isSavingThankYou}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSavingThankYou ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Thank You Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIRECT POPUP: REFERRAL DIALOG ==================== */}
      <Dialog
        open={isReferralDialogOpen}
        onOpenChange={(open) => {
          setIsReferralDialogOpen(open);
          if (!open) {
            setReferralMember(null);
            setReferralForm({ leadName: "", leadContact: "", leadIsMember: false, description: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Pass a Referral</DialogTitle>
            <DialogDescription>
              Select the fellow member whose business you are referring your contact or deal to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Referring to Member *</Label>
              <MemberPicker
                idPrefix="spotlight-ref"
                value={referralMember}
                excludeBusinessId={myBusiness?._id}
                onChange={setReferralMember}
                disabled={isSavingReferral}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="spotlight-lead-name" className="text-xs font-medium">
                Contact / Lead Name *
              </Label>
              <Input
                id="spotlight-lead-name"
                placeholder="e.g. Rajesh Kumar"
                value={referralForm.leadName}
                onChange={(e) => setReferralForm((f) => ({ ...f, leadName: e.target.value }))}
                disabled={isSavingReferral}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="spotlight-lead-contact" className="text-xs font-medium">
                Contact Phone / Email (optional)
              </Label>
              <Input
                id="spotlight-lead-contact"
                placeholder="e.g. 98765 43210"
                value={referralForm.leadContact}
                onChange={(e) => setReferralForm((f) => ({ ...f, leadContact: e.target.value }))}
                disabled={isSavingReferral}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none py-0.5">
              <Checkbox
                checked={referralForm.leadIsMember}
                onCheckedChange={(c) => setReferralForm((f) => ({ ...f, leadIsMember: Boolean(c) }))}
                disabled={isSavingReferral}
              />
              <span>This contact is already a RIFAH member</span>
            </label>

            <div className="space-y-1">
              <Label htmlFor="spotlight-lead-desc" className="text-xs font-medium">
                Requirement / Description *
              </Label>
              <Textarea
                id="spotlight-lead-desc"
                rows={2}
                placeholder="e.g. Looking for electrical cabling supply for a new commercial site"
                value={referralForm.description}
                onChange={(e) => setReferralForm((f) => ({ ...f, description: e.target.value }))}
                disabled={isSavingReferral}
                className="text-xs sm:text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReferralDialogOpen(false)}
              disabled={isSavingReferral}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReferral}
              disabled={isSavingReferral}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSavingReferral ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pass Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TopPerformerSpotlight;
