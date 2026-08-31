"use client";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { businesses } from "@shared/lib/mock-data";

function AdminBusinesses() {
  const [q, setQ] = useState("");
  const rows = businesses.filter((b) =>
    [b.name, b.industry, b.city, b.chapter].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      role="admin"
      title="Member businesses"
      subtitle={`${businesses.length} listed businesses`}
      actions={<Button variant="outline">Export directory</Button>}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, industry, city or chapter"
            className="h-11 pl-10"
          />
        </div>

        <Panel>
          <ResponsiveTable
            rows={rows}
            empty={<EmptyState icon={Building2} title="No businesses match" description="Try a different search term." />}
            columns={[
              { key: "name", header: "Business", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "industry", header: "Industry", cell: (r) => r.industry },
              { key: "city", header: "Location", cell: (r) => `${r.city}, ${r.state}` },
              { key: "chapter", header: "Chapter", cell: (r) => r.chapter },
              { key: "plan", header: "Plan", cell: (r) => <MembershipBadge tier={r.membership} /> },
              { key: "ver", header: "Verification", cell: (r) => <VerificationBadge status={r.verification} compact /> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/business/${r.id }`}>
                      View
                    </Link>
                  </Button>
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
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/business/${r.id }`}>
                    View profile
                  </Link>
                </Button>
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
