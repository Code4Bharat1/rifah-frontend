"use client";
import { Star, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
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
      setEditingPlanId(plan.planId);
      setFormData({
        planId: plan.planId,
        name: plan.name,
        price: plan.price,
        priceUsd: plan.priceUsd ?? 0,
        durationYears: plan.durationYears ?? 1,
        gstRate: plan.gstRate ?? 0,
        displayOrder: plan.displayOrder ?? 0,
        isRecommended: Boolean(plan.isRecommended),
        isActive: plan.isActive !== false,
        summary: plan.summary || "",
        features: plan.features ? plan.features.join("\n") : "",
        missingFeatures: plan.missingFeatures ? plan.missingFeatures.join("\n") : "",
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
    if (!formData.planId || !formData.name) return toast.error("ID and Name are required");
    setIsSaving(true);
    try {
      const payload = {
        planId: formData.planId.toLowerCase().trim().replace(/\s+/g, "-"),
        name: formData.name.trim(),
        price: Number(formData.price),
        priceUsd: Number(formData.priceUsd),
        durationYears: Number(formData.durationYears),
        gstRate: Number(formData.gstRate),
        displayOrder: Number(formData.displayOrder),
        isRecommended: Boolean(formData.isRecommended),
        isActive: Boolean(formData.isActive),
        summary: formData.summary.trim(),
        features: formData.features.split(/\r?\n/).map(f => f.trim()).filter(Boolean),
        missingFeatures: formData.missingFeatures.split(/\r?\n/).map(f => f.trim()).filter(Boolean),
      };

      if (editingPlanId) {
        await membershipApi.updatePlan(editingPlanId, payload);
        toast.success("Plan updated successfully");
      } else {
        await membershipApi.createPlan(payload);
        toast.success("Plan created successfully");
      }
      setIsModalOpen(false);
      refetchPlans(); // Live update instead of window.location.reload()
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
      refetchPlans(); // Live update instead of window.location.reload()
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
      setDeletePlanId(null);
    }
  };

  return (
    <AppShell 
      role="admin" 
      title="Memberships" 
      subtitle="Tiers, subscription plans and member allocations"
      actions={
        canManagePlans && (
          <Button onClick={() => openModal()} className="gap-2 shadow-sm" size="sm">
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        )
      }
    >
      <div className="space-y-4">
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
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(plans).map(([key, p]) => {
                const durationYears = p.durationYears || 1;
                const durationLabel = durationYears === 1 ? "1 Year Validity" : `${durationYears} Years Validity`;
                const gstRate = Number(p.gstRate ?? 0);
                const gstAmt = Math.round((p.price || 0) * gstRate / 100);
                const totalWithGst = (p.price || 0) + gstAmt;
                return (
                  <div key={key} className="rounded-xl border border-border p-4 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openModal({ planId: key, ...p })}>
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => { setDeletePlanId(key); setIsDeleteDialogOpen(true); }}>
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="truncate text-sm font-bold">{p.name}</p>
                          {p.isRecommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">Recommended</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          ₹ {(p.price || 0).toLocaleString("en-IN")} base · {durationLabel}
                        </p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">
                          + ₹{gstAmt.toLocaleString("en-IN")} GST ({gstRate}%) = <strong>₹{totalWithGst.toLocaleString("en-IN")}</strong> total
                        </p>
                      </div>
                      <Pill tone="brand">{durationLabel}</Pill>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                    <ul className="mt-3 space-y-1.5">
                      {p.features?.map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          · {f}
                        </li>
                      ))}
                    </ul>
                    {p.missingFeatures?.length > 0 && (
                      <ul className="mt-1.5 space-y-1 opacity-50">
                        {p.missingFeatures.map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground line-through">
                            ✕ {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPlanId ? "Edit Membership Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="planId">Plan ID (e.g. platinum)</Label>
              <Input
                id="planId"
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                disabled={!!editingPlanId}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name (e.g. Platinum)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Base price (INR)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="priceUsd">Base price (USD)</Label>
                <Input id="priceUsd" type="number" min="0" value={formData.priceUsd} onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationYears">Validity (years)</Label>
                <Input id="durationYears" type="number" min="1" value={formData.durationYears} onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="gstRate">GST rate (%)</Label>
                <Input id="gstRate" type="number" min="0" value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display order</Label>
                <Input id="displayOrder" type="number" min="0" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isRecommended} onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })} />
                Mark as recommended
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Available for purchase
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (One per line)</Label>
              <Textarea
                id="features"
                rows={4}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="missingFeatures">Excluded features (One per line)</Label>
              <Textarea
                id="missingFeatures"
                rows={3}
                value={formData.missingFeatures}
                onChange={(e) => setFormData({ ...formData, missingFeatures: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to completely delete this membership plan? Businesses on this plan may lose access to specific features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 sm:space-x-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={isDeleting}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminMemberships };
export default AdminMemberships;
