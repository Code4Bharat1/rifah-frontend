"use client";
import { MapPin, Plus, Users, Loader2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";

function AdminChapters() {
  const { data: chaptersData, refetch } = useChapters();
  const chapters = chaptersData || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newChapter, setNewChapter] = useState({
    name: "",
    city: "",
    state: "Maharashtra",
    status: "Active",
  });

  const totalUnits = chapters.reduce((sum, c) => sum + (c.units?.length || 0), 0);

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.name || !newChapter.city) return;
    setLoading(true);
    try {
      await chapterApi.create(newChapter);
      setOpenAdd(false);
      setNewChapter({ name: "", city: "", state: "Maharashtra", status: "Active" });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to create chapter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Chapters and units"
      subtitle="Regional structure and branch desks of RIFAH Chamber"
      actions={
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4" /> New chapter
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Chapters" value={String(chapters.length)} icon={MapPin} tone="primary" />
          <StatCard label="Specialised units" value={String(totalUnits)} icon={Users} />
          <StatCard label="Active Chapters" value={String(chapters.filter((c) => c.status === "Active").length)} tone="success" />
          <StatCard label="Regions" value="Pan-India" tone="warning" />
        </div>

        <Panel title="Regional Chapters">
          <ResponsiveTable
            rows={chapters}
            columns={[
              { key: "name", header: "Chapter", cell: (r) => <span className="font-semibold">{r.name}</span> },
              { key: "loc", header: "Location", cell: (r) => `${r.city}, ${r.state}` },
              { key: "units", header: "Active Units", cell: (r) => r.units?.length || 0 },
              { key: "status", header: "Status", cell: (r) => <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill> },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.city}, {r.state}
                    </p>
                  </div>
                  <Pill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</Pill>
                </div>
              </div>
            )}
          />
        </Panel>

        <Panel title="Specialised focus units across chapters">
          <div className="grid gap-3 sm:grid-cols-2">
            {chapters.flatMap((c) => (c.units || []).map((u) => ({ ...u, chapterName: c.name }))).map((u, i) => (
              <div key={i} className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{u.name}</p>
                  <Pill tone={u.status === "Active" ? "success" : "warning"}>{u.status || "Active"}</Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{u.focus}</p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {u.chapterName}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left">Add Chamber Chapter</SheetTitle>
            <SheetDescription className="text-left">Establish a new regional chapter branch.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateChapter} className="mt-4 space-y-4 px-4 pb-8">
            <div className="space-y-1.5">
              <Label htmlFor="ch-name">Chapter Name *</Label>
              <Input
                id="ch-name"
                required
                value={newChapter.name}
                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                placeholder="e.g. Pune Chapter"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-city">City *</Label>
              <Input
                id="ch-city"
                required
                value={newChapter.city}
                onChange={(e) => setNewChapter({ ...newChapter, city: e.target.value })}
                placeholder="e.g. Pune"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-state">State</Label>
              <Input
                id="ch-state"
                value={newChapter.state}
                onChange={(e) => setNewChapter({ ...newChapter, state: e.target.value })}
                placeholder="Maharashtra"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Chapter"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

export { AdminChapters };
export default AdminChapters;
