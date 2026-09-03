"use client";
import { Folder, Plus, Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@shared/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { useCategories } from "@shared/hooks/use-rifah-api";
import { categoryApi } from "@shared/lib/api-services";

function AdminCategories() {
  const { data: categoriesData, refetch } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("none");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editParent, setEditParent] = useState("none");

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
      await categoryApi.update(editingCategory._id || editingCategory.id, { 
        name: editName.trim(),
        parent: editParent === "none" ? "" : editParent
      });
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
        parent: parentName === "none" ? "" : parentName
      });
      toast.success("Category created successfully");
      setName("");
      setParentName("none");
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
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1.5fr_1fr_auto] items-start">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name (e.g. Web Development)"
              className="h-11"
              required
            />
            <Select value={parentName} onValueChange={setParentName}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Parent (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent (Main Category)</SelectItem>
                {mainCategories.map((mc) => (
                  <SelectItem key={mc._id || mc.slug} value={mc.name}>{mc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </form>
        </Panel>

        <Panel title="Taxonomy Categories">
          {mainCategories.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">No categories defined.</p>
          ) : (
            <div className="space-y-6">
              {mainCategories.map((mc) => {
                const subs = subCategories.filter(sc => sc.parent === mc.name);
                return (
                  <div key={mc._id || mc.slug} className="space-y-3">
                    {/* Main Category */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-primary">{mc.name}</p>
                        <p className="text-xs text-muted-foreground">{mc.slug} • Main Category</p>
                      </div>
                      <Pill tone={mc.status === "Inactive" ? "warning" : "primary"}>{mc.status || "Active"}</Pill>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCategory(mc);
                            setEditName(mc.name);
                            setEditParent("none");
                          }}>
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(mc._id || mc.id)}>
                            Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Sub Categories */}
                    {subs.length > 0 && (
                      <div className="pl-8 space-y-2 relative before:absolute before:left-4 before:top-0 before:bottom-4 before:w-px before:bg-border">
                        {subs.map((sc) => (
                          <div key={sc._id || sc.slug} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface p-2.5 relative before:absolute before:left-[-16px] before:top-1/2 before:w-4 before:h-px before:bg-border">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{sc.name}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingCategory(sc);
                                  setEditName(sc.name);
                                  setEditParent(sc.parent || "none");
                                }}>
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(sc._id || sc.id)}>
                                  Delete Sub-Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <Select value={editParent} onValueChange={setEditParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Parent (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Make this a Main Category)</SelectItem>
                    {mainCategories
                      .filter(mc => mc._id !== (editingCategory?._id || editingCategory?.id))
                      .map((mc) => (
                      <SelectItem key={mc._id || mc.slug} value={mc.name}>{mc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
