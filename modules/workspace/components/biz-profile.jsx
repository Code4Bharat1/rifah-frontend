"use client";
import Link from "next/link";
import { Eye, FileBadge2, ImagePlus, Loader2, CheckCircle2, Trash2, X, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Progress } from "@shared/components/ui/progress";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@shared/components/ui/select";
import { useMyBusiness, useCategories } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { businessApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

const B2B_INDUSTRIES = [
  "Industrial Machinery & Tools",
  "IT & Software Services",
  "Building, Construction & Real Estate",
  "Textiles, Garments & Apparel",
  "Healthcare & Pharmaceuticals",
  "Food Products & Agro Commodities",
  "Logistics, Freight & Supply Chain",
  "Electrical, Electronics & Solar",
  "Chemicals, Plastics & Packaging",
  "Financial, Legal & Advisory Services",
  "Automotive, Parts & Spares",
  "Wholesale & Retail Merchandise",
  "Education, EdTech & Corporate Training",
  "Printing, Paper & Publishing",
  "Facility Management, Security & Cleaning",
  "Manufacturing & Engineering",
  "Agriculture & Farming",
  "Renewable Energy & Environment",
  "Hospitality & Tourism",
  "Import & Export Services",
];

function BizProfile() {
  const queryClient = useQueryClient();
  const { data: business, refetch } = useMyBusiness();
  const { user } = useAuth();
  const { data: categoriesData } = useCategories();

  const rawCategories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || [];
  const categories = rawCategories.length > 0
    ? rawCategories
    : B2B_INDUSTRIES.map((c) => ({ name: c, _id: c, parent: "" }));
  const mainCategories = categories.filter((c) => !c.parent);
  const subCategories = categories.filter((c) => c.parent);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    industry: "",
    city: "",
    state: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    about: "",
    founded: "",
    employees: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        tagline: business.tagline || "",
        industry: business.industry || business.categories?.[0] || business.category || "",
        city: business.city || "",
        state: business.state || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        about: business.about || "",
        founded: business.founded || "",
        employees: business.employees || "",
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.organization || `${user.name}'s Enterprise`,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        city: prev.city || user.city || "",
        state: prev.state || "",
      }));
    }
  }, [business, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        categories: formData.industry ? [formData.industry] : [],
      };

      if (business?._id) {
        await businessApi.update(business._id, payload);
      } else {
        try {
          await businessApi.create(payload);
        } catch (createErr) {
          // If a business document already exists (e.g. from checkout auto-creation), fetch and update it
          const freshRes = await businessApi.getMyBusiness();
          const freshBiz = freshRes?.data || freshRes;
          if (freshBiz?._id) {
            await businessApi.update(freshBiz._id, payload);
          } else {
            throw createErr;
          }
        }
      }
      syncBusinessCache();
      setSaveSuccess(true);
      toast.success("Business profile saved successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || "Failed to save business profile.");
    } finally {
      setSaving(false);
    }
  };

  const syncBusinessCache = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["my-business"] });
    if (business?._id) {
      queryClient.invalidateQueries({ queryKey: ["business", business._id] });
    }
    if (business?.slug) {
      queryClient.invalidateQueries({ queryKey: ["business", business.slug] });
    }
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    try {
      await businessApi.uploadLogo(business._id, file);
      toast.success("Logo uploaded successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to upload logo.");
    }
  };

  const handleDeleteLogo = async () => {
    if (!business?._id) return;
    try {
      await businessApi.update(business._id, { logo: "" });
      toast.success("Logo removed successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to remove logo.");
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    setUploadingCover(true);
    try {
      await businessApi.uploadCover(business._id, file);
      toast.success("Cover image updated successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleDeleteCover = async () => {
    if (!business?._id) return;
    try {
      await businessApi.update(business._id, { coverImage: "" });
      toast.success("Cover banner removed successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to remove cover banner.");
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !business?._id) return;
    setUploadingGallery(true);
    try {
      await businessApi.uploadGallery(business._id, files);
      toast.success("Gallery photos updated successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to upload gallery photos.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (indexToDelete) => {
    if (!business?._id) return;
    try {
      const currentGallery = Array.isArray(business.gallery) ? business.gallery : [];
      const updatedGallery = currentGallery.filter((_, idx) => idx !== indexToDelete);
      await businessApi.update(business._id, { gallery: updatedGallery });
      toast.success("Photo removed from gallery");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to delete gallery image.");
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    setUploadingCert(true);
    try {
      await businessApi.uploadCertificate(business._id, file);
      toast.success("Certificate uploaded successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to upload certificate.");
    } finally {
      setUploadingCert(false);
      e.target.value = "";
    }
  };

  const handleDeleteCertificate = async (indexToDelete) => {
    if (!business?._id) return;
    try {
      const currentCerts = Array.isArray(business.certifications) ? business.certifications : [];
      const updatedCerts = currentCerts.filter((_, idx) => idx !== indexToDelete);
      await businessApi.update(business._id, { certifications: updatedCerts });
      toast.success("Certificate removed successfully");
      syncBusinessCache();
    } catch (err) {
      toast.error(err.message || "Failed to delete certificate.");
    }
  };

  const bizSlugOrId = business?.slug || business?._id || "";

  return (
    <AppShell
      role="business"
      title="Business profile"
      subtitle="How buyers see your enterprise"
      actions={
        <Button asChild variant="outline">
          <Link href={`/business/${bizSlugOrId}`}>
            <Eye className="h-4 w-4" /> Preview
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Company details">
            {saveSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft p-3 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
              </div>
            )}
            {(!business?.state || !business?._id) && (
              <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs text-foreground">
                <p className="font-semibold text-primary">Action Required: Complete Your Business Details</p>
                <p className="mt-0.5 text-muted-foreground">
                  Please fill in your registered business address, city, and state below to submit your verification paperwork.
                </p>
              </div>
            )}
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-name">Business name *</Label>
                <Input
                  id="biz-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-tagline">Tagline / Short description</Label>
                <Input
                  id="biz-tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Leading precision component manufacturer"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="biz-industry">Industry Category</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(v) => setFormData({ ...formData, industry: v })}
                >
                  <SelectTrigger id="biz-industry" className="h-11">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {formData.industry &&
                      !categories.some((c) => c.name === formData.industry) &&
                      !B2B_INDUSTRIES.includes(formData.industry) && (
                        <SelectItem value={formData.industry}>{formData.industry}</SelectItem>
                      )}
                    {mainCategories.length > 0 ? (
                      <>
                        {mainCategories.map((mc) => {
                          const subs = subCategories.filter((sc) => sc.parent === mc.name);
                          return subs.length > 0 ? (
                            <SelectGroup key={mc.name}>
                              <SelectLabel className="font-semibold text-primary">{mc.name}</SelectLabel>
                              <SelectItem value={mc.name} className="italic text-muted-foreground ml-2">General {mc.name}</SelectItem>
                              {subs.map((sc) => (
                                <SelectItem key={sc.name} value={sc.name} className="ml-4">{sc.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          ) : (
                            <SelectItem key={mc._id || mc.name} value={mc.name}>
                              {mc.name}
                            </SelectItem>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {B2B_INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="biz-city">City</Label>
                <Input
                  id="biz-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Ahmedabad, Delhi, Bangalore"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="biz-state">State</Label>
                <Input
                  id="biz-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Gujarat, Delhi, Karnataka"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="biz-phone">Phone</Label>
                <Input
                  id="biz-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="biz-email">Contact Email</Label>
                <Input
                  id="biz-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-about">About the business</Label>
                <Textarea
                  id="biz-about"
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Photo Gallery" description="Facility, workshop and machinery imagery">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(business?.gallery || []).map((src, i) => (
                <div key={i} className="group relative aspect-[4/3] w-full rounded-xl border border-border overflow-hidden bg-slate-100 shadow-2xs">
                  <img
                    src={resolveMediaUrl(src)}
                    alt={`Gallery photo ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Dark hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  {/* Cancel / Delete Cross Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryImage(i)}
                    className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 opacity-90 sm:opacity-0 sm:scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md cursor-pointer z-10"
                    title="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                {uploadingGallery ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[11px] font-medium">Add photos</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Logo Image">
            {business?.logo ? (
              <div className="relative inline-block group rounded-2xl overflow-hidden border border-border">
                <img
                  src={resolveMediaUrl(business.logo)}
                  alt="Logo"
                  className="h-24 w-24 object-cover shadow-2xs"
                />
                {/* Dark hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                {/* Cancel / Delete Cross Button */}
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 opacity-90 sm:opacity-0 sm:scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md cursor-pointer z-10"
                  title="Remove logo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No logo uploaded yet.</p>
            )}
            <div className="mt-3">
              <label className="inline-block">
                <Button asChild size="sm" variant="outline" className="cursor-pointer">
                  <span>{business?.logo ? "Change Logo" : "Upload Logo"}</span>
                </Button>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </Panel>

          <Panel title="Cover / Banner Image" description="Background header banner for public profile">
            {business?.coverImage ? (
              <div className="relative group mb-3 rounded-xl overflow-hidden border border-border">
                <img
                  src={resolveMediaUrl(business.coverImage)}
                  alt="Cover Banner"
                  className="aspect-[3/1] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {/* Dark hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                {/* Cancel / Delete Cross Button */}
                <button
                  type="button"
                  onClick={handleDeleteCover}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 opacity-90 sm:opacity-0 sm:scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md cursor-pointer z-10"
                  title="Remove cover banner"
                >
                  <X className="h-3.5 w-3.5" /> Remove banner
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">No cover banner uploaded yet.</p>
            )}
            <label className="inline-block">
              <Button asChild size="sm" variant="outline" className="cursor-pointer" disabled={uploadingCover}>
                <span>
                  {uploadingCover ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</>
                  ) : (
                    <><ImagePlus className="mr-2 h-3.5 w-3.5" />{business?.coverImage ? "Change Cover Banner" : "Upload Cover Banner"}</>
                  )}
                </span>
              </Button>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </Panel>

          <Panel title="Certifications">
            <div className="space-y-2">
              {(business?.certifications || []).length === 0 && (
                <p className="text-xs text-muted-foreground">No certificates uploaded yet.</p>
              )}
              {(business?.certifications || []).map((src, i) => {
                const fileName = src.split("/").pop() || `Certificate ${i + 1}`;
                return (
                  <div
                    key={i}
                    className="group flex items-center justify-between gap-2.5 rounded-xl border border-border px-3 py-2.5 bg-card/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FileBadge2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium">{decodeURIComponent(fileName)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={resolveMediaUrl(src)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertificate(i)}
                        className="grid h-6 w-6 place-items-center rounded-full text-slate-400 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete certificate"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <label className="mt-3 inline-block">
              <Button asChild size="sm" variant="outline" className="cursor-pointer" disabled={uploadingCert}>
                <span>
                  {uploadingCert ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</>
                  ) : (
                    <><FileBadge2 className="mr-2 h-3.5 w-3.5" />Upload Certificate</>
                  )}
                </span>
              </Button>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleCertificateUpload}
                className="hidden"
              />
            </label>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export { BizProfile };
export default BizProfile;
