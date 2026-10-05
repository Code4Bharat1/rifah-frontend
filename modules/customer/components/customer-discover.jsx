"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  MapPin,
  Tag,
  Star,
  ShieldCheck,
  Send,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  X,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { useBusinesses, useCategories, useChapters } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { enquiryApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { toast } from "sonner";

export function CustomerDiscover() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");

  // Fetch businesses
  const { data: bizData, isLoading: loadingBiz } = useBusinesses({ limit: 60 });
  const { data: catData } = useCategories();
  const { data: chapterData } = useChapters();

  const businesses = useMemo(() => {
    return Array.isArray(bizData) ? bizData : bizData?.businesses || [];
  }, [bizData]);

  const categories = useMemo(() => {
    return Array.isArray(catData) ? catData : catData?.categories || [];
  }, [catData]);

  const chapters = useMemo(() => {
    return Array.isArray(chapterData) ? chapterData : chapterData?.chapters || [];
  }, [chapterData]);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.industry?.toLowerCase().includes(q) ||
        b.categories?.some((c) => c?.toLowerCase().includes(q)) ||
        b.description?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        b.categories?.some((c) => c?.toLowerCase() === selectedCategory.toLowerCase()) ||
        b.industry?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesChapter =
        selectedChapter === "all" ||
        b.chapter?.toLowerCase() === selectedChapter.toLowerCase() ||
        b.chapterName?.toLowerCase() === selectedChapter.toLowerCase();

      return matchesSearch && matchesCat && matchesChapter;
    });
  }, [businesses, searchTerm, selectedCategory, selectedChapter]);

  // Enquiry modal state
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    title: "",
    category: "",
    quantity: "1",
    budget: "",
    requiredBy: "Within 1 week",
    location: user?.city || "",
    description: "",
  });

  const openEnquiryModal = (b) => {
    if (!user) {
      toast.info("Please sign in as a customer to send your enquiry.");
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer")}`);
      return;
    }
    setActiveBusiness(b);
    setEnquirySuccess(false);
    setEnquiryForm({
      title: "",
      category: b.categories?.[0] || b.industry || "General",
      quantity: "1",
      budget: "",
      requiredBy: "Within 1 week",
      location: user?.city || b.city || "",
      description: "",
    });
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in as a customer to send your enquiry.");
      router.push(`/login?role=customer&redirect=${encodeURIComponent("/customer")}`);
      return;
    }
    if (!activeBusiness) return;

    if (!enquiryForm.title.trim()) {
      toast.error("Please enter a requirement title.");
      return;
    }

    setSubmittingEnquiry(true);
    try {
      await enquiryApi.create({
        targetType: "business",
        targetBusiness: activeBusiness._id,
        title: enquiryForm.title.trim(),
        category: enquiryForm.category || "General",
        quantity: enquiryForm.quantity || "1",
        budget: enquiryForm.budget || "Competitive",
        location: enquiryForm.location || user?.city || "Not specified",
        requiredBy: enquiryForm.requiredBy || "Within 1 week",
        description: enquiryForm.description.trim(),
        guestName: user?.name || "Customer",
        guestEmail: user?.email || "",
        guestPhone: user?.phone || "",
      });

      setEnquirySuccess(true);
      toast.success(`Enquiry sent directly to ${activeBusiness.name}!`);
    } catch (err) {
      toast.error(err?.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  return (
    <AppShell
      role="customer"
      title="Discover Businesses"
      subtitle="Find verified chamber vendors, request custom price quotes and order"
    >
      <div className="space-y-6">
        {/* Search & Filter Header Bar */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by business name, product, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10.5 rounded-xl border-border text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10.5 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter / Location Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full h-10.5 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:border-emerald-500"
              >
                <option value="all">All Locations / Chapters</option>
                {chapters.map((ch) => (
                  <option key={ch._id || ch.name} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Showing <strong className="text-foreground">{filteredBusinesses.length}</strong> verified businesses
            </span>
            {(searchTerm || selectedCategory !== "all" || selectedChapter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedChapter("all");
                }}
                className="text-emerald-600 hover:underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Business Grid */}
        {loadingBiz ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/40 animate-pulse border border-border/60" />
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-foreground">No businesses found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or clearing your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBusinesses.map((b) => {
              const logoUrl = resolveMediaUrl(b.logo || b.profilePhoto);
              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header info */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <div className="h-12 w-12 rounded-xl bg-muted/60 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {logoUrl ? (
                          <img src={logoUrl} alt={b.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground truncate group-hover:text-emerald-600 transition-colors">
                            {b.name}
                          </h4>
                          {b.isVerified && (
                            <span className="inline-flex items-center text-emerald-600" title="Verified Chamber Member">
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {b.categories?.[0] || b.industry || "Business Member"}
                        </p>
                      </div>
                    </div>

                    {/* Location & Contact Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mb-3">
                      {(b.city || b.chapter) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {b.city || b.chapter}
                        </span>
                      )}
                      {b.membership && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium">
                          <Star className="h-3 w-3" />
                          {b.membership}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {b.description || b.tagline || "Verified member business offering ethical products and professional services."}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-muted/20 border-t border-border/70 flex items-center gap-2.5">
                    <Button
                      onClick={() => openEnquiryModal(b)}
                      className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Enquiry
                    </Button>

                    <Link
                      href={`/biz/${b.slug || b._id}`}
                      target="_blank"
                      className="h-9 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      title="View Business Profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Enquiry Modal */}
      <Dialog open={Boolean(activeBusiness)} onOpenChange={(open) => !open && setActiveBusiness(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border-border bg-card">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          
          <div className="p-6">
            <DialogHeader className="mb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Send Direct Enquiry
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Directly to <strong className="text-foreground">{activeBusiness?.name}</strong>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {enquirySuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Enquiry Dispatched!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Your enquiry has been delivered directly to <strong>{activeBusiness?.name}</strong>. 
                    They will review your requirement, accept it, and send you an official price quotation.
                  </p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    href="/customer/enquiries"
                    className="w-full sm:w-auto h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    View in My Enquiries
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => setActiveBusiness(null)}
                    className="w-full sm:w-auto h-9 rounded-xl text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                {/* Title */}
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">
                    Requirement Title *
                  </Label>
                  <Input
                    placeholder="e.g. Bulk Office Stationery or Catering Service"
                    value={enquiryForm.title}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, title: e.target.value }))}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                {/* Quantity & Budget */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Quantity / Volume
                    </Label>
                    <Input
                      placeholder="e.g. 50 units"
                      value={enquiryForm.quantity}
                      onChange={(e) => setEnquiryForm((p) => ({ ...p, quantity: e.target.value }))}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Estimated Budget (INR)
                    </Label>
                    <Input
                      placeholder="e.g. ₹25,000"
                      value={enquiryForm.budget}
                      onChange={(e) => setEnquiryForm((p) => ({ ...p, budget: e.target.value }))}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Timeline & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Required By
                    </Label>
                    <select
                      value={enquiryForm.requiredBy}
                      onChange={(e) => setEnquiryForm((p) => ({ ...p, requiredBy: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden"
                    >
                      <option value="Immediate">Immediate (1-2 days)</option>
                      <option value="Within 1 week">Within 1 week</option>
                      <option value="Within 2 weeks">Within 2 weeks</option>
                      <option value="Within 1 month">Within 1 month</option>
                      <option value="Flexible">Flexible timeline</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Delivery City / Location
                    </Label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={enquiryForm.location}
                      onChange={(e) => setEnquiryForm((p) => ({ ...p, location: e.target.value }))}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">
                    Detailed Specifications / Notes
                  </Label>
                  <Textarea
                    placeholder="Provide specific sizes, materials, scope of work, or any custom instructions..."
                    value={enquiryForm.description}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, description: e.target.value }))}
                    className="min-h-[80px] text-xs rounded-xl resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveBusiness(null)}
                    disabled={submittingEnquiry}
                    className="h-9 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                  >
                    {submittingEnquiry ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Send Direct Enquiry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
export default CustomerDiscover;
