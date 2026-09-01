"use client";
import { Package, Pencil, Plus, Trash2, Loader2, Sparkles, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
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
  SheetTrigger,
} from "@shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
} from "@shared/components/ui/dialog";
import { useMyBusiness, useBusinessCatalogue } from "@shared/hooks/use-rifah-api";
import { catalogueApi } from "@shared/lib/api-services";

function BizCatalogue() {
  const { data: business } = useMyBusiness();
  const { data: catalogueItems, refetch } = useBusinessCatalogue(business?._id);
  const items = catalogueItems || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    type: "Product",
    category: "Manufacturing",
    description: "",
    moq: "100 units",
    price: "₹ 500 / unit",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "Product",
    category: "",
    description: "",
    moq: "",
    price: "",
  });

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setLoading(true);
    try {
      await catalogueApi.create({
        ...newItem,
        businessId: business?._id,
      });
      setOpenAdd(false);
      setNewItem({
        name: "",
        type: "Product",
        category: "Manufacturing",
        description: "",
        moq: "100 units",
        price: "₹ 500 / unit",
      });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to add catalogue item.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name || "",
      type: item.type || "Product",
      category: item.category || "",
      description: item.description || "",
      moq: item.moq || "",
      price: item.price || "",
    });
    setShowPreviewModal(true);
  };

  const handleProceedToEdit = () => {
    setShowPreviewModal(false);
    setOpenEditForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem?._id || !editFormData.name.trim()) return;
    setSavingEdit(true);
    try {
      await catalogueApi.update(editingItem._id, editFormData);
      setOpenEditForm(false);
      setEditingItem(null);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update item.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this catalogue entry?")) return;
    try {
      await catalogueApi.delete(id);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to delete item.");
    }
  };

  return (
    <AppShell
      role="business"
      title="My catalogue"
      subtitle={`${items.length} published products & services`}
      actions={
        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <SheetTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-left">Add catalogue item</SheetTitle>
              <SheetDescription className="text-left">
                Publish a product or service to the chamber directory.
              </SheetDescription>
            </SheetHeader>
            <form className="mt-4 grid gap-4 px-4 pb-8" onSubmit={handleAddItem}>
              <div className="grid gap-1.5">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. CNC machined components"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-type">Type</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(val) => setNewItem({ ...newItem, type: val })}
                >
                  <SelectTrigger id="item-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-cat">Category</Label>
                <Input
                  id="item-cat"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Manufacturing / Precision Engineering"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-moq">Minimum Order Quantity (MOQ)</Label>
                <Input
                  id="item-moq"
                  value={newItem.moq}
                  onChange={(e) => setNewItem({ ...newItem, moq: e.target.value })}
                  placeholder="e.g. 500 units"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-price">Indicative Price</Label>
                <Input
                  id="item-price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="e.g. ₹ 450 per unit / On Request"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-desc">Description</Label>
                <Textarea
                  id="item-desc"
                  rows={4}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="What you supply and technical specifications."
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Publish to catalogue"
                )}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No catalogue items"
          description="Add products or services so buyers can find and enquire about your offerings."
          action={
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" /> Add your first item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl items-start">
          {items.map((item) => (
            <div
              key={item._id || item.slug}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:border-slate-300 hover:shadow-md max-w-[360px] w-full"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium ${
                      item.type === "Product"
                        ? "bg-sky-100 text-sky-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.type || "Product"}
                  </span>
                </div>

                {item.category && (
                  <p className="mt-1 text-xs text-slate-400 font-normal">{item.category}</p>
                )}

                {item.description && (
                  <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                )}

                {(item.moq || item.price) && (
                  <p className="mt-3 text-xs font-bold text-slate-900">
                    {item.moq ? `MOQ · ${item.moq}` : item.price}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEditClick(item)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 hover:bg-sky-100 px-4 py-1.5 text-xs font-medium text-sky-600 border border-sky-100/80 transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item._id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-0 shadow-2xl">
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600">
              <Sparkles className="h-3.5 w-3.5" /> ACTION PREVIEW
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-slate-900">Edit</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Opens the editor for this record and writes the change back to the member profile.
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WHAT HAPPENS NEXT
              </p>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Form validates required fields before submit</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Change is versioned with editor name and timestamp</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Public profile updates after moderation passes</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PROFILE COMPLETENESS
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">78% → 92% after this step</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MODERATION
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-800 leading-snug">
                  Catalogue edits auto-approved for verified members
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleProceedToEdit}
                className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form Sheet */}
      <Sheet open={openEditForm} onOpenChange={setOpenEditForm}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left">Edit catalogue item</SheetTitle>
            <SheetDescription className="text-left">
              Update product or service information.
            </SheetDescription>
          </SheetHeader>
          <form className="mt-4 grid gap-4 px-4 pb-8" onSubmit={handleSaveEdit}>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editFormData.type}
                onValueChange={(val) => setEditFormData({ ...editFormData, type: val })}
              >
                <SelectTrigger id="edit-type" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-cat">Category</Label>
              <Input
                id="edit-cat"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-moq">Minimum Order Quantity (MOQ)</Label>
              <Input
                id="edit-moq"
                value={editFormData.moq}
                onChange={(e) => setEditFormData({ ...editFormData, moq: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-price">Indicative Price</Label>
              <Input
                id="edit-price"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={4}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={savingEdit}>
              {savingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

export { BizCatalogue };
export default BizCatalogue;
