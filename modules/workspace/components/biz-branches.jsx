"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Store,
  Layers,
  Crown,
  Info,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Badge } from "@shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Switch } from "@shared/components/ui/switch";
import { Textarea } from "@shared/components/ui/textarea";
import { useAuth } from "@shared/providers/auth-provider";
import { useFeatureAccess } from "@shared/hooks/use-feature-access";
import { normalizeUserTier } from "@shared/lib/subscription-models";
import { useMyBranches } from "@shared/hooks/use-rifah-api";
import { branchApi } from "@shared/lib/api-services";
import { useQueryClient } from "@tanstack/react-query";
import { resolveMediaUrl } from "@shared/lib/media";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

const BRANCH_TYPES = [
  "Retail Store",
  "Head Office",
  "Regional Office",
  "Corporate Office",
  "Warehouse",
  "Service Center",
  "Franchise",
  "Branch Office",
  "Other",
];

const INITIAL_FORM = {
  name: "",
  branchType: "Retail Store",
  image: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  mapUrl: "",
  timings: "Mon - Sat: 9:00 AM - 7:00 PM",
  isActive: true,
};

export function BizBranches({ role = "business" }) {
  const { user } = useAuth();
  const { tierId, planName, canAccess } = useFeatureAccess();
  const queryClient = useQueryClient();
  const membershipLink = role === "user" ? "/user/membership" : "/biz/membership";

  const { data: branchData, isLoading } = useMyBranches();
  const branches = branchData?.branches || [];
  const tierInfo = branchData?.tierInfo;

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  // Resolve reliable subscription tier identifier
  const effectiveTierId =
    tierId ||
    tierInfo?.tier ||
    normalizeUserTier(planName) ||
    "tier_1";

  // Check tier access
  const access = canAccess("multiple_locations");
  const isTierLocked = !access.isAllowed || effectiveTierId === "tier_1" || effectiveTierId === "tier_2";

  // Check quota limit for Tier 3
  const isTier3 = effectiveTierId === "tier_3";
  const isTier4 = effectiveTierId === "tier_4";
  const hasReachedTier3Limit = isTier3 && branches.length >= 1;
  const canAddBranch = !isTierLocked && (!isTier3 || branches.length < 1);

  const openAddModal = () => {
    if (isTierLocked) {
      toast.error(
        "Branch creation is locked on Tier I & Tier II. Please upgrade to Tier III (1 branch) or Tier IV (Unlimited)."
      );
      return;
    }
    if (hasReachedTier3Limit) {
      setUpgradeModalOpen(true);
      return;
    }
    setEditingBranch(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || "",
      branchType: branch.branchType || "Retail Store",
      image: branch.image || "",
      contactPerson: branch.contactPerson || "",
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "India",
      pincode: branch.pincode || "",
      mapUrl: branch.mapUrl || "",
      timings: branch.timings || "Mon - Sat: 9:00 AM - 7:00 PM",
      isActive: branch.isActive !== undefined ? branch.isActive : true,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5 MB");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await branchApi.uploadImage(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, image: url }));
        toast.success("Branch image uploaded successfully!");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter branch name.");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter branch city.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBranch) {
        await branchApi.updateBranch(editingBranch._id, formData);
        toast.success(`Branch "${formData.name}" updated successfully!`);
      } else {
        await branchApi.createBranch(formData);
        toast.success(`Branch "${formData.name}" added successfully!`);
      }
      queryClient.invalidateQueries({ queryKey: ["my-branches"] });
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (branch) => {
    try {
      const res = await branchApi.toggleVisibility(branch._id);
      toast.success(
        res?.message ||
          (branch.isActive
            ? "Branch hidden from public profile."
            : "Branch is now visible on public profile.")
      );
      queryClient.invalidateQueries({ queryKey: ["my-branches"] });
    } catch (err) {
      toast.error(err?.message || "Failed to toggle branch visibility");
    }
  };

  const confirmDelete = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    setDeleting(true);
    try {
      await branchApi.deleteBranch(branchToDelete._id);
      toast.success(`Branch "${branchToDelete.name}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ["my-branches"] });
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete branch");
    } finally {
      setDeleting(false);
    }
  };

  const activeBranches = branches.filter((b) => b.isActive);
  const hiddenBranches = branches.filter((b) => !b.isActive);

  return (
    <AppShell
      role={role}
      title={role === "user" ? "My Branches & Locations" : "Business Branches & Locations"}
      subtitle={
        role === "user"
          ? "Manage and publish multiple physical store, office, or branch locations."
          : "Create, organize, and publish multiple physical store, office, or warehouse locations for your enterprise."
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-3 sm:px-6">
        {/* Top Header & Subscription Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                <Store className="h-3.5 w-3.5" />
                <span>Multi-Location Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Branch Network
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Add multiple retail stores, regional corporate desks, service
                centers, and warehouses. Each branch displays on your public
                business profile with Google Maps directions, localized contact
                details, and timings.
              </p>
            </div>

            {/* Plan Tier Status Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 flex flex-col gap-3 min-w-[280px] sm:min-w-[320px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Your Subscription:</span>
                <Badge
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 shadow-xs",
                    isTier4
                      ? "bg-purple-600 hover:bg-purple-600 text-white border-0"
                      : isTier3
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white border-0"
                      : "bg-amber-600 hover:bg-amber-600 text-white border-0"
                  )}
                >
                  {planName || "Tier I (Free)"}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-2">
                <span className="text-xs text-slate-200 whitespace-nowrap">Branches Allowance:</span>
                <span className="text-sm font-black text-white shrink-0">
                  {isTier4
                    ? "Unlimited"
                    : isTier3
                    ? `${branches.length} / 1 Branch`
                    : "0 (Locked)"}
                </span>
              </div>

              {isTierLocked ? (
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  <Link href={membershipLink}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade to Unlock Branches
                  </Link>
                </Button>
              ) : hasReachedTier3Limit ? (
                <Button
                  onClick={() => setUpgradeModalOpen(true)}
                  size="sm"
                  className="w-full bg-linear-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-200" />
                  Upgrade to Tier IV for Unlimited
                </Button>
              ) : (
                <Button
                  onClick={openAddModal}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add New Branch
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* LOCKED STATE BANNER FOR TIER 1 & TIER 2 */}
        {isTierLocked && (
          <div className="rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/20 p-8 sm:p-10 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Multi-Branch Management is Locked
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                You are currently on <strong>{planName}</strong>. Multi-location branch listings, storefront photos, localized maps, and direct branch routing are available starting from <strong>Tier III (Growth)</strong> and <strong>Tier IV (Enterprise)</strong>.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-5 shadow-sm"
                >
                  <Link href={membershipLink}>
                    <span>Upgrade to Tier III (1 Branch) or Tier IV (Unlimited)</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE MANAGEMENT SECTION (TIER 3 & 4) */}
        {!isTierLocked && (
          <>
            {/* Stats row & Add button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Total Branches</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {branches.length}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-emerald-600 block">Publicly Visible</span>
                  <span className="text-xl font-black text-emerald-600">
                    {activeBranches.length}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-600 block">Hidden Drafts</span>
                  <span className="text-xl font-black text-amber-600">
                    {hiddenBranches.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  onClick={openAddModal}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs px-4"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add New Branch
                </Button>
              </div>
            </div>

            {/* Limit Warning for Tier 3 */}
            {hasReachedTier3Limit && (
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    <strong>1-Branch Limit Reached:</strong> Your Tier III plan allows 1 branch. Upgrade to <strong>Tier IV (Enterprise)</strong> to publish unlimited national and regional branches.
                  </p>
                </div>
                <Button
                  onClick={() => setUpgradeModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shrink-0"
                >
                  Upgrade to Tier IV
                </Button>
              </div>
            )}

            {/* Branches List */}
            {isLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Loading your branches...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No Branches Added Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Add your head office, retail stores, or regional distribution centers to showcase your nationwide presence on your public profile.
                </p>
                <Button
                  onClick={openAddModal}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-xs"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Your First Branch
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {branches.map((branch) => {
                  const imageUrl = resolveMediaUrl(branch.image);

                  return (
                    <div
                      key={branch._id}
                      className={cn(
                        "rounded-3xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between",
                        branch.isActive
                          ? "border-slate-200 dark:border-slate-800"
                          : "border-amber-200 dark:border-amber-900/40 bg-amber-50/20"
                      )}
                    >
                      {/* Branch Top Image / Banner */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={branch.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-850 text-slate-400">
                            <Store className="h-10 w-10 mb-1 opacity-40" />
                            <span className="text-[11px] font-semibold">Storefront Photo</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <Badge className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold border-0">
                            {branch.branchType || "Branch"}
                          </Badge>
                        </div>

                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleVisibility(branch)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md transition-all shadow-xs",
                              branch.isActive
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-amber-500 text-slate-950 hover:bg-amber-600 font-black"
                            )}
                            title={branch.isActive ? "Click to Hide from public" : "Click to Publish to public"}
                          >
                            {branch.isActive ? (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                {branch.name}
                              </h4>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                                {branch.city}{branch.state ? `, ${branch.state}` : ""}{branch.country ? ` (${branch.country})` : ""}
                              </p>
                            </div>
                          </div>

                          {/* Details List */}
                          <div className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            {branch.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{branch.address}{branch.pincode ? ` - ${branch.pincode}` : ""}</span>
                              </div>
                            )}

                            {branch.contactPerson && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {branch.contactPerson}
                                </span>
                              </div>
                            )}

                            {branch.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`tel:${branch.phone}`}
                                  className="text-blue-600 hover:underline font-semibold"
                                >
                                  {branch.phone}
                                </a>
                              </div>
                            )}

                            {branch.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`mailto:${branch.email}`}
                                  className="text-slate-600 dark:text-slate-300 hover:underline truncate"
                                >
                                  {branch.email}
                                </a>
                              </div>
                            )}

                            {branch.timings && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="text-[11px] truncate">{branch.timings}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          {branch.mapUrl ? (
                            <a
                              href={branch.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>View Map</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">No map link</span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(branch)}
                              className="h-8 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                              title="Edit branch details"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(branch)}
                              className="h-8 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                              title="Delete branch"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ADD / EDIT BRANCH MODAL */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <span>{editingBranch ? "Edit Branch Location" : "Add New Branch Location"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Provide accurate storefront or regional office contact information. This will be published on your public business profile.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-3">
              {/* Image Upload Row */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Branch Storefront / Office Photo
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {formData.image ? (
                    <div className="relative h-24 w-36 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={resolveMediaUrl(formData.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white text-[10px] hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-36 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Store className="h-6 w-6 mb-1 opacity-50" />
                      <span className="text-[10px]">No Photo</span>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upload storefront or office building photo
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Recommended: High resolution landscape image (PNG, JPG, WebP under 5 MB).
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="rounded-xl text-xs font-bold"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Branch Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="branch-name" className="text-xs font-bold">
                    Branch Name / Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="branch-name"
                    required
                    placeholder="e.g. South Mumbai Retail Outlet"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-type" className="text-xs font-bold">
                    Branch Type
                  </Label>
                  <Select
                    value={formData.branchType}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, branchType: val }))
                    }
                  >
                    <SelectTrigger id="branch-type" className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCH_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Person, Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-person" className="text-xs font-bold">
                    Branch Representative / Manager
                  </Label>
                  <Input
                    id="contact-person"
                    placeholder="e.g. Mohammad Azeem"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, contactPerson: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-phone" className="text-xs font-bold">
                    Phone / Mobile Number
                  </Label>
                  <Input
                    id="branch-phone"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-email" className="text-xs font-bold">
                    Branch Email
                  </Label>
                  <Input
                    id="branch-email"
                    type="email"
                    placeholder="e.g. branch@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Full Street Address */}
              <div className="space-y-1.5">
                <Label htmlFor="branch-address" className="text-xs font-bold">
                  Street / Building Address
                </Label>
                <Textarea
                  id="branch-address"
                  rows={2}
                  placeholder="e.g. Shop No. 12, Ground Floor, Trade Center, High Street"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: e.target.value }))
                  }
                  className="rounded-xl resize-none text-xs"
                />
              </div>

              {/* City, State, Country, Pincode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="branch-city" className="text-xs font-bold">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="branch-city"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, city: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-state" className="text-xs font-bold">
                    State
                  </Label>
                  <Input
                    id="branch-state"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, state: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-country" className="text-xs font-bold">
                    Country
                  </Label>
                  <Input
                    id="branch-country"
                    placeholder="India"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, country: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-pincode" className="text-xs font-bold">
                    Pincode
                  </Label>
                  <Input
                    id="branch-pincode"
                    placeholder="e.g. 400001"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, pincode: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Google Maps URL & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="branch-map" className="text-xs font-bold">
                    Google Maps URL (Get Directions Link)
                  </Label>
                  <Input
                    id="branch-map"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.mapUrl}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, mapUrl: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch-timings" className="text-xs font-bold">
                    Working Hours / Timings
                  </Label>
                  <Input
                    id="branch-timings"
                    placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM"
                    value={formData.timings}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, timings: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Publish to Public Business Profile
                  </p>
                  <p className="text-[11px] text-slate-500">
                    When active, this branch appears on your public company profile for visitors and clients.
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, isActive: checked }))
                  }
                />
              </div>

              {/* Modal Buttons */}
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Saving...</span>
                    </>
                  ) : editingBranch ? (
                    "Save Changes"
                  ) : (
                    "Create Branch"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Delete Branch Location</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-2">
                Are you sure you want to permanently delete{" "}
                <strong>"{branchToDelete?.name}"</strong>? This will remove the branch from your public business directory profile.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-xl font-bold text-xs"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Yes, Delete Branch"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tier 3 Quota Limit / Upgrade Modal */}
        <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 border-0 bg-slate-900 text-white shadow-2xl">
            <DialogHeader className="space-y-3 text-center sm:text-center items-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400/20 to-purple-600/30 border border-purple-400/40 shadow-inner">
                <Crown className="h-7 w-7 text-amber-400 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white">
                  Branch Limit Reached
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-1">
                  Your <span className="font-bold text-amber-300">Tier III (Growth)</span> plan allows a maximum of 1 branch location.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Current Allowance:</span>
                  <span className="font-bold text-amber-300">{branches.length} of 1 Branch Used</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-full bg-amber-400 rounded-full" />
                </div>
              </div>

              <div className="rounded-2xl bg-linear-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Unlock with Tier IV (Enterprise)
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pl-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited Branches:</strong> Add stores, warehouses & regional offices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Multi-Location Profile:</strong> Full branch locator on public profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Google Maps Navigation:</strong> Direct driving directions to each store</span>
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                asChild
                className="w-full h-11 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-900/30"
              >
                <Link href={membershipLink}>
                  <Crown className="h-4 w-4 mr-2 text-amber-200" />
                  Upgrade to Tier IV (Enterprise)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                Maybe Later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
