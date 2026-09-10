"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Clock,
  RotateCcw,
  XCircle,
  History,
  Send,
  Eye,
  Download,
  ShieldCheck,
  Building2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { FieldRow, Panel, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { toast } from "sonner";
import { useMyBusiness } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";

const docTemplates = [
  {
    type: "incorporation_certificate",
    name: "Certificate of Incorporation / Trade License",
  },
  {
    type: "gst_tax_registration",
    name: "GSTIN / Tax Registration Certificate",
  },
  {
    type: "pan_card",
    name: "Business PAN / Tax ID Card",
  },
  {
    type: "authorized_letter",
    name: "Authorized Signatory Letter / ID Proof",
  },
  {
    type: "bank_details_invoicing",
    name: "Bank Account Details / Cancelled Cheque",
  },
];

const typeAliases = {
  incorporation_certificate: [
    "incorporation_certificate",
    "certificate of incorporation",
    "certificate_of_incorporation",
    "incorporation",
    "trade_license",
    "trade license",
    "trade license / incorporation certificate",
    "company incorporation",
  ],
  gst_tax_registration: [
    "gst_tax_registration",
    "gst / tax registration",
    "gst_certificate",
    "gst certificate",
    "gst registration certificate",
    "gst",
  ],
  pan_card: [
    "pan_card",
    "pan",
    "pan card",
    "tax_id",
    "factory_licence",
    "factory licence",
  ],
  authorized_letter: [
    "authorized_letter",
    "authorized_signatory",
    "authorized signatory letter",
    "chamber_membership_form",
    "chamber membership form",
    "msme_udyam",
  ],
  bank_details_invoicing: [
    "bank_details_invoicing",
    "bank details for invoicing",
    "bank details",
    "bank_details",
    "cancelled cheque",
  ],
};

const isMatchingDoc = (docType, templateType) => {
  if (!docType) return false;
  const dt = String(docType).toLowerCase().trim();
  const tt = String(templateType).toLowerCase().trim();
  if (dt === tt) return true;
  const aliases = typeAliases[templateType] || [];
  return aliases.some((a) => dt === a || dt.includes(a) || a.includes(dt));
};

const formatDocDate = (dateVal, fallback) => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return fallback;
  }
};

const formatLastUpdate = (dateVal, fallbackDate) => {
  const target = dateVal || fallbackDate;
  if (!target) return "Pending document submission";
  try {
    const d = new Date(target);
    if (isNaN(d.getTime())) return "Pending document submission";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    if (isToday) return `Today ${timeStr}`;
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${timeStr}`;
  } catch {
    return "Pending document submission";
  }
};

function BizVerification() {
  const router = useRouter();
  const { data: business, refetch: refetchBiz } = useMyBusiness();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitNotes, setResubmitNotes] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchVerification = async () => {
    if (!business?._id) return;
    try {
      setLoading(true);
      const res = await verificationApi.getByBusinessId(business._id);
      let verif = null;
      if (res && typeof res === "object" && "data" in res) {
        verif = res.data;
      } else {
        verif = res;
      }
      setVerificationData(verif && typeof verif === "object" && verif.documents ? verif : null);
    } catch (err) {
      console.error("fetchVerification error:", err);
      setVerificationData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [business?._id]);

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    if (!business?._id) {
      toast.error("Please complete your business profile before uploading verification documents.");
      router.push("/biz/profile");
      return;
    }

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();
    const isAllowed =
      fileType === "application/pdf" ||
      fileType.includes("pdf") ||
      fileType.startsWith("image/") ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp");

    if (!isAllowed) {
      toast.error("Please upload documents in PDF format (.pdf) or clear image scans (.jpg, .png, .webp).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25 MB.");
      return;
    }

    setUploadingDoc(type);
    try {
      const uploadRes = await verificationApi.uploadDocument(file);
      const fileData = uploadRes && typeof uploadRes === "object" && "data" in uploadRes ? uploadRes.data : uploadRes;
      const filePath = fileData?.fileUrl || fileData?.path || fileData?.url;

      if (!filePath) {
        toast.error("File upload failed — no file URL received from server.");
        return;
      }

      const existingDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : [];
      const updatedDocs = [
        ...existingDocs.filter((d) => !isMatchingDoc(d?.type, type)),
        {
          type,
          name: file.name,
          fileUrl: filePath,
          status: "pending",
          uploadedAt: new Date().toISOString(),
        },
      ];

      const submitRes = await verificationApi.submit({
        businessId: business._id,
        documents: updatedDocs,
      });

      const updatedRecord = submitRes && typeof submitRes === "object" && "data" in submitRes ? submitRes.data : submitRes;
      if (updatedRecord && updatedRecord.documents) {
        setVerificationData(updatedRecord);
      }

      await fetchVerification();
      await refetchBiz();

      const finalDocs = updatedRecord?.documents || updatedDocs;
      const missingAfterUpload = docTemplates.filter(
        (template) => !finalDocs.some((d) => isMatchingDoc(d?.type, template.type))
      );
      if (missingAfterUpload.length > 0) {
        toast.success(`Document attached! Please upload remaining ${missingAfterUpload.length} document${missingAfterUpload.length > 1 ? "s" : ""} to enable submission.`);
      } else {
        toast.success(`All ${docTemplates.length} documents attached! You can now submit your application below.`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const rawStatus = (verificationData?.status || business?.verification || business?.verificationStatus || "unverified").toLowerCase();
  const uploadedDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : (business?.documents || []);
  const totalRequiredDocs = docTemplates.length;
  const missingTemplates = docTemplates.filter(
    (template) => !uploadedDocs.some((d) => isMatchingDoc(d?.type, template.type))
  );
  const uploadedTemplateCount = totalRequiredDocs - missingTemplates.length;
  const isAllDocsUploaded = missingTemplates.length === 0;

  const handleResubmit = async () => {
    if (!business?._id) return;
    if (!isAllDocsUploaded) {
      toast.error(`Please upload all ${totalRequiredDocs} required documents before submitting for Secretariat review.`);
      return;
    }

    setResubmitting(true);
    try {
      const existingDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : [];
      if (existingDocs.length < totalRequiredDocs) {
        toast.error(`All ${totalRequiredDocs} compliance documents must be attached before submitting.`);
        setResubmitting(false);
        return;
      }

      await verificationApi.submit({
        businessId: business._id,
        documents: existingDocs,
        notes: resubmitNotes.trim() || "Owner submitted complete business verification package for Secretariat review",
      });

      toast.success("Application submitted successfully! The RIFAH Secretariat will review your documents.");
      setResubmitNotes("");
      await fetchVerification();
      await refetchBiz();
    } catch (err) {
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setResubmitting(false);
    }
  };

  const uploadedCount = uploadedDocs.length;
  const hasUploadedDocs = uploadedCount > 0;

  // Strict Rule: A business cannot be considered verified on the verification desk if all required documents are not uploaded
  const isVerified = (business?.isVerified === true || rawStatus === "approved" || rawStatus === "verified") && isAllDocsUploaded;
  const isChangesRequired = !isVerified && (rawStatus === "changes_required" || rawStatus === "correction" || rawStatus === "correction_requested");
  const isRejected = !isVerified && rawStatus === "rejected";
  const isUnderReview = !isVerified && !isChangesRequired && !isRejected && isAllDocsUploaded && (rawStatus === "under_review" || rawStatus === "pending");
  const isUnsubmitted = !isVerified && !isChangesRequired && !isRejected && !isUnderReview;

  const stepIndex = isVerified
    ? 3
    : isUnderReview
    ? 2
    : isAllDocsUploaded
    ? 1
    : 0;

  const referenceNo = verificationData?.referenceNo || `VER-2026-${business?._id ? business._id.slice(-4).toUpperCase() : "PENDING"}`;
  const reviewerName = `Secretariat · ${business?.chapter ? `${business.chapter} Chapter` : "Central Chapter"}`;
  const lastUpdate = formatLastUpdate(verificationData?.updatedAt, business?.updatedAt);
  const historyList = Array.isArray(business?.verificationHistory) ? business.verificationHistory : [];

  // Deduplicate and consolidate timeline into clean logical milestones (Payment -> Documents -> Secretariat Approval)
  const processedTimeline = (() => {
    const raw = Array.isArray(historyList) ? [...historyList] : [];
    const filtered = [];
    let seenSubmitted = false;
    let seenPayment = false;
    let seenApproved = false;

    // 1. Process payment entry if present
    raw.forEach((h) => {
      const act = String(h.action || h.status || "").toLowerCase();
      if (act.includes("payment")) {
        if (!seenPayment) {
          filtered.push({
            type: "payment",
            title: "Payment Completed",
            date: h.createdAt,
            description: h.reason || "Membership payment confirmed. Application queued for secretariat review.",
            status: "completed",
          });
          seenPayment = true;
        }
      }
    });

    // If paid membership but no explicit payment log, synthesize milestone
    if (!seenPayment && business?.membership && business.membership.toLowerCase() !== "free") {
      filtered.push({
        type: "payment",
        title: "Payment Completed",
        date: business.createdAt,
        description: `${business.membership} Membership subscription active.`,
        status: "completed",
      });
      seenPayment = true;
    }

    // 2. Process documents submission milestone (consolidating all multi-file uploads into 1 clean step)
    raw.forEach((h) => {
      const act = String(h.action || h.status || "").toLowerCase();
      if (act.includes("submit") || act.includes("document")) {
        if (!seenSubmitted) {
          filtered.push({
            type: "documents",
            title: "Documents Submitted",
            date: h.createdAt,
            description: "Official compliance and business registration paperwork attached & submitted for review.",
            status: "completed",
          });
          seenSubmitted = true;
        }
      }
    });

    if (!seenSubmitted && (hasUploadedDocs || uploadedCount > 0)) {
      filtered.push({
        type: "documents",
        title: "Documents Submitted",
        date: business?.updatedAt || business?.createdAt,
        description: `${uploadedCount || "Required"} business documents attached for secretariat vetting.`,
        status: "completed",
      });
      seenSubmitted = true;
    }

    // 3. Process approval / decision milestone
    raw.forEach((h) => {
      const act = String(h.action || h.status || "").toLowerCase();
      if (act.includes("approve") || act.includes("verified")) {
        if (!seenApproved) {
          filtered.push({
            type: "approved",
            title: "Verified & Approved",
            date: h.createdAt,
            description: h.reason || "Approved by Chamber Secretariat. Business profile is live & verified on directory.",
            status: "approved",
          });
          seenApproved = true;
        }
      } else if (act.includes("correction") || act.includes("change")) {
        filtered.push({
          type: "changes",
          title: "Correction Requested",
          date: h.createdAt,
          description: h.reason || "Secretariat requested document re-upload or details update.",
          status: "warning",
        });
      } else if (act.includes("reject")) {
        filtered.push({
          type: "rejected",
          title: "Application Rejected",
          date: h.createdAt,
          description: h.reason || "Application rejected by secretariat.",
          status: "rejected",
        });
      }
    });

    if (!seenApproved && isVerified) {
      filtered.push({
        type: "approved",
        title: "Verified & Approved",
        date: business?.updatedAt || new Date(),
        description: "Approved by Chamber Secretariat. Business is live with verified badge.",
        status: "approved",
      });
    } else if (!seenApproved && isUnderReview) {
      filtered.push({
        type: "under_review",
        title: "Under Secretariat Review",
        date: new Date(),
        description: "Document review in progress by chamber secretariat officer.",
        status: "pending",
      });
    }

    return filtered;
  })();

  return (
    <AppShell role="business" title="Verification" subtitle="RIFAH Chamber Secretariat Vetting & Compliance Status">
      <div className="space-y-4">
        {/* Profile Completion Prompt if Business Profile is missing or lacks State */}
        {(!business?._id || !business?.state) && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-foreground shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Step 1: Complete Your Business Profile
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Please provide your official business name, registered address, and state before submitting verification documents.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="font-semibold shrink-0 gap-1.5 shadow-xs">
                <Link href="/biz/profile">
                  <Building2 className="h-4 w-4" /> Complete Profile
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Top Status Callouts */}
        {isUnsubmitted && (
          <div className="rounded-xl border border-border bg-surface border-l-4 border-l-amber-500 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Upload className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    Verification Incomplete — Documents Required
                  </h4>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Documents Pending
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Please upload your official business registration paperwork (GSTIN, Business PAN, or Trade License PDF) below to submit for Secretariat review.
                </p>
              </div>
            </div>
          </div>
        )}

        {isChangesRequired && (
          <div className="rounded-xl border border-border bg-surface border-l-4 border-l-sky-500 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <RotateCcw className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    Action Required: Changes Requested by Secretariat
                  </h4>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                    Action Required
                  </span>
                </div>
                <div className="mt-2.5 rounded-lg bg-muted/60 p-3 text-xs">
                  <span className="block font-semibold text-foreground text-[11px] uppercase tracking-wide text-muted-foreground">
                    Secretariat Instructions:
                  </span>
                  <p className="mt-1 text-foreground font-medium">
                    {business?.verificationReviewReason || verificationData?.remarks || "Please replace the requested documents below and submit for re-evaluation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isUnderReview && (
          <div className="rounded-xl border border-border bg-surface border-l-4 border-l-amber-500 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    Application Under Secretariat Review
                  </h4>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                    In Review
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Your business documents are currently in the Secretariat Queue for review. Once verified, your business profile will carry the verified chamber badge.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-border bg-surface border-l-4 border-l-rose-500 p-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <XCircle className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    Verification Application Not Approved
                  </h4>
                  <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                    Rejected
                  </span>
                </div>

                <div className="mt-2.5 rounded-lg bg-muted/60 p-3 text-xs">
                  <span className="block font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                    Reason for Rejection / Feedback:
                  </span>
                  <p className="mt-1 font-medium text-foreground leading-relaxed">
                    {business?.verificationReviewReason || business?.verificationRemarks || verificationData?.remarks || "The submitted documentation did not meet the compliance standards. Please review requirements and replace documents below."}
                  </p>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  You can upload corrected PDF documents below and click <strong>"Submit Application"</strong> to re-open your evaluation.
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="rounded-xl border border-border bg-surface border-l-4 border-l-emerald-500 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    Verified Chamber Member — Live
                  </h4>
                  <Link
                    href={`/business/${business?.slug || business?._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Public Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Congratulations! Your business has been approved by the RIFAH Secretariat. Your profile is active and publicly verified.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Left Column: Progress, Documents & Resubmit */}
          <div className="space-y-4">
            {/* Progress Panel */}
            <Panel title="Verification Lifecycle">
              <Steps
                steps={["Submitted", "Documents Checked", "Secretariat Review", "Verified & Live"]}
                current={stepIndex}
              />
              <dl className="mt-4 divide-y divide-border/60">
                <FieldRow
                  label="Current Status"
                  value={
                    !hasUploadedDocs ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30">
                        <Upload className="h-3 w-3" />
                        Documents Pending Upload
                      </span>
                    ) : (
                      <VerificationBadge status={isVerified ? "verified" : rawStatus} compact />
                    )
                  }
                />
                <FieldRow label="Reference ID" value={referenceNo} />
                <FieldRow label="Reviewing Desk" value={reviewerName} />
                <FieldRow label="Last Activity" value={lastUpdate} />
              </dl>
            </Panel>

            {/* Documents Panel */}
            <Panel
              title="Verification Documents (PDF)"
              description="Official certificates, registration papers & identity proof"
            >
              <ul className="space-y-3">
                {docTemplates.map((template) => {
                  const uploaded = uploadedDocs.find((d) => isMatchingDoc(d?.type, template.type));
                  const isChecked = uploaded && (uploaded.status === "approved" || isVerified);
                  const isPending = uploaded && !isChecked;

                  return (
                    <li
                      key={template.type}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/70 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {template.name}
                          </span>
                        </div>
                        <span className="block truncate text-xs text-muted-foreground mt-0.5">
                          {uploaded ? `Uploaded (${formatDocDate(uploaded.uploadedAt, "Recently")})` : "Not uploaded yet"}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {isChecked && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Verified
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                            Under Review
                          </span>
                        )}

                        {uploaded?.fileUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-semibold text-primary"
                            onClick={() => setPreviewDoc(uploaded)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>Preview</span>
                          </Button>
                        )}

                        <label className="cursor-pointer">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            disabled={uploadingDoc === template.type}
                            className="h-8 px-3 text-xs font-semibold gap-1.5"
                          >
                            <span>
                              {uploadingDoc === template.type ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{uploaded ? "Replace" : "Upload"}</span>
                                </>
                              )}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleFileUpload(template.type, e.target.files?.[0])}
                            className="hidden"
                            disabled={uploadingDoc === template.type}
                          />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Mandatory Document Upload & Submission Action Guard */}
              {!isVerified && (
                <div className="mt-6 pt-5 border-t border-border/80">
                  {!isAllDocsUploaded ? (
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30 p-5 text-center">
                      <div className="mx-auto mb-2.5 grid h-11 w-11 place-items-center rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-600 dark:text-amber-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-amber-950 dark:text-white">
                        Submission Locked — All {totalRequiredDocs} Documents Required
                      </h4>
                      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-300/80 max-w-lg mx-auto leading-relaxed">
                        You have uploaded <strong>{uploadedTemplateCount} of {totalRequiredDocs}</strong> required compliance documents. Please upload the remaining <strong>{missingTemplates.length} document{missingTemplates.length > 1 ? "s" : ""}</strong> above to enable submission for Secretariat review.
                      </p>

                      {/* Progress Bar & Missing Items Indicator */}
                      <div className="mt-3.5 max-w-md mx-auto">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
                          <span>Compliance Upload Progress</span>
                          <span>{uploadedTemplateCount} / {totalRequiredDocs} Uploaded</span>
                        </div>
                        <div className="h-2 w-full bg-amber-200/80 dark:bg-amber-900/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-300"
                            style={{ width: `${(uploadedTemplateCount / totalRequiredDocs) * 100}%` }}
                          />
                        </div>

                        {missingTemplates.length > 0 && (
                          <div className="mt-3 text-left bg-amber-100/70 dark:bg-amber-900/40 rounded-lg p-2.5 text-[11px] border border-amber-200 dark:border-amber-800">
                            <span className="font-semibold text-amber-950 dark:text-amber-200 block mb-1">
                              Remaining to Upload:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 dark:text-amber-300/90">
                              {missingTemplates.map((t) => (
                                <li key={t.type}>{t.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Button disabled className="mt-4 w-full max-w-sm opacity-60 cursor-not-allowed bg-amber-700 hover:bg-amber-700 text-white font-semibold">
                        <Lock className="h-4 w-4 mr-1.5" /> Submit Locked ({uploadedTemplateCount}/{totalRequiredDocs} Uploaded)
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 p-5">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
                            <CheckCircle2 className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-emerald-950 dark:text-white">
                              All {totalRequiredDocs} Compliance Documents Attached & Ready!
                            </h4>
                            <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80">
                              All required paperwork is attached. Click below to officially send your complete application package to the RIFAH Secretariat for review.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="submit-notes" className="text-xs font-semibold text-foreground">
                            Notes for Secretariat (Optional)
                          </Label>
                          <Textarea
                            id="submit-notes"
                            rows={2}
                            value={resubmitNotes}
                            onChange={(e) => setResubmitNotes(e.target.value)}
                            placeholder="e.g. Attached all 5 verified compliance documents for chamber accreditation review."
                            className="text-xs bg-white dark:bg-slate-900"
                          />
                        </div>

                        <Button
                          onClick={handleResubmit}
                          disabled={resubmitting}
                          size="lg"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md gap-2 cursor-pointer"
                        >
                          {resubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Submitting Complete Application...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>Submit Complete Application for Secretariat Approval ({totalRequiredDocs}/{totalRequiredDocs} Docs)</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>

          {/* Right Column: Audit Timeline & Chamber Guidelines */}
          <div className="space-y-4">
            {/* Audit History Timeline */}
            <Panel title="Verification Audit Timeline">
              {processedTimeline.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">
                  No activity logged yet. Status updates will appear here in chronological order.
                </p>
              ) : (
                <div className="space-y-4 py-1">
                  {processedTimeline.map((item, idx) => {
                    const isLast = idx === processedTimeline.length - 1;
                    const isApproved = item.status === "approved";
                    const isCompleted = item.status === "completed";

                    return (
                      <div key={idx} className="relative flex items-start gap-3 text-xs">
                        {/* Connecting line */}
                        {!isLast && (
                          <div className="absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] bg-slate-200 dark:bg-slate-800" />
                        )}

                        {/* Status Icon / Animated Pulse */}
                        <div className="relative z-10 shrink-0">
                          {isApproved ? (
                            <div className="relative flex h-7 w-7 items-center justify-center">
                              <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/40">
                                <ShieldCheck className="h-4 w-4" />
                              </span>
                            </div>
                          ) : isCompleted ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          ) : item.status === "pending" ? (
                            <div className="relative flex h-7 w-7 items-center justify-center">
                              <span className="absolute h-full w-full rounded-full bg-blue-400 opacity-60 animate-pulse" />
                              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                                <Clock className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          ) : item.status === "warning" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200">
                              <RotateCcw className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200">
                              <AlertCircle className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Content Box */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              "font-bold uppercase tracking-wider text-[11px]",
                              isApproved ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-900 dark:text-white"
                            )}>
                              {item.title}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0">
                              {item.date ? new Date(item.date).toLocaleDateString("en-GB") : "Recent"}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Why verify Panel */}
            <Panel title="Member Verification Benefits">
              <ul className="space-y-3 text-xs text-muted-foreground">
                {[
                  "Verified badge boosts buyer credibility by 80%.",
                  "Eligible for directory featured spots & supplier matchmaking.",
                  "Enquiries from large buyers routed to verified entities first.",
                  "Priority invitations to B2B delegate events.",
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Need help? Panel */}
            <Panel title="Secretariat Assistance">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Have questions about required paperwork? Connect with the secretariat verification desk.
              </p>
              <Button variant="outline" className="w-full mt-3 font-semibold text-xs h-9 rounded-xl" asChild>
                <Link href="/biz/messages">Message Secretariat</Link>
              </Button>
            </Panel>
          </div>
        </div>
      </div>

      {/* PDF Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold truncate">
              {previewDoc?.name || previewDoc?.type || "Document Preview"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
            {previewDoc?.fileUrl && (
              (previewDoc?.fileUrl?.toLowerCase().includes(".pdf") || previewDoc?.name?.toLowerCase().endsWith(".pdf")) ? (
                <iframe
                  src={resolveMediaUrl(previewDoc.fileUrl)}
                  title={previewDoc.name || "PDF Document"}
                  className="w-full h-full border rounded-lg bg-white shadow-xs"
                />
              ) : (
                <img
                  src={resolveMediaUrl(previewDoc.fileUrl)}
                  alt={previewDoc.name || "Document scan"}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xs bg-white"
                />
              )
            )}
          </div>

          <div className="p-3 border-t bg-background flex items-center justify-between">
            {previewDoc?.fileUrl && (
              <a
                href={resolveMediaUrl(previewDoc.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
              </a>
            )}
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { BizVerification };
export default BizVerification;
