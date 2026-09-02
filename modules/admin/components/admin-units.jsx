"use client";
import { Plus, Users, Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@shared/components/ui/dropdown-menu";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";

function AdminUnits() {
  const { data: chaptersData, refetch } = useChapters();
  const chapters = chaptersData || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?._id || "");
  const [newUnit, setNewUnit] = useState({
    name: "",
    focus: "",
    status: "Active",
  });

  const allUnits = chapters.flatMap((c) =>
    (c.units || []).map((u) => ({ ...u, chapterName: c.name, chapterId: c._id }))
  );

  const handleAddUnit = async (e) => {
    e.preventDefault();
    const chId = selectedChapterId || chapters[0]?._id;
    if (!newUnit.name || !chId) return;
    setLoading(true);
    try {
      await chapterApi.addUnit(chId, newUnit);
      toast.success("Unit created successfully");
      setOpenAdd(false);
      setNewUnit({ name: "", focus: "", status: "Active" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add unit to chapter.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUnit = async (chapterId, unitId) => {
    if (!confirm("Are you sure you want to remove this unit?")) return;
    try {
      await chapterApi.removeUnit(chapterId, unitId);
      toast.success("Unit removed successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to remove unit.");
    }
  };

  return (
    <AppShell
      role="admin"
      title="Specialised units"
      subtitle="Focus groups and trade desks operating under chapters"
      actions={
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4" /> New unit
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Units" value={String(allUnits.length)} icon={Users} tone="primary" />
          <StatCard label="Active" value={String(allUnits.filter((u) => u.status === "Active").length)} tone="success" />
          <StatCard label="Chapters" value={String(chapters.length)} />
          <StatCard label="Network Reach" value="Pan-Chamber" tone="warning" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {allUnits.map((u, i) => (
            <Panel key={i} title={
              <div className="flex items-start justify-between">
                <span>{u.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleRemoveUnit(u.chapterId, u._id || u.id)}>
                      Remove Unit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            } description={u.focus}>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Pill tone={u.status === "Active" ? "success" : "warning"}>{u.status || "Active"}</Pill>
                <Pill>{u.chapterName}</Pill>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left">Add Specialised Unit</SheetTitle>
            <SheetDescription className="text-left">Create a focus unit under a chapter.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddUnit} className="mt-4 space-y-4 px-4 pb-8">
            <div className="space-y-1.5">
              <Label htmlFor="u-ch">Chapter</Label>
              <Select value={selectedChapterId || chapters[0]?._id} onValueChange={setSelectedChapterId}>
                <SelectTrigger id="u-ch">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Unit Name *</Label>
              <Input
                id="u-name"
                required
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                placeholder="e.g. MSME Trade Desk"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-focus">Focus Area</Label>
              <Input
                id="u-focus"
                value={newUnit.focus}
                onChange={(e) => setNewUnit({ ...newUnit, focus: e.target.value })}
                placeholder="e.g. Export facilitation and compliance clinics"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Unit"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

export { AdminUnits };
export default AdminUnits;
