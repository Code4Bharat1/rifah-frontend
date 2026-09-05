"use client";
import { Package, Pencil, Plus, Trash2, Loader2, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { useMyBusiness, useBusinessCatalogue } from "@shared/hooks/use-rifah-api";
import { catalogueApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

function BizCatalogue() {
  const { data: business } = useMyBusiness();
  const { data: catalogueItems, refetch } = useBusinessCatalogue(business?._id);
  const items = catalogueItems || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    type: "Product",
    category: "",
    description: "",
    moq: "",
    price: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "Product",
    category: "",
    description: "",
    moq: "",
    price: "",
  });

  // Image handling states
  const [addFiles, setAddFiles] = useState([]);
  const [addPreviews, setAddPreviews] = useState([]);

  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);

  const handleAddFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...addFiles, ...files];
    setAddFiles(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setAddPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveAddFile = (index) => {
    URL.revokeObjectURL(addPreviews[index]);
    setAddFiles((prev) => prev.filter((_, i) => i !== index));
    setAddPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...editFiles, ...files];
    setEditFiles(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setEditPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveEditFile = (index) => {
    URL.revokeObjectURL(editPreviews[index]);
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
    setEditPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setLoading(true);
    try {
      const res = await catalogueApi.create({
        ...newItem,
        businessId: business?._id,
      });
      const createdItem = res?.data || res;
      const itemId = createdItem?._id || createdItem?.id;

      if (addFiles.length > 0 && itemId) {
        await catalogueApi.uploadImages(itemId, addFiles);
      }

      setOpenAdd(false);
      setNewItem({
        name: "",
        type: "Product",
        category: "",
        description: "",
        moq: "",
        price: "",
      });
      setAddFiles([]);
      setAddPreviews([]);
      toast.success("Catalogue item added successfully!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to add catalogue item.");
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
    setEditExistingImages(Array.isArray(item.images) ? [...item.images] : []);
    setEditFiles([]);
    setEditPreviews([]);
    setOpenEditForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem?._id || !editFormData.name.trim()) return;
    setSavingEdit(true);
    try {
      await catalogueApi.update(editingItem._id, {
        ...editFormData,
        images: editExistingImages,
      });

      if (editFiles.length > 0) {
        await catalogueApi.uploadImages(editingItem._id, editFiles);
      }

      setOpenEditForm(false);
      setEditingItem(null);
      setEditFiles([]);
      setEditPreviews([]);
      toast.success("Catalogue item updated successfully!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update item.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this catalogue entry?")) return;
    try {
      await catalogueApi.delete(id);
      toast.success("Catalogue item deleted");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete item.");
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

              {/* Item Image Upload */}
              <div className="grid gap-1.5">
                <Label>Item Images</Label>
                {addPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {addPreviews.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveAddFile(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                    <p className="text-xs font-medium text-slate-600">Click to upload item images</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddFileChange}
                  />
                </label>
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
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md max-w-[360px] w-full overflow-hidden"
            >
              <div>
                {/* Item Image Display */}
                {item.images && item.images.length > 0 ? (
                  <div className="relative mb-3 h-40 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                    <img
                      src={resolveMediaUrl(item.images[0])}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
                        +{item.images.length - 1} photos
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative mb-3 h-24 w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-slate-300" />
                  </div>
                )}

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

            {/* Edit Item Image Upload & Management */}
            <div className="grid gap-1.5">
              <Label>Item Images</Label>

              {/* Current Images */}
              {editExistingImages.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs text-slate-500 mb-1.5">Current Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {editExistingImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={resolveMediaUrl(imgUrl)} alt={`Existing ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly selected images preview */}
              {editPreviews.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs text-slate-500 mb-1.5">New Uploads:</p>
                  <div className="flex flex-wrap gap-2">
                    {editPreviews.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={url} alt={`New upload preview ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditFile(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                  <p className="text-xs font-medium text-slate-600">Click to upload new images</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleEditFileChange}
                />
              </label>
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
