"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  FileCheck,
  Send,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Plane,
  AlertCircle,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2,
  Paperclip,
  Truck,
  PackageCheck,
  Receipt,
  CreditCard,
  Printer,
  Shield,
  FileBadge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { visaReferralApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { ALL_WORLD_COUNTRIES } from "@shared/lib/countries";
import { cn } from "@shared/lib/utils";

const PURPOSES_OF_VISIT = [
  "Business Meetings & Commercial Exploration",
  "International Trade Exhibition / Expo",
  "Bilateral Trade Delegation / Summit",
  "Commercial Investment / Overseas Branch Setup",
  "Technical Conference & Industry Seminar",
  "Overseas Employment & Deputation",
  "Education & Academic Exchange",
  "Tourism, Cultural Visit & Transit",
  "Other",
];

export function VisaReferralPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    // Core Fields
    fullName: user?.name || "",
    destinationCountry: "Saudi Arabia",
    purposeOfVisit: "Business Meetings & Commercial Exploration",
    detailedDescriptionOfVisit: "",

    // Contact (for Invoice & Notification)
    email: user?.email || "",
    phone: user?.phone || "",

    // 4 Mandatory Supporting Documents
    aadharCardUrl: "",
    panCardUrl: "",
    passportDocUrl: "",
    addressProofUrl: "",

    // Physical Postal Delivery Address (For hard copy letter dispatch by post)
    postalAddress: {
      recipientName: user?.name || "",
      addressLine1: "",
      addressLine2: "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: "",
      contactPhone: user?.phone || "",
    },

    paymentMethod: "Razorpay / Online (Central Account)",
  });

  // Pre-fill user details when session loads
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        postalAddress: {
          ...prev.postalAddress,
          recipientName: prev.postalAddress.recipientName || user.name || "",
          city: prev.postalAddress.city || user.city || "",
          state: prev.postalAddress.state || user.state || "",
          contactPhone: prev.postalAddress.contactPhone || user.phone || "",
        },
      }));
    }
  }, [user]);

  const [uploadingField, setUploadingField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostalAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      postalAddress: {
        ...prev.postalAddress,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const res = await visaReferralApi.uploadDocument(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, [field]: url }));
        toast.success("Document uploaded successfully");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to upload document");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter applicant Name.");
      return;
    }
    if (!formData.destinationCountry.trim()) {
      toast.error("Please select Country of Visit.");
      return;
    }
    if (!formData.purposeOfVisit.trim()) {
      toast.error("Please select Purpose of Visit.");
      return;
    }
    if (!formData.detailedDescriptionOfVisit.trim()) {
      toast.error("Please provide a Detailed Description of your Visit.");
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please provide email and contact phone for invoice & status updates.");
      return;
    }

    // Verify 4 mandatory documents
    if (!formData.aadharCardUrl) {
      toast.error("Please upload your Aadhar Card document.");
      return;
    }
    if (!formData.panCardUrl) {
      toast.error("Please upload your PAN Card document.");
      return;
    }
    if (!formData.passportDocUrl) {
      toast.error("Please upload your Passport document.");
      return;
    }
    if (!formData.addressProofUrl) {
      toast.error("Please upload your Address Proof document.");
      return;
    }

    // Verify postal address for physical letter delivery
    if (
      !formData.postalAddress.addressLine1.trim() ||
      !formData.postalAddress.city.trim() ||
      !formData.postalAddress.state.trim() ||
      !formData.postalAddress.pincode.trim()
    ) {
      toast.error("Please enter complete Postal Address for physical letter delivery by post.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        postalAddress: {
          ...formData.postalAddress,
          recipientName: formData.postalAddress.recipientName.trim() || formData.fullName.trim(),
          contactPhone: formData.postalAddress.contactPhone.trim() || formData.phone.trim(),
        },
      };

      const res = await visaReferralApi.create(payload);
      const application = res?.data || res;
      setSubmittedApp(application);
      toast.success("Visa referral application submitted & ₹500 invoice generated!");
    } catch (err) {
      toast.error(err?.message || "Failed to submit visa referral application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    toast.success("Reference number copied!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const role = ["central_admin", "admin", "super_admin"].includes(user?.role)
    ? "admin"
    : ["business_owner", "business"].includes(user?.role) || user?.businessId
      ? "business"
      : "user";
  const backPath =
    role === "admin"
      ? "/admin/visa-referrals"
      : role === "business"
        ? "/biz/visa-referrals"
        : "/user/visa-referrals";

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Globe className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Member Login Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Visa Referral Letter Desk is exclusively available to authenticated RIFAH Chamber members and subscribers. Please log in with your credentials to access the application form.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="w-full font-bold">
              <Link href="/login?redirect=/visa-referral">Log In to Continue</Link>
            </Button>
            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/membership">Explore Membership & Subscriptions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      role={role}
      title="Apply for Visa Referral"
      subtitle="Official Chamber recommendation letter for international travel missions & exhibitions"
      backTo={backPath}
    >
      <div className="max-w-4xl mx-auto py-2 space-y-6">
        {submittedApp ? (
          /* Success Confirmation Receipt */
          <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-8 text-center animate-fade-in shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 mb-5">
              <PackageCheck className="h-9 w-9" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Visa Referral Application Submitted!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Your application has been received by the RIFAH Central Secretariat and ₹590 (₹500 fee + 18% GST) has been credited to the Central Account. An official Tax Invoice has been generated.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
              <div className="bg-surface border border-border p-4 rounded-2xl shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">Application Reference</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-bold text-primary">
                    {submittedApp.referenceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRefToClipboard(submittedApp.referenceNumber)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title="Copy reference number"
                  >
                    {copiedRef ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-border p-4 rounded-2xl shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">Official Tax Invoice</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-bold text-sky-600">
                    #{submittedApp.invoiceNumber || "INV-GENERATED"}
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    ₹590 PAID (18% GST)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Invoice & Dashboard */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {submittedApp.invoiceNumber && (
                <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-1.5 cursor-pointer">
                  <Link href={`/verify/invoice/${submittedApp.invoiceNumber}`} target="_blank">
                    <Printer className="h-4 w-4" /> View / Print Tax Invoice
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link href={backPath}>View in Visa Referrals Desk</Link>
              </Button>
            </div>

            {/* Postal Delivery Advisory */}
            <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 dark:bg-sky-950/40 p-4 text-left text-xs text-sky-900 dark:text-sky-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-950 dark:text-sky-200">
                <Truck className="h-4 w-4 text-sky-600" />
                <span>Physical Delivery by Post / Courier</span>
              </div>
              <p className="text-xs text-sky-900/90 dark:text-sky-300 leading-relaxed">
                The original official letter printed on Chamber Letterhead with seal and signature will be <strong>physically delivered by post</strong> to your address after Central Secretariat review:
              </p>
              <div className="bg-surface/80 p-2.5 rounded-lg border border-sky-200/80 font-mono text-[11px] text-foreground">
                <p className="font-semibold">{submittedApp.postalAddress?.recipientName || submittedApp.fullName}</p>
                <p>{submittedApp.postalAddress?.addressLine1}</p>
                {submittedApp.postalAddress?.addressLine2 && <p>{submittedApp.postalAddress.addressLine2}</p>}
                <p>
                  {submittedApp.postalAddress?.city}, {submittedApp.postalAddress?.state} - {submittedApp.postalAddress?.pincode}
                </p>
                <p>Phone: {submittedApp.postalAddress?.contactPhone || submittedApp.phone}</p>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setSubmittedApp(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Submit another Visa Referral Application
              </Button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="max-w-3xl mx-auto space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── CARD 1: APPLICANT & TRAVEL SPECIFICATIONS ──────────── */}
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                    <Plane className="h-4 w-4" />
                    <span>Travel & Referral Inputs</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Applicant & Visit Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Provide the official details of the traveler and destination country.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Applicant Full Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="As printed on passport (e.g. Mohd Tariq)"
                      className="text-xs"
                      required
                    />
                  </div>

                  {/* Country of Visit (From All Countries List Dropdown) */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="destinationCountry" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>Country of Visit (All Countries List)</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.destinationCountry}
                      onValueChange={(val) => handleInputChange("destinationCountry", val)}
                    >
                      <SelectTrigger id="destinationCountry" className="text-xs">
                        <SelectValue placeholder="Select Destination Country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {ALL_WORLD_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Purpose of Visit */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="purposeOfVisit" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileBadge className="h-3.5 w-3.5 text-primary" />
                      <span>Purpose of Visit</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.purposeOfVisit}
                      onValueChange={(val) => handleInputChange("purposeOfVisit", val)}
                    >
                      <SelectTrigger id="purposeOfVisit" className="text-xs">
                        <SelectValue placeholder="Select Purpose of Visit" />
                      </SelectTrigger>
                      <SelectContent>
                        {PURPOSES_OF_VISIT.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detailed Description of Visit */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="detailedDescription" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Detailed Description of Visit</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="detailedDescription"
                      rows={4}
                      value={formData.detailedDescriptionOfVisit}
                      onChange={(e) => handleInputChange("detailedDescriptionOfVisit", e.target.value)}
                      placeholder="Describe the visit objectives, overseas business meetings, client discussions, trade fair booths, or commercial agenda in detail..."
                      className="text-xs resize-y"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      This information will be incorporated into the official Chamber recommendation letter addressed to the Embassy / Consulate.
                    </p>
                  </div>

                  {/* Email (for invoice receipt & notifications) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <span>Contact Email</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="name@company.com"
                      className="text-xs"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Contact Mobile / WhatsApp</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ── CARD 2: FOUR MANDATORY SUPPORTING DOCUMENTS ────────── */}
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Paperclip className="h-4 w-4" />
                    <span>Compliance Verification</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Four Required Documents</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload official clear copies of all 4 mandatory verification documents (PDF, JPG, PNG).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Aadhar Card */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">1. Aadhar Card</span>
                      </div>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Front & back scan of Aadhaar Card.
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("aadharCardUrl", e.target.files?.[0])}
                          disabled={uploadingField === "aadharCardUrl"}
                        />
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface hover:bg-muted/40 p-2.5 text-xs font-medium text-foreground transition-colors">
                          {uploadingField === "aadharCardUrl" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>Uploading...</span>
                            </>
                          ) : formData.aadharCardUrl ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Choose Aadhar File</span>
                            </>
                          )}
                        </div>
                      </label>
                      {formData.aadharCardUrl && (
                        <a
                          href={formData.aadharCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-border hover:bg-muted text-primary"
                          title="View uploaded document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 2. PAN Card */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">2. PAN Card</span>
                      </div>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Clear color copy of applicant PAN Card.
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("panCardUrl", e.target.files?.[0])}
                          disabled={uploadingField === "panCardUrl"}
                        />
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface hover:bg-muted/40 p-2.5 text-xs font-medium text-foreground transition-colors">
                          {uploadingField === "panCardUrl" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>Uploading...</span>
                            </>
                          ) : formData.panCardUrl ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Choose PAN File</span>
                            </>
                          )}
                        </div>
                      </label>
                      {formData.panCardUrl && (
                        <a
                          href={formData.panCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-border hover:bg-muted text-primary"
                          title="View uploaded document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 3. Passport */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">3. Passport</span>
                      </div>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      First page & address page of valid passport.
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("passportDocUrl", e.target.files?.[0])}
                          disabled={uploadingField === "passportDocUrl"}
                        />
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface hover:bg-muted/40 p-2.5 text-xs font-medium text-foreground transition-colors">
                          {uploadingField === "passportDocUrl" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>Uploading...</span>
                            </>
                          ) : formData.passportDocUrl ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Choose Passport File</span>
                            </>
                          )}
                        </div>
                      </label>
                      {formData.passportDocUrl && (
                        <a
                          href={formData.passportDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-border hover:bg-muted text-primary"
                          title="View uploaded document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 4. Address Proof */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">4. Address Proof</span>
                      </div>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Required</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Electricity bill, bank statement, or rent agreement.
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("addressProofUrl", e.target.files?.[0])}
                          disabled={uploadingField === "addressProofUrl"}
                        />
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface hover:bg-muted/40 p-2.5 text-xs font-medium text-foreground transition-colors">
                          {uploadingField === "addressProofUrl" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>Uploading...</span>
                            </>
                          ) : formData.addressProofUrl ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Choose Address Proof</span>
                            </>
                          )}
                        </div>
                      </label>
                      {formData.addressProofUrl && (
                        <a
                          href={formData.addressProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-border hover:bg-muted text-primary"
                          title="View uploaded document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CARD 3: POSTAL DELIVERY ADDRESS ────────────────────── */}
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Truck className="h-4 w-4" />
                    <span>Hard Copy Post Dispatch</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Postal Delivery Address</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upon Central Admin approval, the original letter on official Chamber letterhead is <strong>physically delivered by post</strong> to this address.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="recName" className="text-xs font-semibold text-foreground">
                      Recipient / Attention Name
                    </Label>
                    <Input
                      id="recName"
                      value={formData.postalAddress.recipientName}
                      onChange={(e) => handlePostalAddressChange("recipientName", e.target.value)}
                      placeholder="e.g. Mohd Tariq or Company Reception"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="addressLine1" className="text-xs font-semibold text-foreground">
                      Postal Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      value={formData.postalAddress.addressLine1}
                      onChange={(e) => handlePostalAddressChange("addressLine1", e.target.value)}
                      placeholder="Flat / Suite / Office No, Building Name, Street"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="addressLine2" className="text-xs font-semibold text-foreground">
                      Postal Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="addressLine2"
                      value={formData.postalAddress.addressLine2}
                      onChange={(e) => handlePostalAddressChange("addressLine2", e.target.value)}
                      placeholder="Area, Sector, Landmark"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-foreground">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.postalAddress.city}
                      onChange={(e) => handlePostalAddressChange("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-semibold text-foreground">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.postalAddress.state}
                      onChange={(e) => handlePostalAddressChange("state", e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-xs font-semibold text-foreground">
                      Postal PIN Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      value={formData.postalAddress.pincode}
                      onChange={(e) => handlePostalAddressChange("pincode", e.target.value)}
                      placeholder="e.g. 400001"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-xs font-semibold text-foreground">
                      Delivery Contact Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      value={formData.postalAddress.contactPhone}
                      onChange={(e) => handlePostalAddressChange("contactPhone", e.target.value)}
                      placeholder="Phone for delivery agent"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ── CARD 4: FEE & INVOICE BILLING ──────────────────────── */}
              <div className="rounded-3xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-sky-200/80 dark:border-sky-900/40 pb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-sky-600" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">Fee & Tax Invoice Summary</h3>
                      <p className="text-xs text-muted-foreground">Credited to RIFAH Chamber Central Account</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-sky-900 dark:text-sky-200">₹590</span>
                    <span className="block text-[10px] text-muted-foreground">Total Payable (Incl. 18% GST)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-surface p-3 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[11px]">Base Processing Fee:</span>
                    <strong className="text-foreground">₹500.00</strong>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[11px]">Statutory GST (18%):</span>
                    <strong className="text-emerald-700 dark:text-emerald-300">+ ₹90.00</strong>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[11px]">Beneficiary Account:</span>
                    <strong className="text-foreground">Central Account</strong>
                  </div>
                </div>

                <div className="text-xs text-sky-950/80 dark:text-sky-300 leading-relaxed bg-surface/70 p-3.5 rounded-xl border border-sky-200/80">
                  <strong>Official Tax Invoice:</strong> Base application fee is ₹500 plus 18% statutory GST (₹90), making a total of ₹590 payable to the Central Account. An official Chamber Tax Invoice with GST breakdown will be generated immediately upon submission.
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing & Generating Invoice...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Pay ₹590 & Submit Visa Referral Application</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default VisaReferralPage;
