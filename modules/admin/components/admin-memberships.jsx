"use client";
import {
  Star, MoreHorizontal, Plus, Edit3, Trash2, CheckCircle2, ShieldCheck, Sparkles, Layers,
  Phone, Mail, MessageSquare, Download, FileText, Share2, Award, Copy, Check, ExternalLink,
  Calendar, Users, Crown
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@shared/components/rifah/app-shell";
import { cn } from "@shared/lib/utils";
import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useMembershipPlans, useBusinesses } from "@shared/hooks/use-rifah-api";
import { businessApi, membershipApi, paymentApi } from "@shared/lib/api-services";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";
import { downloadCertificatePdf } from "@shared/lib/certificate-generator";
import { downloadInvoicePdf } from "@shared/lib/invoice-generator";

function AdminMemberships() {
  const { user } = useAuth();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isChapterAdmin = pathname?.startsWith("/chapter-admin") || user?.role === "chapter_admin";
  const canManagePlans = mounted && !isChapterAdmin && user?.role !== "chapter_admin";
  const canManageTierAndStatus = mounted && !isChapterAdmin && user?.role !== "chapter_admin";

  const { data: plansData, refetch: refetchPlans } = useMembershipPlans();
  const { data: businessesData, refetch: refetchBusinesses } = useBusinesses();

  const plans = plansData || {};
  const activePlanNames = new Set(
    Object.values(plans)
      .filter((plan) => plan.isActive !== false)
      .map((plan) => String(plan.name || "").toLowerCase())
  );
  const activePlans = Object.entries(plans).filter(([, plan]) => plan.isActive !== false);
  const rawBusinesses = Array.isArray(businessesData) ? businessesData : [];
  // Per business rule: Only verified businesses are officially RIFAH members
  const businesses = rawBusinesses.filter(b => b.verification === "verified" || b.isVerified === true);

  // Separation logic: Free vs Rifah (Paid/Tier) members
  const isFreeMember = (b) => {
    const m = String(b?.membership || "").toLowerCase().trim();
    return !m || m === "free" || m === "free member" || m.includes("free") || m === "tier i (free)";
  };

  const isRifahMember = (b) => !isFreeMember(b);

  const getRifahId = (b) => {
    if (b?.membershipId) return b.membershipId;
    if (b?._id) return `RIFAH-MEM-${String(b._id).slice(-6).toUpperCase()}`;
    return "RIFAH-MEM-0001";
  };

  const getMembershipExpiryInfo = (b) => {
    if (isFreeMember(b)) {
      return {
        date: null,
        formatted: "Lifetime / Free",
        isExpired: false,
        isFree: true,
      };
    }

    const rawDate = b?.membershipExpiryDate || b?.expiresAt || b?.renewalDate;
    let expiryDate;
    if (rawDate) {
      expiryDate = new Date(rawDate);
    } else {
      const start = new Date(b?.joiningDate || b?.createdAt || "2025-01-01T00:00:00Z");
      const memName = String(b?.membership || "").toLowerCase();
      const matchedPlan = Object.values(plans).find(
        (p) => String(p?.name || "").toLowerCase() === memName || String(p?.planId || "").toLowerCase() === memName
      );
      const years = matchedPlan?.durationYears || 1;
      expiryDate = new Date(start);
      expiryDate.setFullYear(expiryDate.getFullYear() + years);
    }

    const isExpired = expiryDate.getTime() < (typeof window !== "undefined" ? Date.now() : 1735689600000);
    const formatted = expiryDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      date: expiryDate,
      formatted,
      isExpired,
      isFree: false,
    };
  };

  const getContactLinks = (b) => {
    const owner = b?.owner || {};
    const phone = b?.phone || b?.whatsapp || b?.whatsappNumber || owner.phone || "";
    const waNumber = b?.whatsapp || b?.whatsappNumber || b?.phone || owner.phone || "";
    const email = b?.email || owner.email || "";

    const cleanWa = String(waNumber).replace(/[^0-9]/g, "");
    const waFormatted = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;

    return {
      phone,
      email,
      callUrl: phone ? `tel:${phone}` : null,
      waUrl: waFormatted ? `https://wa.me/${waFormatted}` : null,
      emailUrl: email ? `mailto:${email}` : null,
    };
  };

  const copyToClipboard = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (e) {
      toast.info(`${label}: ${text}`);
    }
  };

  const handleDownloadCertificate = async (business) => {
    const toastId = toast.loading(`Generating certificate for ${business.name}...`);
    try {
      await downloadCertificatePdf(business);
      toast.success("Certificate downloaded successfully", { id: toastId });
    } catch (err) {
      console.error("Certificate download error:", err);
      toast.error("Failed to generate certificate PDF", { id: toastId });
    }
  };

  const handleDownloadInvoice = async (business) => {
    const toastId = toast.loading(`Preparing payment invoice for ${business.name}...`);
    try {
      let paymentRecord = null;
      try {
        const res = await paymentApi.getAllPayments({ businessId: business._id });
        const payments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (payments.length > 0) {
          paymentRecord = payments.find(p => p.status === "Paid" || p.status === "paid" || p.status === "success") || payments[0];
        }
      } catch (err) {
        console.warn("Could not fetch recorded payments, falling back to invoice generator:", err);
      }

      if (!paymentRecord) {
        const memName = String(business.membership || "").toLowerCase();
        const matchedPlan = Object.values(plans).find(
          (p) => String(p?.name || "").toLowerCase() === memName || String(p?.planId || "").toLowerCase() === memName
        );
        const amount = matchedPlan?.price ?? (isFreeMember(business) ? 0 : 5000);

        paymentRecord = {
          _id: business._id,
          invoiceNumber: `INV-${String(business.membershipId || business._id).replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "1001"}`,
          amount: amount,
          subtotal: Math.round(amount / 1.18),
          gstRate: 18,
          gstAmount: amount - Math.round(amount / 1.18),
          status: "Paid",
          paidAt: business.joiningDate || business.createdAt || new Date(),
          createdAt: business.joiningDate || business.createdAt || new Date(),
          payer: {
            name: business.contactPerson || business.owner?.name || business.name,
            email: business.email || business.owner?.email || "",
            phone: business.phone || business.owner?.phone || "",
          },
          description: `${business.membership || "RIFAH"} Membership Subscription`,
          business: business,
        };
      }

      await downloadInvoicePdf(paymentRecord, business);
      toast.success("Invoice downloaded successfully", { id: toastId });
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Failed to generate invoice PDF. Please try again.", { id: toastId });
    }
  };

  const handleShareProfile = async (business) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const profileUrl = `${origin}/business/${business.slug || business._id}`;
    const shareTitle = `${business.name} | RIFAH Chamber of Commerce`;
    const shareText = `Explore ${business.name}'s profile on RIFAH Chamber: ${profileUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: profileUrl,
        });
        return;
      } catch (e) {
        if (e.name !== "AbortError") {
          // fallback to clipboard
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (e) {
      toast.info(`Profile link: ${profileUrl}`);
    }
  };

  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "directory"

  const totalMembersCount = businesses.length;
  const rifahMembersCount = businesses.filter(isRifahMember).length;
  const freeMembersCount = businesses.filter(isFreeMember).length;
  const verifiedMembersCount = businesses.filter((b) => b.verification === "verified" || b.isVerified === true).length;

  const filteredBusinesses = businesses.filter((b) => {
    if (filter === "rifah") return isRifahMember(b);
    if (filter === "free") return isFreeMember(b);
    if (filter === "has_plan") return isRifahMember(b);
    if (filter === "verified") return b.verification === "verified" || b.isVerified === true;
    return true; // "all"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    planId: "", name: "", price: 0, priceUsd: 0, durationYears: 1, gstRate: 18,
    displayOrder: 0, isRecommended: false, isActive: true, summary: "", features: "", missingFeatures: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [businessInvoices, setBusinessInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [deletePlanId, setDeletePlanId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateStatus = async (businessId, updates) => {
    try {
      await businessApi.updateStatus(businessId, updates);
      toast.success("Business profile updated successfully");
      refetchBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to update business.");
    }
  };

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlanId(plan.planId || plan.id);
      setFormData({
        planId: plan.planId || plan.id,
        name: plan.name || "",
        price: plan.price ?? 0,
        priceUsd: plan.priceUsd ?? 0,
        durationYears: plan.durationYears ?? 1,
        gstRate: plan.gstRate ?? 18,
        displayOrder: plan.displayOrder ?? 0,
        isRecommended: Boolean(plan.isRecommended),
        isActive: plan.isActive !== false,
        summary: plan.summary || "",
        features: Array.isArray(plan.features) ? plan.features.join("\n") : (plan.features || ""),
        missingFeatures: Array.isArray(plan.missingFeatures) ? plan.missingFeatures.join("\n") : (plan.missingFeatures || ""),
      });
    } else {
      setEditingPlanId(null);
      setFormData({
        planId: "", name: "", price: 0, priceUsd: 0, durationYears: 1, gstRate: 18,
        displayOrder: Object.keys(plans).length, isRecommended: false, isActive: true, summary: "", features: "", missingFeatures: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleViewDetails = async (business) => {
    setSelectedBusiness(business);
    setIsDetailOpen(true);
    setLoadingInvoices(true);
    try {
      const res = await paymentApi.getAllPayments({ businessId: business._id });
      setBusinessInvoices(Array.isArray(res?.data) ? res.data : (res || []));
    } catch (err) {
      if (err.status === 401 || err.message?.includes("Authentication")) {
        toast.error("Session expired or unauthorized to view invoices.");
      } else {
        toast.error("Failed to load invoices");
      }
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSavePlan = async () => {
    if (!formData.planId || !formData.name) return toast.error("Plan ID and Display Name are required");
    setIsSaving(true);
    try {
      const payload = {
        planId: formData.planId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-"),
        name: formData.name.trim(),
        price: Math.max(0, Number(formData.price) || 0),
        priceUsd: Math.max(0, Number(formData.priceUsd) || 0),
        durationYears: Math.max(1, Number(formData.durationYears) || 1),
        gstRate: Math.max(0, Number(formData.gstRate) || 0),
        displayOrder: Number(formData.displayOrder) || 0,
        isRecommended: Boolean(formData.isRecommended),
        isActive: Boolean(formData.isActive),
        summary: formData.summary.trim(),
        features: formData.features.split(/\r?\n/).map(f => f.trim()).filter(Boolean),
        missingFeatures: formData.missingFeatures.split(/\r?\n/).map(f => f.trim()).filter(Boolean),
      };

      if (editingPlanId) {
        await membershipApi.updatePlan(editingPlanId, payload);
        toast.success(`Plan "${payload.name}" updated successfully`);
      } else {
        await membershipApi.createPlan(payload);
        toast.success(`Plan "${payload.name}" created successfully`);
      }
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      refetchPlans();
    } catch (err) {
      toast.error(err.message || "Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    setIsDeleting(true);
    try {
      await membershipApi.deletePlan(deletePlanId);
      toast.success("Plan deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      refetchPlans();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
      setDeletePlanId(null);
    }
  };

  // Live computed price in modal
  const modalBasePrice = Math.max(0, Number(formData.price) || 0);
  const modalGstRate = Math.max(0, Number(formData.gstRate) || 0);
  const modalGstAmt = Math.round(modalBasePrice * modalGstRate / 100);
  const modalTotal = modalBasePrice + modalGstAmt;

  return (
    <AppShell 
      role="admin" 
      title="Memberships" 
      subtitle="Tiers, subscription plans and member allocations"
      actions={
        canManagePlans ? (
          <Button onClick={() => openModal()} className="gap-2 shadow-sm font-semibold" size="sm">
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total members"
            value={String(totalMembersCount)}
            icon={Users}
            tone="primary"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <StatCard
            label="Rifah members"
            value={String(rifahMembersCount)}
            icon={Crown}
            tone="warning"
            active={filter === "rifah"}
            onClick={() => setFilter("rifah")}
          />
          <StatCard
            label="Free members"
            value={String(freeMembersCount)}
            icon={Star}
            tone="neutral"
            active={filter === "free"}
            onClick={() => setFilter("free")}
          />
          <StatCard
            label="Verified"
            value={String(verifiedMembersCount)}
            icon={ShieldCheck}
            tone="success"
            active={filter === "verified"}
            onClick={() => setFilter("verified")}
          />
        </div>

        {canManagePlans && (
          <Panel 
            title="Membership Tier Structure" 
            description="Manage all subscription plans. Any edit or addition made here instantly updates public pricing, checkout, and registration."
            action={
              <Button onClick={() => openModal()} size="sm" variant="outline" className="gap-1.5 shadow-2xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add New Plan
              </Button>
            }
          >
            <div className="pt-2">
              <ChamberMembershipTiers
                plansData={plansData}
                showHeader={false}
                showFooter={false}
                showInactive={true}
                showTheory={false}
                renderCardFooter={(plan) => (
                  <div className="flex items-center gap-2 w-full mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 rounded-full font-bold flex-1 gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/40 text-xs shadow-2xs cursor-pointer"
                      onClick={() => openModal(plan)}
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Delete Plan"
                      onClick={() => { setDeletePlanId(plan.id || plan.planId); setIsDeleteDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            </div>
          </Panel>
        )}

        <Panel>
          <div className="flex flex-col gap-3.5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-foreground">
                  {filter === "all" ? "All Chapter Members" 
                  : filter === "rifah" ? "Rifah Members (Paid Tiers)" 
                  : filter === "free" ? "Free Members" 
                  : "Verified Members"}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {filteredBusinesses.length}
                </span>
              </div>
              
              <div className="flex bg-muted p-1 rounded-lg self-start sm:self-auto border border-border">
                <Button size="sm" variant={viewMode === "list" ? "default" : "ghost"} onClick={() => setViewMode("list")} className="h-8 text-xs font-semibold">List View</Button>
                <Button size="sm" variant={viewMode === "directory" ? "default" : "ghost"} onClick={() => setViewMode("directory")} className="h-8 text-xs font-semibold">Directory View</Button>
              </div>
            </div>

            {/* Sub-Tabs / Filter pills to easily separate Free vs Rifah members */}
            <div className="flex items-center gap-2 flex-wrap border-t border-border/60 pt-3">
              <Button 
                size="sm" 
                variant={filter === "all" ? "default" : "outline"} 
                onClick={() => setFilter("all")} 
                className="h-7 text-xs font-medium"
              >
                All Members ({totalMembersCount})
              </Button>
              <Button 
                size="sm" 
                variant={filter === "rifah" ? "default" : "outline"} 
                onClick={() => setFilter("rifah")} 
                className={cn(
                  "h-7 text-xs font-medium gap-1.5",
                  filter === "rifah" ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600" : "text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                )}
              >
                <Crown className="h-3 w-3" />
                Rifah Members ({rifahMembersCount})
              </Button>
              <Button 
                size="sm" 
                variant={filter === "free" ? "default" : "outline"} 
                onClick={() => setFilter("free")} 
                className="h-7 text-xs font-medium"
              >
                Free Members ({freeMembersCount})
              </Button>
              <Button 
                size="sm" 
                variant={filter === "verified" ? "default" : "outline"} 
                onClick={() => setFilter("verified")} 
                className="h-7 text-xs font-medium"
              >
                Verified ({verifiedMembersCount})
              </Button>
            </div>
          </div>
          
          {viewMode === "directory" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredBusinesses.map((b, idx) => {
                const owner = b.owner || {};
                const name = owner.name || b.contactPerson || "Member";
                const role = b.roleInBusiness || owner.roleInBusiness || b.designation || "Member";
                const location = [b.city, b.state].filter(Boolean).join(", ");
                const industry = b.categories?.length > 0 ? b.categories.join(", ") : b.industry;
                const ask = owner.sourcingInterest || "Looking for reliable business partners and networking opportunities.";
                const give = b.productsSummary?.join(", ") || b.servicesSummary?.join(", ") || b.about || "Quality products and services in our industry.";
                const rid = getRifahId(b);
                const exp = getMembershipExpiryInfo(b);
                const links = getContactLinks(b);

                return (
                  <div key={b._id} className="border border-border rounded-xl bg-card overflow-hidden shadow-xs flex flex-col relative transition-all hover:shadow-md">
                    <div className="absolute top-3 left-3 text-xs font-bold text-muted-foreground w-6 h-6 flex items-center justify-center bg-muted rounded-full">
                      {idx + 1}
                    </div>

                    <div className="p-4 pl-11 flex gap-3.5 border-b border-border bg-muted/5">
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/80 shadow-2xs">
                        {b.logo || owner.avatar ? (
                          <img src={b.logo || owner.avatar} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-foreground truncate">{name}</h3>
                          <MembershipBadge tier={b.membership} />
                        </div>

                        <p className="text-sm font-semibold text-foreground/90 leading-tight mt-1 truncate">
                          {b.name} <span className="text-muted-foreground font-normal text-xs">• {role}</span>
                        </p>

                        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                          {/* Rifah ID badge with copy */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rid, "Rifah ID")}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors group cursor-pointer"
                            title="Click to copy Rifah ID"
                          >
                            <span>ID: {rid}</span>
                            <Copy className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
                          </button>

                          {/* Expiration date */}
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border",
                            exp.isFree
                              ? "bg-muted/80 text-muted-foreground border-border/60"
                              : exp.isExpired
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          )}>
                            <Calendar className="h-3 w-3" />
                            {exp.isFree ? "Lifetime Member" : `Expires: ${exp.formatted}`}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1.5 truncate flex items-center gap-1.5">
                          {location && <span>{location}</span>}
                          {location && industry && <span className="text-border">|</span>}
                          {industry && <span>{industry}</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-2.5 flex-1 text-sm bg-background">
                      <div>
                        <span className="font-bold text-amber-500 mr-2 text-xs uppercase tracking-wider">ASK:</span>
                        <span className="text-foreground/90">{ask}</span>
                      </div>
                      <div>
                        <span className="font-bold text-green-600 mr-2 text-xs uppercase tracking-wider">GIVE:</span>
                        <span className="text-foreground/90">{give}</span>
                      </div>
                    </div>
                    
                    {/* Contact Quick Action Bar */}
                    <div className="px-4 py-2.5 border-t border-border bg-muted/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {links.callUrl ? (
                          <a
                            href={links.callUrl}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors font-medium text-xs shadow-2xs"
                            title={`Call ${links.phone}`}
                          >
                            <Phone className="h-3 w-3 text-primary" />
                            <span>Call</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/40 text-muted-foreground/40 text-xs cursor-not-allowed">
                            <Phone className="h-3 w-3" />
                            <span>Call</span>
                          </span>
                        )}

                        {links.waUrl ? (
                          <a
                            href={links.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium text-xs shadow-2xs"
                            title={`WhatsApp ${links.phone}`}
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/40 text-muted-foreground/40 text-xs cursor-not-allowed">
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </span>
                        )}

                        {links.emailUrl ? (
                          <a
                            href={links.emailUrl}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-foreground hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors font-medium text-xs shadow-2xs"
                            title={`Email ${links.email}`}
                          >
                            <Mail className="h-3 w-3 text-blue-600" />
                            <span>Email</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/40 text-muted-foreground/40 text-xs cursor-not-allowed">
                            <Mail className="h-3 w-3" />
                            <span>Email</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Bar: Certificate, Invoice, Share Profile, View 360 */}
                    <div className="p-3 px-4 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1.5 font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer"
                          onClick={() => handleDownloadCertificate(b)}
                          title="Download Membership Certificate PDF"
                        >
                          <Award className="h-3.5 w-3.5 text-primary" />
                          <span>Certificate</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1.5 font-medium hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/40 cursor-pointer"
                          onClick={() => handleDownloadInvoice(b)}
                          title="Download Payment Invoice PDF"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          <span>Invoice</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1.5 font-medium hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/40 cursor-pointer"
                          onClick={() => handleShareProfile(b)}
                          title="Share Member Profile"
                        >
                          <Share2 className="h-3.5 w-3.5 text-purple-600" />
                          <span>Share</span>
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-semibold hover:text-primary cursor-pointer ml-auto"
                        onClick={() => handleViewDetails(b)}
                      >
                        Details →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          <ResponsiveTable
            rows={filteredBusinesses}
            columns={[
              {
                key: "name",
                header: "Member / Business",
                cell: (r) => {
                  const contact = r.contactPerson || r.owner?.name;
                  return (
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-border/60">
                        {r.logo ? (
                          <img src={r.logo} alt={r.name} className="h-full w-full object-cover" />
                        ) : (
                          (r.name || "M").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 max-w-[190px]">
                        <span 
                          className="font-semibold text-foreground block truncate hover:text-primary transition-colors cursor-pointer" 
                          onClick={() => handleViewDetails(r)}
                        >
                          {r.name}
                        </span>
                        {contact && (
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {contact}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "rifahId",
                header: "Rifah ID",
                cell: (r) => {
                  const rid = getRifahId(r);
                  return (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(rid, "Rifah ID")}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/5 hover:bg-primary/15 text-primary transition-colors border border-primary/20 group cursor-pointer"
                      title="Click to copy Rifah ID"
                    >
                      <span>{rid}</span>
                      <Copy className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                },
              },
              { key: "tier", header: "Tier", cell: (r) => <MembershipBadge tier={r.membership} /> },
              {
                key: "expiry",
                header: "Expiry Date",
                cell: (r) => {
                  const exp = getMembershipExpiryInfo(r);
                  if (exp.isFree) {
                    return (
                      <span className="inline-flex items-center text-xs text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted/60 border border-border/50">
                        Lifetime / Free
                      </span>
                    );
                  }
                  return (
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border whitespace-nowrap",
                      exp.isExpired 
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" 
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                      <Calendar className="h-3 w-3" />
                      {exp.formatted}
                      {exp.isExpired && <span className="text-[10px] uppercase font-bold">(Expired)</span>}
                    </span>
                  );
                },
              },
              { key: "ver", header: "Verification", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "contact",
                header: "Contact Links",
                cell: (r) => {
                  const links = getContactLinks(r);
                  return (
                    <div className="flex items-center gap-1">
                      {links.callUrl ? (
                        <a
                          href={links.callUrl}
                          title={`Call ${links.phone}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border/60"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/30 border border-border/30 cursor-not-allowed">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                      )}

                      {links.waUrl ? (
                        <a
                          href={links.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`WhatsApp ${links.phone}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/30 border border-border/30 cursor-not-allowed">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </span>
                      )}

                      {links.emailUrl ? (
                        <a
                          href={links.emailUrl}
                          title={`Email ${links.email}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors border border-border/60"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/30 border border-border/30 cursor-not-allowed">
                          <Mail className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "docs",
                header: "Documents",
                cell: (r) => (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/40 cursor-pointer"
                      title="Download Membership Certificate"
                      onClick={() => handleDownloadCertificate(r)}
                    >
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden xl:inline">Cert</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 font-medium hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/40 cursor-pointer"
                      title="Download Payment Invoice"
                      onClick={() => handleDownloadInvoice(r)}
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span className="hidden xl:inline">Invoice</span>
                    </Button>
                  </div>
                ),
              },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-semibold cursor-pointer" onClick={() => handleViewDetails(r)}>
                        View 360 Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleDownloadCertificate(r)}>
                        <Award className="h-4 w-4 text-primary" /> Download Certificate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleDownloadInvoice(r)}>
                        <FileText className="h-4 w-4 text-blue-600" /> Download Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleShareProfile(r)}>
                        <Share2 className="h-4 w-4 text-purple-600" /> Share Profile
                      </DropdownMenuItem>

                      {canManageTierAndStatus && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Manage Tier</DropdownMenuLabel>
                          {activePlans.map(([planId, plan]) => (
                            <DropdownMenuItem key={planId} onClick={() => handleUpdateStatus(r._id, { membership: plan.name })} disabled={r.membership === plan.name}>
                              Set to {plan.name}
                            </DropdownMenuItem>
                          ))}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Verification</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { verification: "verified" })} disabled={r.verification === "verified"}>
                            Mark Verified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { verification: "pending" })} disabled={r.verification === "pending"}>
                            Set Pending
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { featured: !r.featured })}>
                            {r.featured ? "Remove from Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            mobile={(r) => {
              const rid = getRifahId(r);
              const exp = getMembershipExpiryInfo(r);
              const links = getContactLinks(r);
              return (
                <div className="rounded-xl border border-border p-3.5 space-y-3 bg-card shadow-2xs">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div>
                      <p className="min-w-0 font-semibold text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.contactPerson || r.owner?.name}</p>
                    </div>
                    <MembershipBadge tier={r.membership} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(rid, "Rifah ID")}
                      className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                    >
                      ID: {rid}
                    </button>
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded border flex items-center gap-1",
                      exp.isFree
                        ? "bg-muted text-muted-foreground border-border/60"
                        : exp.isExpired
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                      <Calendar className="h-3 w-3" />
                      {exp.isFree ? "Lifetime" : exp.formatted}
                    </span>
                    <VerificationBadge status={r.verification} compact />
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {links.callUrl && (
                        <a href={links.callUrl} className="h-7 w-7 rounded-md flex items-center justify-center border border-border text-foreground hover:text-primary">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {links.waUrl && (
                        <a href={links.waUrl} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-md flex items-center justify-center border border-emerald-500/20 text-emerald-600">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {links.emailUrl && (
                        <a href={links.emailUrl} className="h-7 w-7 rounded-md flex items-center justify-center border border-border text-foreground hover:text-blue-600">
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDownloadCertificate(r)} title="Certificate">
                        <Award className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDownloadInvoice(r)} title="Invoice">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleViewDetails(r)}>
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          )}
        </Panel>
      </div>

      {/* View Member Details Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member 360 View</DialogTitle>
            <DialogDescription>
              Comprehensive overview of the member's profile and membership status.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBusiness && (() => {
            const rid = getRifahId(selectedBusiness);
            const exp = getMembershipExpiryInfo(selectedBusiness);
            const links = getContactLinks(selectedBusiness);
            return (
              <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto px-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedBusiness.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Owner / Contact: {selectedBusiness.contactPerson || selectedBusiness.ownerName || "Business Owner"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rid, "Rifah ID")}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                        title="Click to copy Rifah ID"
                      >
                        <span>ID: {rid}</span>
                        <Copy className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <MembershipBadge tier={selectedBusiness.membership} />
                    <VerificationBadge status={selectedBusiness.verification} />
                  </div>
                </div>

                {/* Quick Document & Share Actions inside Modal */}
                <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs gap-1.5 font-medium hover:bg-primary/10 hover:text-primary cursor-pointer"
                      onClick={() => handleDownloadCertificate(selectedBusiness)}
                    >
                      <Award className="h-3.5 w-3.5 text-primary" /> Download Certificate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs gap-1.5 font-medium hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                      onClick={() => handleDownloadInvoice(selectedBusiness)}
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" /> Download Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs gap-1.5 font-medium hover:bg-purple-500/10 hover:text-purple-600 cursor-pointer"
                      onClick={() => handleShareProfile(selectedBusiness)}
                    >
                      <Share2 className="h-3.5 w-3.5 text-purple-600" /> Share Profile
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</p>
                    <p className="text-sm">{selectedBusiness.email || "No email"}</p>
                    <p className="text-sm">{selectedBusiness.phone || "No phone"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Location</p>
                    <p className="text-sm">{selectedBusiness.city}{selectedBusiness.state ? `, ${selectedBusiness.state}` : ""}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold">Subscription Details</h4>
                    {canManageTierAndStatus && (
                      <div className="flex gap-2">
                        {activePlans.map(([planId, plan]) => (
                          <Button key={planId} variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(selectedBusiness._id, { membership: plan.name })} disabled={selectedBusiness.membership === plan.name}>
                            Set {plan.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Joined At</p>
                      <p className="text-sm font-medium">{new Date(selectedBusiness.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Membership Expiry</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {exp.formatted}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Industry / Type</p>
                      <p className="text-sm font-medium">{selectedBusiness.industry || "General"} · {selectedBusiness.businessType || "Business"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-bold mb-3">Payment History</h4>
                  {loadingInvoices ? (
                    <p className="text-sm text-muted-foreground">Loading invoices...</p>
                  ) : businessInvoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No invoices found for this business.</p>
                  ) : (
                    <div className="space-y-2">
                      {businessInvoices.map(inv => (
                        <div key={inv._id || inv.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                          <div>
                            <p className="font-semibold">{inv.invoiceNumber || "Invoice"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(inv.createdAt || inv.paidAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{inv.amount}</p>
                            <Pill tone={inv.status === "Paid" ? "success" : "warning"}>{inv.status || "Paid"}</Pill>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Plan Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              {editingPlanId ? `Edit Membership Plan: ${formData.name || editingPlanId}` : "Create New Membership Plan"}
            </DialogTitle>
            <DialogDescription>
              Changes made here update pricing, validity, features and checkout for this tier nationwide.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            {/* Section 1: Identifier & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="planId" className="text-xs font-semibold">Plan ID (System Key) *</Label>
                <Input
                  id="planId"
                  placeholder="e.g. silver, platinum, vip"
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  disabled={Boolean(editingPlanId)}
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Unique internal code (cannot be changed after creation).
                </span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Display Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Platinum Partner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-medium"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Public title shown on badges and cards.
                </span>
              </div>
            </div>

            {/* Section 2: Pricing & Validity */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Pricing &amp; Validity
              </h5>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold">Base Price (₹ INR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priceUsd" className="text-xs font-semibold">Base Price ($ USD)</Label>
                  <Input
                    id="priceUsd"
                    type="number"
                    min="0"
                    placeholder="e.g. 325"
                    value={formData.priceUsd}
                    onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="durationYears" className="text-xs font-semibold">Validity Period (Years) *</Label>
                  <Input
                    id="durationYears"
                    type="number"
                    min="1"
                    placeholder="e.g. 1, 2, 10, 25"
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gstRate" className="text-xs font-semibold">GST Rate (%) *</Label>
                  <Input
                    id="gstRate"
                    type="number"
                    min="0"
                    placeholder="e.g. 18"
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Price Computation */}
              <div className="rounded-lg bg-background border border-border p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total with {modalGstRate}% GST:</span>
                  <span className="font-bold text-sm text-foreground">
                    ₹ {modalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground text-right">
                  Base: ₹ {modalBasePrice.toLocaleString("en-IN")}<br/>
                  GST: ₹ {modalGstAmt.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Section 3: Status & Ordering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <Label htmlFor="displayOrder" className="text-xs font-semibold">Display Order (Sort Index)</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                />
                <span className="text-[10px] text-muted-foreground block">
                  Lower numbers appear first (e.g. 0, 1, 2, 3).
                </span>
              </div>

              <div className="space-y-2 pt-2 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isRecommended}
                    onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Mark as Recommended (Featured badge)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Available for purchase (Active)</span>
                </label>
              </div>
            </div>

            {/* Section 4: Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs font-semibold">Short Summary</Label>
              <Input
                id="summary"
                placeholder="e.g. 10-Year Enterprise Patronage with VIP summit passes"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            {/* Section 5: Included Features */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="features" className="text-xs font-semibold">Included Features (One per line)</Label>
                <span className="text-[10px] text-muted-foreground">Each new line becomes a checkmark bullet</span>
              </div>
              <Textarea
                id="features"
                rows={4}
                placeholder={"Directory listing with Verified Chamber Badge\nUnlimited matched buyer lead enquiries\nPriority RFQ & high-value lead routing"}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            {/* Section 6: Excluded Features */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="missingFeatures" className="text-xs font-semibold">Excluded Features (One per line)</Label>
                <span className="text-[10px] text-muted-foreground">Displayed as strikethrough (✕)</span>
              </div>
              <Textarea
                id="missingFeatures"
                rows={3}
                placeholder={"Global Chapter & International Network Access\nCustom expo pavilion & sponsor showcase"}
                value={formData.missingFeatures}
                onChange={(e) => setFormData({ ...formData, missingFeatures: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} disabled={isSaving} className="font-semibold">
              {isSaving ? "Saving..." : editingPlanId ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Membership Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this membership plan? It will no longer be available for business registration or upgrades.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 sm:space-x-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminMemberships };
export default AdminMemberships;
