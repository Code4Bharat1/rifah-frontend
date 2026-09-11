"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
  useCategories,
  useChapters,
} from "@shared/hooks/use-rifah-api";
import { enquiryApi } from "@shared/lib/api-services";

export function CustomerNewEnquiry() {
  const router = useRouter();

  // Sourcing scope options
  const [targetType, setTargetType] = useState("all"); // 'all' | 'chamber'
  const [selectedChapter, setSelectedChapter] = useState("");

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
  const { data: chaptersData, isLoading: loadingChapters } = useChapters();
  const { data: categoriesData } = useCategories();

  const chapters = Array.isArray(chaptersData)
    ? chaptersData
    : chaptersData?.chapters || [];
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError("Please provide a requirement title (at least 3 characters).");
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

    if (targetType === "chamber" && !selectedChapter) {
      setError("Please select a target chamber / chapter.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        quantity: formData.quantity.trim(),
        budget: formData.budget.trim() || "Competitive / Market standard",
        location: formData.location.trim(),
        requiredBy: formData.requiredBy,
        description: formData.description.trim(),
        targetType: targetType === "chamber" ? "chamber" : "all",
        ...(targetType === "chamber" ? { chapter: selectedChapter } : {}),
      };

      const res = await enquiryApi.create(payload);
      const refId = res?.data?.referenceId || "ENQ";
      setCreatedRef(refId);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setError(err.message || "Failed to submit enquiry. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (createdRef) {
    return (
      <AppShell
        role="customer"
        title="Post Requirement"
        subtitle="Sourcing requirement submitted successfully"
      >
        <div className="mx-auto max-w-xl py-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Requirement Submitted!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your enquiry <span className="font-semibold text-foreground">{createdRef}</span> has been successfully recorded and submitted to the RIFAH Chamber administration.
            Our team will review your requirement and route it to matching verified businesses, who will review your specifications and submit quotations.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/me/enquiries">View My Enquiries</Link>
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
      role="customer"
      title="Post Requirement"
      subtitle="Submit your sourcing requirement to the RIFAH Chamber network for admin review and verified business routing"
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/me/enquiries" className="flex items-center gap-1.5">
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

        {/* SECTION 1: Target Sourcing Scope */}
        <Panel
          title="1. Sourcing Scope & Coverage"
          subtitle="Select regional preferences for your requirement (Admin will route to matching businesses)"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <h4 className="mt-3 text-sm font-semibold text-foreground">All Verified Businesses</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Allow the Chamber admin to route this to verified businesses across all active chapters in India.
                </p>
              </button>

              {/* Option 2: Chamber Specific */}
              <button
                type="button"
                onClick={() => setTargetType("chamber")}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${targetType === "chamber"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Regional Chapter
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">Specific City Chapter</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Focus admin routing on verified member businesses within a specific city/chapter.
                </p>
              </button>
            </div>

            {/* Conditional Dropdown: Chamber Specific */}
            {targetType === "chamber" && (
              <div className="rounded-xl border border-border bg-surface-raised p-4">
                <Label htmlFor="chamber-select" className="text-sm font-semibold">
                  Select Preferred Chapter / City *
                </Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Admin will match and route your requirement to businesses in this chapter.
                </p>
                <Select
                  value={selectedChapter}
                  onValueChange={setSelectedChapter}
                  disabled={loadingChapters}
                >
                  <SelectTrigger id="chamber-select" className="w-full">
                    <SelectValue placeholder={loadingChapters ? "Loading chapters..." : "Choose chapter (e.g. Mumbai, Delhi...)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((ch) => (
                      <SelectItem key={ch._id || ch.name} value={ch.name}>
                        {ch.name} {ch.city ? `(${ch.city})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Panel>

        {/* SECTION 2: Requirement Details */}
        <Panel
          title="2. Requirement Details"
          subtitle="Provide complete specifications to help businesses offer competitive quotations"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                Requirement Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Requirement for 500 Industrial Corrugated Boxes"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category" className="text-sm font-semibold">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => handleInputChange("category", val)}
                >
                  <SelectTrigger id="category" className="mt-1 w-full">
                    <SelectValue placeholder="Select business category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {categories.map((cat) => (
                      <SelectItem key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-semibold">
                  Required Quantity *
                </Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 500 Units, 10 Metric Tons"
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
                  Estimated Budget (Optional)
                </Label>
                <Input
                  id="budget"
                  placeholder="e.g., ₹50,000 or Market Standard"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  className="mt-1"
                />
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
                Delivery Location / City *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Navi Mumbai, Delhi NCR"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Detailed Specifications & Notes (Optional)
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe material specifications, dimensions, packaging needs, certification criteria, payment terms, or any other relevant details..."
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
            <Link href="/me/enquiries">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Post Requirement
              </>
            )}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
