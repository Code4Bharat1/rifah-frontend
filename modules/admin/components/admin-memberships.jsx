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

function AdminMemberships() {
  const { data: plansData, refetch: refetchPlans } = useMembershipPlans();
  const { data: businessesData, refetch: refetchBusinesses } = useBusinesses();

  const plans = plansData || {};
  const rawBusinesses = Array.isArray(businessesData) ? businessesData : [];
  // Per business rule: Only verified businesses are officially RIFAH members
  const businesses = rawBusinesses.filter(b => b.verification === "verified" || b.isVerified === true);

  const [filter, setFilter] = useState("all");
  const filteredBusinesses = businesses.filter((b) => {
    if (filter === "premium") return b.membership === "Premium" || b.membership === "Enterprise";
    if (filter === "basic") return b.membership === "Basic";
    if (filter === "verified") return b.verification === "verified";
    return true;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({ planId: "", name: "", price: 0, summary: "", features: "" });
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
        summary: plan.summary || "",
        features: plan.features ? plan.features.join("\n") : ""
      });
    } else {
      setEditingPlanId(null);
      setFormData({ planId: "", name: "", price: 0, summary: "", features: "" });
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
        summary: formData.summary.trim(),
        features: formData.features.split(/\r?\n/).map(f => f.trim()).filter(Boolean)
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
        <Button onClick={() => openModal()} className="gap-2 shadow-sm" size="sm">
          <Plus className="h-4 w-4" /> Create Plan
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div onClick={() => setFilter("all")} className={`cursor-pointer transition-all duration-200 ${filter === 'all' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard label="Total members" value={String(businesses.length)} icon={Star} tone="primary" />
          </div>
          <div onClick={() => setFilter("premium")} className={`cursor-pointer transition-all duration-200 ${filter === 'premium' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Premium / Enterprise"
              value={String(businesses.filter((b) => b.membership === "Premium" || b.membership === "Enterprise").length)}
              tone="success"
            />
          </div>
          <div onClick={() => setFilter("basic")} className={`cursor-pointer transition-all duration-200 ${filter === 'basic' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Basic"
              value={String(businesses.filter((b) => b.membership === "Basic").length)}
            />
          </div>
          <div onClick={() => setFilter("verified")} className={`cursor-pointer transition-all duration-200 ${filter === 'verified' ? 'ring-2 ring-primary ring-offset-2 rounded-2xl opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <StatCard
              label="Verified"
              value={String(businesses.filter((b) => b.verification === "verified").length)}
              tone="warning"
            />
          </div>
        </div>

        <Panel 
          title="Membership Tier Structure" 
        >
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(plans).map(([key, p]) => (
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
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">₹ {p.price?.toLocaleString("en-IN")} / year</p>
                  </div>
                  <Pill tone="brand">Annual</Pill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{p.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.features?.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      · {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={filter === "all" ? "Member subscriptions" : filter === "premium" ? "Premium/Enterprise Subscriptions" : filter === "basic" ? "Basic Subscriptions" : "Verified Members"}>
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
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { membership: "Basic" })} disabled={r.membership === "Basic"}>
                        Set to Basic
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { membership: "Premium" })} disabled={r.membership === "Premium"}>
                        Upgrade to Premium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(r._id, { membership: "Enterprise" })} disabled={r.membership === "Enterprise"}>
                        Upgrade to Enterprise
                      </DropdownMenuItem>
                      
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
                   <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(r._id, { membership: "Premium" })} disabled={r.membership === "Premium"}>
                     Set Premium
                   </Button>
                   <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(r._id, { verification: "verified" })} disabled={r.verification === "verified"}>
                     Verify
                   </Button>
                </div>
              </div>
            )}
          />
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
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(selectedBusiness._id, { membership: "Free" })}>Set Free</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(selectedBusiness._id, { membership: "Basic" })}>Set Basic</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(selectedBusiness._id, { membership: "Premium" })}>Set Premium</Button>
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
              <Label htmlFor="price">Annual Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
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
