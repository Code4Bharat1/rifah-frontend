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
  MessageSquarePlus,
} from "lucide-react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { PhoneInput } from "@shared/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { useBusinesses, useCategories, useChapters } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { enquiryApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cities } from "@shared/lib/mock-data";
import { toast } from "sonner";

const INDIAN_CITIES = Array.from(
  new Set([
    ...(cities || []),
    "Mumbai",
    "Navi Mumbai",
    "Thane",
    "Kalyan-Dombivli",
    "Mira-Bhayandar",
    "Vasai-Virar",
    "Pune",
    "Pimpri-Chinchwad",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Kolhapur",
    "New Delhi",
    "Delhi",
    "Noida",
    "Greater Noida",
    "Gurgaon",
    "Faridabad",
    "Ghaziabad",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Jaipur",
    "Jodhpur",
    "Lucknow",
    "Kanpur",
    "Varanasi",
    "Agra",
    "Prayagraj",
    "Indore",
    "Bhopal",
    "Gwalior",
    "Jabalpur",
    "Patna",
    "Ranchi",
    "Jamshedpur",
    "Chandigarh",
    "Ludhiana",
    "Amritsar",
    "Dehradun",
    "Guwahati",
    "Bhubaneswar",
    "Cuttack",
    "Raipur",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Kochi",
    "Thiruvananthapuram",
    "Kozhikode",
    "Mangalore",
    "Mysore",
    "Hubli-Dharwad",
    "Belgaum",
    "Goa (Panaji)",
    "Srinagar",
    "Jammu",
  ])
).sort();

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
  const [enquiryError, setEnquiryError] = useState("");
  const [enquiryForm, setEnquiryForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    location: "",
    title: "",
    quantity: "",
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
    setEnquiryError("");
    setEnquiryForm({
      guestName: user?.name || "",
      guestEmail: user?.email || "",
      guestPhone: user?.phone || "",
      location: user?.city || b.city || "",
      title: "",
      quantity: "",
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

    if (!enquiryForm.guestName.trim()) {
      setEnquiryError("Please enter your name.");
      toast.error("Please enter your name.");
      return;
    }

    if (!enquiryForm.guestEmail.trim()) {
      setEnquiryError("Please enter your email.");
      toast.error("Please enter your email.");
      return;
    }

    if (!enquiryForm.guestPhone.trim()) {
      setEnquiryError("Please enter your mobile number.");
      toast.error("Please enter your mobile number.");
      return;
    }

    if (!enquiryForm.title.trim()) {
      setEnquiryError("Please enter your requirement.");
      toast.error("Please enter your requirement.");
      return;
    }

    setSubmittingEnquiry(true);
    setEnquiryError("");

    try {
      await enquiryApi.create({
        targetType: "business",
        targetBusiness: activeBusiness._id,
        sourceType: "marketplace",
        isMarketplace: true,
        title: enquiryForm.title.trim(),
        category: activeBusiness.industry || activeBusiness.categories?.[0] || "General",
        quantity: enquiryForm.quantity || "As discussed",
        location: enquiryForm.location || activeBusiness.city || "Not specified",
        requiredBy: "Flexible",
        description: enquiryForm.description.trim(),
        guestName: enquiryForm.guestName.trim(),
        guestEmail: enquiryForm.guestEmail.trim(),
        guestPhone: enquiryForm.guestPhone.trim(),
      });

      setEnquirySuccess(true);
      toast.success(`Enquiry sent directly to ${activeBusiness.name}!`);
    } catch (err) {
      const errMsg = err?.message || "Failed to submit enquiry. Please try again.";
      setEnquiryError(errMsg);
      toast.error(errMsg);
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
          <div className="text-center py-16 bg-card border border-border/80 rounded-3xl p-8 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-foreground">No businesses found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to discover more chamber vendors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBusinesses.map((b) => {
              const logoUrl = resolveMediaUrl(b.logo || b.profilePhoto);
              const profileHref = `/business/${b.slug || b._id}`;
              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header info */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <Link href={profileHref} className="h-12 w-12 rounded-xl bg-muted/60 border border-border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer">
                        {logoUrl ? (
                          <img src={logoUrl} alt={b.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link href={profileHref}>
                            <h4 className="font-bold text-sm text-foreground truncate group-hover:text-emerald-600 hover:underline transition-colors cursor-pointer">
                              {b.name}
                            </h4>
                          </Link>
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
                      className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Enquiry
                    </Button>

                    <Link
                      href={profileHref}
                      className="h-9 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Direct Enquiry Modal - Matches Business Profile Page Enquiry Form */}
      <Dialog open={Boolean(activeBusiness)} onOpenChange={(open) => !open && setActiveBusiness(null)}>
        <DialogContent className="sm:max-w-lg max-h-[88vh] rounded-2xl p-0 overflow-hidden border-border bg-card flex flex-col shadow-2xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shrink-0" />
          
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 max-h-[calc(88vh-8px)] [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent]">
            <DialogHeader className="mb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Send Enquiry
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Send your requirement directly to <strong className="text-foreground">{activeBusiness?.name}</strong>. They will receive your enquiry and respond.
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
                  <h3 className="text-base font-bold text-foreground">Enquiry Sent!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Your enquiry has been submitted to <strong>{activeBusiness?.name}</strong>. They will get back to you via the contact details you provided.
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
                    className="w-full sm:w-auto h-9 rounded-xl text-xs cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                {enquiryError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 sm:p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{enquiryError}</span>
                  </div>
                )}

                {/* Name & Email (matches Business Profile) */}
                <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                      Your Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      value={enquiryForm.guestName}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, guestName: e.target.value }))}
                      placeholder="Full name"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                      Your Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      required
                      value={enquiryForm.guestEmail}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                      placeholder="you@example.com"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Phone & City (matches Business Profile) */}
                <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                      Mobile Number <span className="text-destructive">*</span>
                    </label>
                    <PhoneInput
                      required
                      value={enquiryForm.guestPhone}
                      onChange={(val) =>
                        setEnquiryForm((prev) => ({
                          ...prev,
                          guestPhone: typeof val === "string" ? val : (val?.target?.value ?? ""),
                        }))
                      }
                      placeholder="Mobile number"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                      City <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={enquiryForm.location || ""}
                      onValueChange={(val) => setEnquiryForm((prev) => ({ ...prev, location: val }))}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-transparent text-xs">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {INDIAN_CITIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Requirement (matches Business Profile) */}
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                    Requirement <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={enquiryForm.title}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Need 500 units of custom packaging"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Quantity (matches Business Profile) */}
                <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                      Quantity
                    </label>
                    <Input
                      type="text"
                      value={enquiryForm.quantity}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, quantity: e.target.value }))}
                      placeholder="e.g. 500 units"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Additional Details (matches Business Profile) */}
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                    Additional Details <span className="text-muted-foreground font-normal text-[10px]">(optional)</span>
                  </label>
                  <Textarea
                    value={enquiryForm.description}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    placeholder="Specifications, delivery expectations, any other details..."
                    className="min-h-[80px] text-xs rounded-xl resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveBusiness(null)}
                    disabled={submittingEnquiry}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingEnquiry}
                    className="rounded-xl gap-1.5 font-semibold sm:min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    {submittingEnquiry ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Enquiry
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
