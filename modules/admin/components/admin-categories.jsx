"use client";
import { Folder, Plus, Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useCategories } from "@shared/hooks/use-rifah-api";
import { categoryApi } from "@shared/lib/api-services";

function AdminCategories() {
  const { data: categoriesData, refetch } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryApi.delete(id);
      toast.success("Category deleted");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCategory) return;
    setLoading(true);
    try {
      await categoryApi.update(editingCategory._id || editingCategory.id, { name: editName.trim() });
      toast.success("Category updated");
      setEditingCategory(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update category.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await categoryApi.create({
        name: name.trim(),
        description: `${name.trim()} sector category for RFQs and Directory`,
      });
      toast.success("Category created successfully");
      setName("");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Categories & Taxonomy"
      subtitle="Industry classifications powering search and lead routing"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Categories" value={String(categories.length)} icon={Folder} tone="primary" />
          <StatCard label="System Status" value="Active Taxonomy" tone="success" />
        </div>

        <Panel title="Create category">
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name, e.g. Cold Chain Logistics"
              className="h-11"
              required
            />
            <Button type="submit" className="h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </form>
        </Panel>

        <Panel title="Taxonomy Categories">
          {categories.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">No categories defined.</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div key={c._id || c.slug} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                  <Pill tone={c.status === "Inactive" ? "warning" : "primary"}>{c.status || "Active"}</Pill>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingCategory(c);
                        setEditName(c.name);
                      }}>
                        Edit Name
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(c._id || c.id)}>
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Dialog open={!!editingCategory} onOpenChange={(o) => !o && setEditingCategory(null)}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the name of this sector category.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminCategories };
export default AdminCategories;
