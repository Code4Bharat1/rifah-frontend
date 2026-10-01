"use client";
import { Package, Pencil, Plus, Trash2, Loader2, UploadCloud, X, Image as ImageIcon, Eye, EyeOff, Share2, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const WhatsAppIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const LinkedInIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.67 1.66c0 .92.75 1.67 1.67 1.67s1.67-.75 1.67-1.67c0-.91-.75-1.66-1.67-1.66Z" />
  </svg>
);

const TwitterXIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const EmailIcon = ({ className = "h-5 w-5", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" {...props}>
    <path fill="#4285F4" d="M1.5 6.5v11a2 2 0 0 0 2 2h3v-9.5l-5-3.5z" />
    <path fill="#34A853" d="M22.5 6.5v11a2 2 0 0 1-2 2h-3v-9.5l5-3.5z" />
    <path fill="#EA4335" d="M17.5 4.5l-5.5 4-5.5-4h-3a2 2 0 0 0-2 2v.5l10.5 7.5 10.5-7.5V6.5a2 2 0 0 0-2-2h-3z" />
    <path fill="#FBBC05" d="M6.5 10v9.5h11V10l-5.5 4z" />
  </svg>
);

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
import { useQueryClient } from "@tanstack/react-query";
import { useMyBusiness, useBusinessCatalogue, useCategories } from "@shared/hooks/use-rifah-api";
import { catalogueApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";

export function BizCatalogueManager({ embedded = false }) {
  const queryClient = useQueryClient();
  const { data: business } = useMyBusiness();
  const { data: catalogueItems, refetch } = useBusinessCatalogue(business?._id);
  const { data: categoriesData } = useCategories();

  const categoryOptions = useMemo(() => {
    const raw = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [];
    const fromApi = raw.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean);
    const fromBiz = [business?.industry, business?.subCategory, ...(business?.categories || [])].filter(Boolean);
    return Array.from(new Set([...fromBiz, ...fromApi]));
  }, [categoriesData, business]);

  const allItems = catalogueItems || [];
  const activeItems = allItems.filter(item => item.status === "Active");
  const hiddenItems = allItems.filter(item => item.status === "Draft" || item.status === "Archived");
  
  const [activeTab, setActiveTab] = useState("Active");
  const items = activeTab === "Active" ? activeItems : hiddenItems;

  const syncCatalogueCache = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["catalogue"] });
    queryClient.invalidateQueries({ queryKey: ["catalogue-business"] });
    if (business?._id) {
      queryClient.invalidateQueries({ queryKey: ["catalogue-business", business._id] });
      queryClient.invalidateQueries({ queryKey: ["business", business._id] });
    }
    if (business?.slug) {
      queryClient.invalidateQueries({ queryKey: ["business", business.slug] });
    }
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };

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
        category: newItem.category?.trim() || "General",
        businessId: business?._id,
      });
      const createdItem = res?.data || res;
      const itemId = createdItem?._id || createdItem?.id;

      if (addFiles.length > 0 && itemId) {
        try {
          await catalogueApi.uploadImages(itemId, addFiles);
        } catch (imgErr) {
          console.error("Image upload warning:", imgErr);
          toast.warning("Catalogue item created, but images could not be uploaded.");
        }
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
      syncCatalogueCache();
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
        category: editFormData.category?.trim() || "General",
        images: editExistingImages,
      });

      if (editFiles.length > 0) {
        try {
          await catalogueApi.uploadImages(editingItem._id, editFiles);
        } catch (imgErr) {
          console.error("Image upload warning:", imgErr);
          toast.warning("Item updated, but new images failed to upload.");
        }
      }

      setOpenEditForm(false);
      setEditingItem(null);
      setEditFiles([]);
      setEditPreviews([]);
      toast.success("Catalogue item updated successfully!");
      syncCatalogueCache();
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
      syncCatalogueCache();
    } catch (err) {
      toast.error(err.message || "Failed to delete item.");
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const newStatus = item.status === "Active" ? "Draft" : "Active";
      await catalogueApi.update(item._id, { status: newStatus });
      toast.success(newStatus === "Active" ? "Item is now visible on profile" : "Item hidden from profile");
      syncCatalogueCache();
    } catch (err) {
      toast.error(err.message || "Failed to update item visibility.");
    }
  };

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedShareItem, setSelectedShareItem] = useState(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const getBaseAppUrl = () => {
    const liveDomain = process.env.NEXT_PUBLIC_APP_URL || "https://rifah.nexcorealliance.com";
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return origin;
      }
    }
    return liveDomain;
  };

  const getCatalogueShareUrl = () => {
    const bizSlugOrId = business?.slug || business?._id;
    if (!bizSlugOrId) return "";
    const base = getBaseAppUrl();
    return `${base}/business/${bizSlugOrId}?tab=catalogue#catalogue`;
  };

  const getItemShareUrl = (item) => {
    if (!item) return "";
    const bizSlugOrId = business?.slug || business?._id;
    if (!bizSlugOrId) return "";
    const base = getBaseAppUrl();
    return `${base}/business/${bizSlugOrId}?tab=catalogue&item=${item.slug || item._id}#catalogue`;
  };

  const getWhatsAppCatalogueMessage = () => {
    const catalogueUrl = getCatalogueShareUrl();
    const bizName = business?.name || "Our Business";
    const category = business?.industry || business?.categories?.[0] || "";
    const cityState = [business?.city, business?.state].filter(Boolean).join(", ");
    const publishedCount = activeItems?.length || 0;

    return (
      `*Check out our Product & Service Catalogue on RIFAH!* 🛍️✨\n\n` +
      `🏢 *${bizName}*\n` +
      (category ? `🏷️ *Category:* ${category}\n` : "") +
      (cityState ? `📍 *Location:* ${cityState}\n` : "") +
      (publishedCount > 0 ? `📦 *${publishedCount} item${publishedCount === 1 ? "" : "s"} available*\n\n` : "\n") +
      `Click below to view all our products, services, specifications & enquire directly:\n\n` +
      `${catalogueUrl}\n\n` +
      `_RIFAH Chamber of Commerce & Industry_`
    );
  };

  const getWhatsAppItemMessage = (item) => {
    if (!item) return "";
    const itemUrl = getItemShareUrl(item);
    const bizName = business?.name || "Our Business";

    return (
      `*Check out "${item.name}" from ${bizName} on RIFAH!* 🛍️✨\n\n` +
      (item.category ? `🏷️ *Category:* ${item.category}\n` : "") +
      (item.price ? `💰 *Price:* ${item.price}\n` : "") +
      (item.moq ? `📦 *MOQ:* ${item.moq}\n` : "") +
      (item.description ? `📝 *Details:* ${item.description.slice(0, 120)}${item.description.length > 120 ? "..." : ""}\n\n` : "\n") +
      `Click below to view item details and connect directly:\n\n` +
      `${itemUrl}\n\n` +
      `_RIFAH Chamber of Commerce & Industry_`
    );
  };

  const handleOpenShareCatalogue = () => {
    const bizSlugOrId = business?.slug || business?._id;
    if (!bizSlugOrId) {
      toast.error("Business profile not found or not published yet.");
      return;
    }
    setSelectedShareItem(null);
    setCopiedShareLink(false);
    setShareDialogOpen(true);
  };

  const handleOpenShareItem = (item) => {
    const bizSlugOrId = business?.slug || business?._id;
    if (!bizSlugOrId) {
      toast.error("Business profile not found.");
      return;
    }
    setSelectedShareItem(item);
    setCopiedShareLink(false);
    setShareDialogOpen(true);
  };

  const handleCopyShareUrl = async (url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedShareLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const content = (
    <div className="space-y-4">
      {embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Products & Services Catalogue
            </h2>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} published · Buyers and chamber members can discover and enquire directly
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenShareCatalogue}
              className="rounded-xl px-3 text-xs font-semibold cursor-pointer shadow-xs border-border bg-background hover:bg-muted text-foreground gap-1.5 transition-all"
              title="Share catalogue across social channels"
            >
              <Share2 className="h-3.5 w-3.5 shrink-0" />
              <span>Share Catalogue</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setOpenAdd(true)}
              className="rounded-xl px-3 text-xs font-semibold cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product / Service</span>
            </Button>
          </div>
        </div>
      )}

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
                    <CreatableCombobox
                      id="item-cat"
                      value={newItem.category}
                      onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                      options={categoryOptions}
                      placeholder="Select or search category"
                      emptyText="No category found. Type to add custom."
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

          {allItems.length > 0 && (
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("Active")}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === "Active" ? "border-[#0088d1] text-[#0088d1]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Published ({activeItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Hidden")}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === "Hidden" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Hidden ({hiddenItems.length})
              </button>
            </div>
          )}

          {items.length === 0 ? (
        <EmptyState
          icon={Package}
            title={activeTab === "Active" ? "No published items" : "No hidden items"}
            description={activeTab === "Active" ? "Add products or services so buyers can find and enquire about your offerings." : "You have no hidden items."}
            action={
              activeTab === "Active" && (
                <Button onClick={() => setOpenAdd(true)}>
                  <Plus className="h-4 w-4" /> Add your first item
                </Button>
              )
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                      }}
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
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>
                    {(item.status === 'Draft' || item.status === 'Archived') && (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        <EyeOff className="h-3 w-3" /> Hidden from public
                      </span>
                    )}
                  </div>
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

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenShareItem(item)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200/80 transition-colors cursor-pointer"
                  title="Share this item"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" /> Share
                </button>
                <button
                  type="button"
                  onClick={() => handleEditClick(item)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 text-xs font-medium text-sky-600 border border-sky-100/80 transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                    item.status === 'Draft' || item.status === 'Archived'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100/80'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-100/80'
                  }`}
                >
                  {item.status === 'Draft' || item.status === 'Archived' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {item.status === 'Draft' || item.status === 'Archived' ? 'Show' : 'Hide'}
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
                <CreatableCombobox
                  id="edit-cat"
                  value={editFormData.category}
                  onValueChange={(val) => setEditFormData({ ...editFormData, category: val })}
                  options={categoryOptions}
                  placeholder="Select or search category"
                  emptyText="No category found. Type to add custom."
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

      {/* Share Catalogue / Item Modal Dialog with 4 Direct Channels */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 font-sans">
          <DialogHeader className="space-y-1 text-left pr-6">
            <DialogTitle className="text-xl font-bold text-foreground">
              {selectedShareItem ? `Share "${selectedShareItem.name}"` : "Share Catalogue"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedShareItem
                ? "Share this product/service across social channels or copy direct link."
                : "Share your business catalogue with buyers, clients, and partners."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                SHARE DIRECTLY VIA
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    selectedShareItem ? getWhatsAppItemMessage(selectedShareItem) : getWhatsAppCatalogueMessage()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition group text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-6 h-6 text-white fill-current" />
                  </div>
                  <span className="text-xs font-medium text-foreground">WhatsApp</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    selectedShareItem ? getItemShareUrl(selectedShareItem) : getCatalogueShareUrl()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 transition group text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                    <LinkedInIcon className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-xs font-medium text-foreground">LinkedIn</span>
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    selectedShareItem
                      ? `Check out "${selectedShareItem.name}" by ${business?.name || "our business"} on RIFAH!`
                      : `Check out the Product & Service Catalogue of ${business?.name || "our business"} on RIFAH!`
                  )}&url=${encodeURIComponent(
                    selectedShareItem ? getItemShareUrl(selectedShareItem) : getCatalogueShareUrl()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-black/50 dark:hover:border-white/50 hover:bg-black/5 dark:hover:bg-white/5 transition group text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                    <TwitterXIcon className="w-4 h-4 text-white dark:text-black fill-current" />
                  </div>
                  <span className="text-xs font-medium text-foreground">X / Twitter</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    selectedShareItem
                      ? `${selectedShareItem.name} - ${business?.name || "Business"} on RIFAH`
                      : `${business?.name || "Business"} - Product & Service Catalogue on RIFAH`
                  )}&body=${encodeURIComponent(
                    selectedShareItem
                      ? `Hello,\n\nI would like to share this product/service with you:\n\n${selectedShareItem.name}\n\nView Online:\n${getItemShareUrl(selectedShareItem)}\n\nRIFAH Chamber of Commerce & Industry`
                      : `Hello,\n\nI would like to share our Product & Service Catalogue with you:\n\n${business?.name || "Our Business"}\n\nView Catalogue Online:\n${getCatalogueShareUrl()}\n\nRIFAH Chamber of Commerce & Industry`
                  )}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition group text-center"
                >
                  <div className="w-11 h-11 rounded-2xl bg-muted/80 border border-border flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                    <EmailIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Email</span>
                </a>
              </div>
            </div>

            {/* Direct Copy link */}
            <div className="mt-3 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedShareItem ? "Item Link" : "Catalogue Link"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedShareItem ? getItemShareUrl(selectedShareItem) : getCatalogueShareUrl()}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-mono select-all outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  onClick={() => handleCopyShareUrl(selectedShareItem ? getItemShareUrl(selectedShareItem) : getCatalogueShareUrl())}
                  className={`gap-1.5 text-xs font-semibold shrink-0 transition-all rounded-xl ${
                    copiedShareLink ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppShell
      role="business"
      title="My catalogue"
      subtitle={`${items.length} published products & services`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleOpenShareCatalogue}
            className="rounded-xl px-2.5 sm:px-3 text-xs font-semibold cursor-pointer shadow-xs border-border bg-background hover:bg-muted text-foreground gap-1.5 transition-all"
            title="Share catalogue across social channels"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Share Catalogue</span>
            <span className="sm:hidden">Share</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setOpenAdd(true)}
            className="rounded-xl px-2.5 sm:px-3 text-xs cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Add item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      }
    >
      {content}
    </AppShell>
  );
}

export function BizCatalogue(props) {
  return <BizCatalogueManager embedded={false} {...props} />;
}
export default BizCatalogue;
