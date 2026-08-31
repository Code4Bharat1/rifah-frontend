"use client";
import { Folder, Plus } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { categories } from "@shared/lib/mock-data";

function AdminCategories() {
  return (
    <AppShell
      role="admin"
      title="Categories"
      subtitle="Taxonomy powering search and lead matching"
      actions={
        <Button>
          <Plus className="h-4 w-4" /> Add category
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Categories" value={String(categories.length)} icon={Folder} tone="primary" />
          <StatCard label="Used in listings" value="94%" tone="success" />
          <StatCard label="Pending requests" value="5" tone="warning" />
          <StatCard label="Merged this quarter" value="3" />
        </div>

        <Panel title="New category">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input placeholder="Category name, e.g. Cold chain logistics" className="h-11" />
            <Button className="h-11">Create</Button>
          </div>
        </Panel>

        <Panel title="All categories">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.businesses} businesses · {c.parent}</p>
                </div>
                <Pill>Edit</Pill>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}


export { AdminCategories };
export default AdminCategories;
