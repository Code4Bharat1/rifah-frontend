"use client";
import Link from "next/link";
import { Building2, Search, ExternalLink } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@shared/components/ui/select";
import { useBusinesses, useCategories } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

function AdminBusinesses() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");
  
  const { data: businessesData, refetch } = useBusinesses({ 
    search: q || undefined,
    industry: industry === "all" ? undefined : industry 
  });
  const rows = Array.isArray(businessesData) ? businessesData : [];

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

  const handleToggleStatus = async (b) => {
    const newStatus = b.status === "active" ? "suspended" : "active";
    if (!confirm(`Change status of "${b.name}" to ${newStatus}?`)) return;
    try {
      await businessApi.updateStatus(b._id, { status: newStatus });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update business status.");
    }
  };

  return (
    <AppShell
      role="admin"
      title="Member businesses"
      subtitle={`${rows.length} listed businesses`}
      actions={
        <Button variant="outline" className="rounded-full">Export directory</Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, industry, city or chapter"
              className="h-11 pl-10"
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="h-11 sm:w-[220px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mainCategories.length > 0 ? (
                mainCategories.map(mc => {
                  const subs = subCategories.filter(sc => sc.parent === mc.name);
                  return (
                    <SelectGroup key={mc.name}>
                      <SelectLabel className="font-semibold text-primary">{mc.name}</SelectLabel>
                      <SelectItem value={mc.name} className="italic text-muted-foreground ml-2">General {mc.name}</SelectItem>
                      {subs.map(sc => (
                        <SelectItem key={sc.name} value={sc.name} className="ml-4">{sc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })
              ) : null}
            </SelectContent>
          </Select>
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={<EmptyState icon={Building2} title="No businesses match" description="Try a different search term." />}
            columns={[
              { key: "name", header: "BUSINESS", cell: (r) => <span className="font-semibold text-sm">{r.name}</span> },
              { key: "industry", header: "INDUSTRY", cell: (r) => r.industry },
              { key: "city", header: "LOCATION", cell: (r) => `${r.city}, ${r.state}` },
              { key: "chapter", header: "CHAPTER", cell: (r) => r.chapter },
              { key: "plan", header: "PLAN", cell: (r) => <MembershipBadge tier={r.membership} /> },
              { key: "ver", header: "VERIFICATION", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Link href={`/admin/businesses/${r._id}`} className="text-sm font-medium text-primary hover:underline">
                    View
                  </Link>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.industry} · {r.city}
                    </p>
                  </div>
                  <VerificationBadge status={r.verification} compact />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <MembershipBadge tier={r.membership} />
                  <Pill>{r.chapter}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/businesses/${r._id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(r)}>
                    {r.status === "active" ? "Suspend" : "Activate"}
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

export { AdminBusinesses };
export default AdminBusinesses;
