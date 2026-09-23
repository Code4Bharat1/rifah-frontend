"use client";
import { Star, MoreHorizontal, Plus, Edit3, Trash2, CheckCircle2, ShieldCheck, Sparkles, Layers } from "lucide-react";
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
import { useAuth } from "@shared/providers/auth-provider";

function AdminMemberships() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManagePlans = user?.role !== "chapter_admin";

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

  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "directory"

  const filteredBusinesses = businesses.filter((b) => {
    const mem = (b.membership || "").toLowerCase();
    if (filter === "has_plan") return activePlanNames.has(mem);
    if (filter === "verified") return b.verification === "verified";
    return true;
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
        canManagePlans && (
          <Button onClick={() => openModal()} className="gap-2 shadow-sm font-semibold" size="sm">
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        )
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total members"
            value={String(businesses.length)}
            icon={Star}
            tone="primary"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <StatCard
            label="Membership plans"
            value={String(activePlanNames.size)}
            icon={Layers}
            tone="success"
            active={false}
          />
          <StatCard
            label="Members on active plans"
            value={String(businesses.filter((b) => activePlanNames.has(String(b.membership || "").toLowerCase())).length)}
            active={filter === "has_plan"}
            onClick={() => setFilter("has_plan")}
          />
          <StatCard
            label="Verified"
            value={String(businesses.filter((b) => b.verification === "verified").length)}
            tone="warning"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold">
              {filter === "all" ? "Member subscriptions" 
              : filter === "has_plan" ? "Members on active plans" 
              : "Verified Members"}
            </h2>
            
            {user?.role === "chapter_admin" && (
              <div className="flex bg-muted p-1 rounded-lg self-start sm:self-auto border border-border">
                <Button size="sm" variant={viewMode === "list" ? "default" : "ghost"} onClick={() => setViewMode("list")} className="h-8">List View</Button>
                <Button size="sm" variant={viewMode === "directory" ? "default" : "ghost"} onClick={() => setViewMode("directory")} className="h-8">Directory View</Button>
              </div>
            )}
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
                
                return (
                  <div key={b._id} className="border border-border rounded-xl bg-card overflow-hidden shadow-sm flex flex-col relative transition-all hover:shadow-md">
                    <div className="absolute top-3 left-3 text-sm font-bold text-muted-foreground w-6 h-6 flex items-center justify-center">
                      {idx + 1}.
                    </div>
                    <div className="p-4 pl-10 flex gap-4 border-b border-border bg-muted/5">
                      <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                        {b.logo || owner.avatar ? (
                          <img src={b.logo || owner.avatar} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-foreground truncate pr-2">{name}</h3>
                        <p className="text-sm font-medium text-foreground leading-tight mt-1">
                          {b.name} <span className="text-muted-foreground font-normal text-xs ml-1">• {role} • {b.membership.toUpperCase()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 truncate flex items-center gap-1">
                          {location} <span className="text-border">|</span> {industry}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-3 flex-1 text-sm bg-background">
                      <div>
                        <span className="font-bold text-amber-500 mr-2">ASK:</span>
                        <span className="text-foreground/90">{ask}</span>
                      </div>
                      <div>
                        <span className="font-bold text-green-600 mr-2">GIVE:</span>
                        <span className="text-foreground/90">{give}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 px-4 border-t border-border bg-muted/10 text-xs flex flex-wrap gap-x-6 gap-y-2 items-center">
                      {b.whatsapp || b.whatsappNumber ? (
                        <div className="flex gap-1.5 items-center">
                          <span className="font-bold text-green-600">WhatsApp:</span> 
                          <span className="font-medium text-foreground">{b.whatsapp || b.whatsappNumber}</span>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 items-center">
                          <span className="font-bold text-foreground">Phone:</span> 
                          <span className="font-medium text-foreground">{b.phone || owner.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-1.5 items-center ml-auto">
                        <span className="font-bold text-foreground">Email:</span> 
                        <span className="font-medium text-foreground truncate max-w-[150px]">{b.email || owner.email}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          <ResponsiveTable
            rows={filteredBusinesses}
            columns={[
              { key: "name", header: "Business", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "tier", header: "Tier", cell: (r) => <MembershipBadge tier={r.membership} /> },
              { key: "chapter", header: "Chapter", cell: (r) => r.chapter },
              { key: "ver", header: "Verification", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-semibold" onClick={() => handleViewDetails(r)}>
                        View Details
                      </DropdownMenuItem>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{r.name}</p>
                  <MembershipBadge tier={r.membership} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill>{r.chapter}</Pill>
                  <VerificationBadge status={r.verification} compact />
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border flex justify-end gap-2">
                   {activePlans.slice(0, 1).map(([planId, plan]) => (
                     <Button key={planId} variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(r._id, { membership: plan.name })} disabled={r.membership === plan.name}>
                       Set {plan.name}
                     </Button>
                   ))}
                   <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(r._id, { verification: "verified" })} disabled={r.verification === "verified"}>
                     Verify
                   </Button>
                </div>
              </div>
            )}
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
          
          {selectedBusiness && (
            <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto px-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedBusiness.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Owner: {selectedBusiness.ownerName || "Business Owner"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MembershipBadge tier={selectedBusiness.membership} />
                  <VerificationBadge status={selectedBusiness.verification} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</p>
                  <p className="text-sm">{selectedBusiness.email || "No email"}</p>
                  <p className="text-sm">{selectedBusiness.phone || "No phone"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Location / Chapter</p>
                  <p className="text-sm">{selectedBusiness.city}, {selectedBusiness.state}</p>
                  <p className="text-sm font-medium">{selectedBusiness.chapter}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold">Subscription Details</h4>
                  <div className="flex gap-2">
                    {activePlans.map(([planId, plan]) => (
                      <Button key={planId} variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(selectedBusiness._id, { membership: plan.name })} disabled={selectedBusiness.membership === plan.name}>
                        Set {plan.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Joined At</p>
                    <p className="text-sm font-medium">{new Date(selectedBusiness.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Industry / Type</p>
                    <p className="text-sm font-medium">{selectedBusiness.industry} · {selectedBusiness.businessType}</p>
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
          )}
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
