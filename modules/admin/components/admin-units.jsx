"use client";
import { Plus, Users, Loader2, MoreHorizontal, Pencil, Trash2, Search, Building2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@shared/components/ui/dropdown-menu";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { chapterApi } from "@shared/lib/api-services";

function AdminUnits() {
  const { data: chaptersData, refetch } = useChapters();
  const chapters = chaptersData || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [newUnit, setNewUnit] = useState({
    name: "",
    focus: "",
    status: "Active",
  });
  const [editUnit, setEditUnit] = useState(null);

  const allUnits = chapters.flatMap((c) =>
    (c.units || []).map((u) => ({ ...u, chapterName: c.name, chapterId: c._id }))
  );

  // Filter and search
  const filteredUnits = allUnits.filter((u) => {
    const matchSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.focus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.chapterName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchChapter = filterChapter === "all" || u.chapterId === filterChapter;
    return matchSearch && matchChapter;
  });

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
      setSelectedChapterId("");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add unit.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUnit = async (e) => {
    e.preventDefault();
    if (!editUnit) return;
    setLoading(true);
    try {
      // Remove and re-add with updated data
      await chapterApi.removeUnit(editUnit.chapterId, editUnit._id || editUnit.id);
      await chapterApi.addUnit(editUnit.chapterId, {
        name: editUnit.name,
        focus: editUnit.focus,
        status: editUnit.status,
      });
      toast.success("Unit updated successfully");
      setOpenEdit(false);
      setEditUnit(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update unit.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUnit = async (chapterId, unitId) => {
    try {
      await chapterApi.removeUnit(chapterId, unitId);
      toast.success("Unit removed successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to remove unit.");
    }
  };

  const openEditDialog = (unit) => {
    setEditUnit({ ...unit });
    setOpenEdit(true);
  };

  return (
    <AppShell
      role="admin"
      title="Specialised units"
      subtitle="Focus groups and trade desks operating under chapters"
      actions={
        <Button onClick={() => { setSelectedChapterId(chapters[0]?._id || ""); setOpenAdd(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Unit
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Units" value={String(allUnits.length)} icon={Users} tone="primary" />
          <StatCard label="Active" value={String(allUnits.filter((u) => u.status === "Active").length)} tone="success" />
          <StatCard label="Planned" value={String(allUnits.filter((u) => u.status === "Planned").length)} tone="warning" />
          <StatCard label="Chapters" value={String(chapters.length)} icon={Building2} />
        </div>

        {/* Search & Filter Bar */}
        <Panel bodyClassName="p-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units by name, focus or chapter..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterChapter} onValueChange={setFilterChapter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {chapters.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Panel>

        {/* Units Table */}
        {filteredUnits.length === 0 ? (
          <Panel>
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <Users className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No units found</p>
              <p className="text-xs mt-1">Create a new unit using the button above.</p>
            </div>
          </Panel>
        ) : (
          <Panel bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-5 py-3">Unit Name</th>
                    <th className="px-5 py-3">Focus Area</th>
                    <th className="px-5 py-3">Chapter</th>
                    <th className="px-5 py-3">Members</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUnits.map((u, i) => (
                    <tr key={u._id || i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">{u.name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.focus || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Pill>{u.chapterName}</Pill>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.membersCount || 0}</td>
                      <td className="px-5 py-3.5">
                        <Pill tone={u.status === "Active" ? "success" : u.status === "Planned" ? "warning" : "gray"}>
                          {u.status || "Active"}
                        </Pill>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(u)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleRemoveUnit(u.chapterId, u._id || u.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Unit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>

      {/* Add Unit Dialog (Center Modal) */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Specialised Unit</DialogTitle>
            <DialogDescription>Create a focus unit under a chapter.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUnit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-ch">Chapter *</Label>
              <Select value={selectedChapterId || chapters[0]?._id} onValueChange={setSelectedChapterId}>
                <SelectTrigger id="add-ch">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Unit Name *</Label>
              <Input
                id="add-name"
                required
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                placeholder="e.g. MSME Trade Desk"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-focus">Focus Area</Label>
              <Input
                id="add-focus"
                value={newUnit.focus}
                onChange={(e) => setNewUnit({ ...newUnit, focus: e.target.value })}
                placeholder="e.g. Export facilitation and compliance"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-status">Status</Label>
              <Select value={newUnit.status} onValueChange={(v) => setNewUnit({ ...newUnit, status: v })}>
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Unit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog (Center Modal) */}
      <Dialog open={openEdit} onOpenChange={(o) => { if (!o) { setOpenEdit(false); setEditUnit(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Update unit details.</DialogDescription>
          </DialogHeader>
          {editUnit && (
            <form onSubmit={handleEditUnit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Chapter</Label>
                <Input value={editUnit.chapterName} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Unit Name *</Label>
                <Input
                  id="edit-name"
                  required
                  value={editUnit.name}
                  onChange={(e) => setEditUnit({ ...editUnit, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-focus">Focus Area</Label>
                <Input
                  id="edit-focus"
                  value={editUnit.focus || ""}
                  onChange={(e) => setEditUnit({ ...editUnit, focus: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editUnit.status || "Active"} onValueChange={(v) => setEditUnit({ ...editUnit, status: v })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Unit"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminUnits };
export default AdminUnits;
