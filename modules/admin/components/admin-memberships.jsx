"use client";
import { Star, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@shared/components/ui/dropdown-menu";
import { useMembershipPlans, useBusinesses } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";

function AdminMemberships() {
  const { data: plansData } = useMembershipPlans();
  const { data: businessesData, refetch: refetchBusinesses } = useBusinesses();

  const plans = plansData || {};
  const businesses = Array.isArray(businessesData) ? businessesData : [];

  const handleUpdateStatus = async (businessId, updates) => {
    try {
      await businessApi.updateStatus(businessId, updates);
      toast.success("Business profile updated successfully");
      refetchBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to update business.");
    }
  };

  return (
    <AppShell role="admin" title="Memberships" subtitle="Tiers, subscription plans and member allocations">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total members" value={String(businesses.length)} icon={Star} tone="primary" />
          <StatCard
            label="Premium / Enterprise"
            value={String(businesses.filter((b) => b.membership === "Premium" || b.membership === "Enterprise").length)}
            tone="success"
          />
          <StatCard
            label="Basic"
            value={String(businesses.filter((b) => b.membership === "Basic").length)}
          />
          <StatCard
            label="Verified"
            value={String(businesses.filter((b) => b.verification === "verified").length)}
            tone="warning"
          />
        </div>

        <Panel title="Membership Tier Structure">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(plans).map(([key, p]) => (
              <div key={key} className="rounded-xl border border-border p-4">
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

        <Panel title="Member subscriptions">
          <ResponsiveTable
            rows={businesses}
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
    </AppShell>
  );
}

export { AdminMemberships };
export default AdminMemberships;
