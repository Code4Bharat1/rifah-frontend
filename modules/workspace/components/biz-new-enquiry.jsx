"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  Send,
  AlertCircle,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
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
  useBusinesses,
  useCategories,
  useChapters,
  useMyBusiness,
} from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { enquiryApi } from "@shared/lib/api-services";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";

const B2B_CATEGORIES = [
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

export function BizNewEnquiry() {
  const router = useRouter();

  // Targeting options
  const [targetType, setTargetType] = useState("all"); // 'all' | 'state' | 'business'
  const [selectedState, setSelectedState] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState("");

  // Requirement form data
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    quantity: "",
    budget: "",
    requiredBy: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRef, setCreatedRef] = useState(null);

  // Queries for dynamic dropdowns
  const { user } = useAuth();
  const { data: myBiz } = useMyBusiness();
  const { data: chaptersData, isLoading: loadingChapters } = useChapters();
  const { data: categoriesData } = useCategories();
  const { data: businessesData, isLoading: loadingBusinesses } = useBusinesses({
    status: "Live",
    limit: 150,
    ...(selectedChapter ? { chapter: selectedChapter } : {}),
  });

  const chapters = Array.isArray(chaptersData)
    ? chaptersData
    : chaptersData?.chapters || [];
  const rawCategories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || [];
  const categories = rawCategories.length > 0
    ? rawCategories
    : B2B_CATEGORIES.map((c) => ({ name: c, _id: c }));

  // Resolve current business's registered state
  const myChapter = chapters.find(
    (ch) =>
      (myBiz?.chapterId && String(ch._id) === String(myBiz.chapterId)) ||
      (myBiz?.chapter && ch.name?.toLowerCase() === myBiz.chapter?.toLowerCase())
  );
  const rawOwnState = (myBiz?.state || myChapter?.state || user?.state || "").trim();
  const ownState = rawOwnState
    ? rawOwnState.charAt(0).toUpperCase() + rawOwnState.slice(1)
    : "";

  // Derive unique states from chapters list with proper title case
  const allStates = [
    ...new Set(
      chapters
        .map((ch) => ch.state?.trim())
        .filter(Boolean)
        .map((st) => st.charAt(0).toUpperCase() + st.slice(1).toLowerCase())
    ),
  ].sort();

  // Chapters filtered by selected state (for business cascading picker)
  const chaptersInState = selectedState
    ? chapters.filter((ch) => (ch.state || "").trim().toLowerCase() === selectedState.trim().toLowerCase())
    : [];

  // Filter out current business so user doesn't target themselves
  const allBusinesses = Array.isArray(businessesData)
    ? businessesData
    : businessesData?.businesses || [];
  const businesses = allBusinesses.filter((b) => {
    if (String(b._id) === String(myBiz?._id)) return false;
    // If a chapter is selected in the cascading picker, filter by chapter name
    if (targetType === "business" && selectedChapter) {
      const bCh = (b.chapter || b.chapterName || "").trim().toLowerCase();
      const sCh = selectedChapter.trim().toLowerCase();
      const bNorm = bCh.replace(/\s+chapter$/i, "");
      const sNorm = sCh.replace(/\s+chapter$/i, "");
      return bCh === sCh || bNorm === sNorm;
    }
    return true;
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Please provide a requirement title.");
      return;
    }
    if (!formData.category) {
      setError("Please select a business category.");
      return;
    }
    if (!formData.quantity.trim()) {
      setError("Please specify the required quantity.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please specify the delivery location / city.");
      return;
    }
    if (!formData.requiredBy) {
      setError("Please select the required-by timeline or date.");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (formData.requiredBy < todayStr) {
      setError("Required-by date cannot be in the past.");
      return;
    }

    if (targetType === "state" && !ownState) {
      setError("Unable to determine your registered state. Please ensure your business profile has a state or chapter assigned.");
      return;
    }

    if (targetType === "business" && !selectedBusiness) {
      setError("Please select a target vendor.");
      return;
    }

    setLoading(true);

    try {
      const senderName = user?.name || myBiz?.contactPerson || myBiz?.name || "Business Member";
      const senderEmail = user?.email || myBiz?.email || "";
      const senderPhone = user?.phone || myBiz?.phone || "";

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        quantity: formData.quantity.trim(),
        budget: formData.budget.trim() || "Competitive / Market standard",
        location: formData.location.trim(),
        requiredBy: formData.requiredBy,
        description: formData.description.trim(),
        targetType,
        sourceType: "b2b",
        guestName: senderName,
        guestEmail: senderEmail,
        guestPhone: senderPhone,
        ...(targetType === "state" ? { targetState: ownState } : {}),
        ...(targetType === "business" ? { targetBusiness: selectedBusiness } : {}),
      };

      const res = await enquiryApi.create(payload);
      const refId = res?.data?.referenceId || "ENQ";
      setCreatedRef(refId);
    } catch (err) {
      console.error("B2B Enquiry submission error:", err);
      setError(err.message || "Failed to submit B2B requirement. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (createdRef) {
    return (
      <AppShell
        role="business"
        title="Post B2B Requirement"
        subtitle="Sourcing requirement submitted successfully"
      >
        <div className="mx-auto max-w-xl py-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">B2B Requirement Posted!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your sourcing requirement <span className="font-semibold text-foreground">{createdRef}</span> has been delivered directly
            {targetType === "all" && " to verified member businesses across the RIFAH Chamber network without admin delay."}
            {targetType === "state" && ` to verified member businesses across ${ownState || "your state"} without admin delay.`}
            {targetType === "business" && " to the selected vendor business directly."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/biz/my-enquiries">View My Posted Enquiries</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedRef(null);
                setFormData({
                  title: "",
                  category: "",
                  quantity: "",
                  budget: "",
                  requiredBy: "",
                  location: "",
                  description: "",
                });
                setSelectedState("");
                setSelectedChapter("");
                setSelectedBusiness("");
              }}
            >
              Post Another Requirement
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="business"
      title="Post B2B Requirement"
      subtitle="Source materials, products, or services from verified businesses across the chamber"
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/biz/my-enquiries" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to My Enquiries
          </Link>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* SECTION 1: Target Audience Selection */}
        <Panel
          title="1. Target Audience & Distribution"
          subtitle="Choose how your B2B sourcing requirement is delivered to businesses"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Option 1: All Businesses */}
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${targetType === "all"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Pan-Chamber
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">All Businesses</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Direct broadcast to all active member businesses across India.
                </p>
              </button>

              {/* Option 2: Own State */}
              <button
                type="button"
                onClick={() => { setTargetType("state"); setSelectedState(""); setSelectedChapter(""); setSelectedBusiness(""); }}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${targetType === "state"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    State-Wide
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">
                  {ownState ? `${ownState} (Own State)` : "Own State"}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Broadcast exclusively to all member businesses registered in {ownState || "your state"}.
                </p>
              </button>

              {/* Option 3: Specific Business */}
              <button
                type="button"
                onClick={() => { setTargetType("business"); setSelectedState(""); setSelectedChapter(""); setSelectedBusiness(""); }}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${targetType === "business"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Direct
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">Specific Business</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Send a direct sourcing requirement to one specific vendor.
                </p>
              </button>
            </div>

            {/* Conditional: Own State Information */}
            {targetType === "state" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-foreground">
                    Target State: <span className="font-bold text-blue-600 dark:text-blue-400">{ownState || "Your Registered State"}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  This enquiry is automatically restricted to your own state ({ownState || "registered state"}). Only active member businesses belonging to {ownState || "your state"} will receive this requirement.
                </p>
              </div>
            )}

            {/* Conditional: Specific Business — cascading State → Chapter → Business */}
            {targetType === "business" && (
              <div className="space-y-3 rounded-xl border border-border bg-surface-raised p-4">
                <div>
                  <Label htmlFor="biz-state-select" className="text-sm font-semibold">
                    Step 1 — Select State *
                  </Label>
                  <p className="mb-2 text-xs text-muted-foreground">Narrow down by state first.</p>
                  <Select
                    value={selectedState}
                    onValueChange={(val) => { setSelectedState(val); setSelectedChapter(""); setSelectedBusiness(""); }}
                    disabled={loadingChapters}
                  >
                    <SelectTrigger id="biz-state-select" className="w-full">
                      <SelectValue placeholder={loadingChapters ? "Loading..." : "Choose a state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {allStates.map((st) => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedState && (
                  <div>
                    <Label htmlFor="biz-chapter-select" className="text-sm font-semibold">
                      Step 2 — Select Chapter *
                    </Label>
                    <p className="mb-2 text-xs text-muted-foreground">Choose the chapter within {selectedState}.</p>
                    <Select
                      value={selectedChapter}
                      onValueChange={(val) => { setSelectedChapter(val); setSelectedBusiness(""); }}
                    >
                      <SelectTrigger id="biz-chapter-select" className="w-full">
                        <SelectValue placeholder="Choose a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chaptersInState.map((ch) => (
                          <SelectItem key={ch._id || ch.name} value={ch.name}>
                            {ch.name} {ch.city ? `(${ch.city})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedChapter && (
                  <div>
                    <Label htmlFor="business-select" className="text-sm font-semibold">
                      Step 3 — Select Target Business *
                    </Label>
                    <p className="mb-2 text-xs text-muted-foreground">Choose the member business to send this requirement directly to.</p>
                    <Select
                      value={selectedBusiness}
                      onValueChange={setSelectedBusiness}
                      disabled={loadingBusinesses}
                    >
                      <SelectTrigger id="business-select" className="w-full">
                        <SelectValue placeholder={loadingBusinesses ? "Loading businesses..." : "Select a business"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {businesses.map((biz) => (
                          <SelectItem key={biz._id} value={biz._id}>
                            {biz.name} {biz.city ? `· ${biz.city}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* SECTION 2: Requirement Details */}
        <Panel
          title="2. Sourcing Details & Specifications"
          subtitle="Clear specifications help member businesses provide accurate and competitive quotations"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                Requirement Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Bulk Procurement of 2,000 Heavy Duty Corrugated Boxes"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category" className="text-sm font-semibold">
                  Business Category *
                </Label>
                <CreatableCombobox
                  id="category"
                  value={formData.category}
                  onValueChange={(val) => handleInputChange("category", val)}
                  options={categories.map((cat) => (typeof cat === "string" ? cat : cat.name))}
                  placeholder="Select or search category"
                  emptyText="No category found. Type to add custom."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-semibold">
                  Required Quantity *
                </Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 2,000 Units, 5 Metric Tons"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="budget" className="text-sm font-semibold">
                  Target Budget (Optional, ₹)
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">₹</span>
                  <Input
                    id="budget"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 150000"
                    value={formData.budget}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,.]/g, "");
                      handleInputChange("budget", val);
                    }}
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requiredBy" className="text-sm font-semibold">
                  Required By Date *
                </Label>
                <Input
                  id="requiredBy"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.requiredBy}
                  onChange={(e) => handleInputChange("requiredBy", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-semibold">
                Delivery Location / Plant *
              </Label>
              <Input
                id="location"
                placeholder="e.g., MIDC Andheri East, Mumbai"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Detailed Technical Specifications & Requirements (Optional)
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Specify dimensions, GSM, grade, finish, ISO/ISI certification requirements, delivery terms, credit/payment terms..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Panel>

        {/* Submission Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" asChild>
            <Link href="/biz/my-enquiries">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[170px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Post B2B Requirement
              </>
            )}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
