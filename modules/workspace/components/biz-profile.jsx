"use client";
import Link from "next/link";
import { Eye, FileBadge2, ImagePlus, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

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
import { businessApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

function BizProfile() {
  const { data: business, refetch } = useMyBusiness();
  const { data: categoriesData } = useCategories();
  
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

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
        industry: business.industry || "",
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
    }
  }, [business]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (business?._id) {
        await businessApi.update(business._id, formData);
      } else {
        await businessApi.create({
          ...formData,
          industry: formData.industry || "General",
          city: formData.city || "Mumbai",
          state: formData.state || "Maharashtra",
        });
      }
      await refetch();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to save business profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    try {
      await businessApi.uploadLogo(business._id, file);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to upload logo.");
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    setUploadingCover(true);
    try {
      await businessApi.uploadCover(business._id, file);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !business?._id) return;
    setUploadingGallery(true);
    try {
      await businessApi.uploadGallery(business._id, files);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to upload gallery photos.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !business?._id) return;
    setUploadingCert(true);
    try {
      await businessApi.uploadCertificate(business._id, file);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to upload certificate.");
    } finally {
      setUploadingCert(false);
      e.target.value = "";
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
                  <SelectContent>
                    {mainCategories.length > 0 ? (
                      <>
                        {mainCategories.map(mc => {
                          const subs = subCategories.filter(sc => sc.parent === mc.name);
                          return (
                            <SelectGroup key={mc.name}>
                              <SelectLabel className="font-semibold text-primary">{mc.name}</SelectLabel>
                              <SelectItem value={mc.name} className="italic text-muted-foreground ml-2">General {mc.name}</SelectItem>
                              {subs.map(sc => (
                                <SelectItem key={sc.name} value={sc.name} className="ml-4">{sc.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          );
                        })}
                      </>
                    ) : (
                      <SelectItem value={formData.industry || "General"}>{formData.industry || "General"}</SelectItem>
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
              <div className="flex flex-wrap gap-2 sm:col-span-2">
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
                <img
                  key={i}
                  src={resolveMediaUrl(src)}
                  alt="Gallery"
                  className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
                />
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
              <img
                src={resolveMediaUrl(business.logo)}
                alt="Logo"
                className="h-20 w-20 rounded-2xl border border-border object-cover"
              />
            ) : (
              <p className="text-xs text-muted-foreground">No logo uploaded yet.</p>
            )}
            <label className="mt-3 inline-block">
              <Button asChild size="sm" variant="outline" className="cursor-pointer">
                <span>Upload Logo</span>
              </Button>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </Panel>

          <Panel title="Cover / Banner Image" description="Background header banner for public profile">
            {business?.coverImage ? (
              <img
                src={resolveMediaUrl(business.coverImage)}
                alt="Cover Banner"
                className="aspect-[3/1] w-full rounded-xl border border-border object-cover mb-3"
              />
            ) : (
              <p className="text-xs text-muted-foreground mb-3">No cover banner uploaded yet.</p>
            )}
            <label className="inline-block">
              <Button asChild size="sm" variant="outline" className="cursor-pointer" disabled={uploadingCover}>
                <span>
                  {uploadingCover ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</>
                  ) : (
                    <><ImagePlus className="mr-2 h-3.5 w-3.5" />Upload Cover Banner</>
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
                    className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileBadge2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{decodeURIComponent(fileName)}</span>
                    <a
                      href={src.startsWith("http") ? src : `/api${src}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </a>
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
