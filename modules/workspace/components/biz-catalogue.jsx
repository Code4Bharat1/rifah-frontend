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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
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
        <>
          <Button
            size="sm"
            onClick={() => setOpenAdd(true)}
            className="rounded-xl px-2.5 sm:px-3 text-xs cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Add item</span>
            <span className="sm:hidden">Add</span>
          </Button>

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogContent className="w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/80 shadow-2xl font-sans">
              <DialogHeader className="space-y-1 text-left pr-6">
                <DialogTitle className="text-left text-xl font-bold text-[#0f172a] leading-tight font-sans">
                  Add catalogue item
                </DialogTitle>
                <DialogDescription className="text-left text-xs font-semibold text-[#8a99ad] font-sans">
                  Publish a product or service to the chamber directory.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-4 grid gap-4 font-sans" onSubmit={handleAddItem}>
                <div className="grid gap-1.5">
                  <Label htmlFor="item-name" className="text-xs font-bold text-slate-700">Item Name *</Label>
                  <Input
                    id="item-name"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. CNC machined components"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Item Image Upload */}
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold text-slate-700">Item Images</Label>
                  {addPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {addPreviews.map((url, idx) => (
                        <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group shadow-2xs">
                          <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveAddFile(idx)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="item-type" className="text-xs font-bold text-slate-700">Type</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(val) => setNewItem({ ...newItem, type: val })}
                    >
                      <SelectTrigger id="item-type" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="item-cat" className="text-xs font-bold text-slate-700">Category</Label>
                    <Input
                      id="item-cat"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="Manufacturing / Precision Engineering"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="item-moq" className="text-xs font-bold text-slate-700">Minimum Order Quantity (MOQ)</Label>
                    <Input
                      id="item-moq"
                      value={newItem.moq}
                      onChange={(e) => setNewItem({ ...newItem, moq: e.target.value })}
                      placeholder="e.g. 500 units"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="item-price" className="text-xs font-bold text-slate-700">Indicative Price</Label>
                    <Input
                      id="item-price"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="e.g. ₹ 450 per unit / On Request"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="item-desc" className="text-xs font-bold text-slate-700">Description</Label>
                  <Textarea
                    id="item-desc"
                    rows={4}
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="What you supply and technical specifications."
                    className="rounded-xl resize-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenAdd(false)}
                    className="rounded-xl px-4 h-11 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl px-6 h-11 text-xs font-bold bg-[#0088d1] hover:bg-[#0077b6] text-white cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Publish to catalogue"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
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

      {/* Edit Form Dialog Box matching Leads Dialog */}
      <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
        <DialogContent className="w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/80 shadow-2xl font-sans">
          <DialogHeader className="space-y-1 text-left pr-6">
            <DialogTitle className="text-left text-xl font-bold text-[#0f172a] leading-tight font-sans">
              Edit catalogue item
            </DialogTitle>
            <DialogDescription className="text-left text-xs font-semibold text-[#8a99ad] font-sans">
              Update product or service information.
            </DialogDescription>
          </DialogHeader>

          <form className="mt-4 grid gap-4 font-sans" onSubmit={handleSaveEdit}>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name" className="text-xs font-bold text-slate-700">Item Name *</Label>
              <Input
                id="edit-name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Edit Item Image Upload & Management */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold text-slate-700">Item Images</Label>

              {/* Current Images */}
              {editExistingImages.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs text-slate-500 mb-1.5">Current Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {editExistingImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group shadow-2xs">
                        <img src={resolveMediaUrl(imgUrl)} alt={`Existing ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
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
                      <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group shadow-2xs">
                        <img src={url} alt={`New upload preview ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditFile(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-type" className="text-xs font-bold text-slate-700">Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(val) => setEditFormData({ ...editFormData, type: val })}
                >
                  <SelectTrigger id="edit-type" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-cat" className="text-xs font-bold text-slate-700">Category</Label>
                <Input
                  id="edit-cat"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-moq" className="text-xs font-bold text-slate-700">Minimum Order Quantity (MOQ)</Label>
                <Input
                  id="edit-moq"
                  value={editFormData.moq}
                  onChange={(e) => setEditFormData({ ...editFormData, moq: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-price" className="text-xs font-bold text-slate-700">Indicative Price</Label>
                <Input
                  id="edit-price"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-desc" className="text-xs font-bold text-slate-700">Description</Label>
              <Textarea
                id="edit-desc"
                rows={4}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="rounded-xl resize-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEditForm(false)}
                className="rounded-xl px-4 h-11 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="rounded-xl px-6 h-11 text-xs font-bold bg-[#0088d1] hover:bg-[#0077b6] text-white cursor-pointer shadow-xs"
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizCatalogue };
export default BizCatalogue;
