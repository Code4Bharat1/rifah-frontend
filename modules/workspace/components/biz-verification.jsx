"use client";
import Link from "next/link";
import { FileText, Upload, Loader2, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { FieldRow, Panel, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { toast } from "sonner";
import { useMyBusiness } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

const docTemplates = [
  {
    type: "incorporation_certificate",
    name: "Certificate of incorporation",
  },
  {
    type: "gst_tax_registration",
    name: "GST / tax registration",
  },
  {
    type: "chamber_membership_form",
    name: "Chamber membership form",
  },
  {
    type: "factory_licence",
    name: "Factory licence",
  },
  {
    type: "bank_details_invoicing",
    name: "Bank details for invoicing",
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
  chamber_membership_form: [
    "chamber_membership_form",
    "chamber membership form",
    "membership form",
    "msme_udyam",
    "udyam registration",
    "udyam",
  ],
  factory_licence: [
    "factory_licence",
    "factory licence",
    "factory license",
    "fssai_license",
    "pan_card",
    "pan",
  ],
  bank_details_invoicing: [
    "bank_details_invoicing",
    "bank details for invoicing",
    "bank details",
    "bank_details",
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
  const { data: business, refetch: refetchBiz } = useMyBusiness();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);

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
    if (!file || !business?._id) return;

    // Strict PDF validation: Only official PDF documents are accepted
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload documents in PDF format only (.pdf). Image or other formats are not accepted.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("PDF file size must be less than 15 MB.");
      return;
    }

    setUploadingDoc(type);
    try {
      // Step 1: Upload PDF to backend storage
      const uploadRes = await verificationApi.uploadDocument(file);
      const fileData = uploadRes && typeof uploadRes === "object" && "data" in uploadRes ? uploadRes.data : uploadRes;
      const filePath = fileData?.fileUrl || fileData?.path || fileData?.url;

      if (!filePath) {
        toast.error("File upload failed — no file URL received from server.");
        return;
      }

      // Step 2: Update verification record documents
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
      toast.success("PDF document uploaded and submitted for secretariat review!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const status = verificationData?.status || business?.verification || business?.verificationStatus || "not_verified";
  const isVerified = status === "approved" || status === "verified";
  const uploadedDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : [];
  const uploadedCount = uploadedDocs.length;

  // Steps in Progress: [Submitted, Documents checked, Secretariat review, Verified]
  const stepIndex = isVerified
    ? 3
    : status === "under_review"
    ? 2
    : uploadedCount > 0
    ? 1
    : 0;

  const referenceNo = verificationData?.referenceNo || `VER-2026-${business?._id ? business._id.slice(-4).toUpperCase() : "PENDING"}`;
  const reviewerName = `Secretariat · ${business?.chapter ? `${business.chapter} Chapter` : "Central Chapter"}`;
  const lastUpdate = formatLastUpdate(verificationData?.updatedAt, business?.updatedAt);

  return (
    <AppShell role="business" title="Verification" subtitle="RIFAH secretariat vetting status">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Column: Progress & Documents */}
        <div className="space-y-4">
          {/* Progress Panel */}
          <Panel title="Progress">
            <Steps
              steps={["Submitted", "Documents checked", "Secretariat review", "Verified"]}
              current={stepIndex}
            />
            <dl className="mt-4">
              <FieldRow label="Current status" value={<VerificationBadge status={status} compact />} />
              <FieldRow label="Reference" value={referenceNo} />
              <FieldRow label="Reviewer" value={reviewerName} />
              <FieldRow label="Last update" value={lastUpdate} />
            </dl>
          </Panel>

          {/* Documents Panel */}
          <Panel title="Documents" description="Upload or replace supporting documents">
            {uploadedCount === 0 && (
              <div className="mb-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Documents Required for Secretariat Vetting</p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    Please upload your official business documents in PDF format to initiate secretariat review and earn your Verified badge.
                  </p>
                </div>
              </div>
            )}

            <ul className="space-y-3">
              {docTemplates.map((template) => {
                const uploaded = uploadedDocs.find((d) => isMatchingDoc(d?.type, template.type));
                
                // Determine document status based strictly on uploaded documents
                let docStatus = "missing";
                let subtext = "Not uploaded";

                if (uploaded) {
                  docStatus = uploaded.status || "pending";
                  if (docStatus === "approved" || docStatus === "verified") {
                    subtext = uploaded.reviewedAt
                      ? `Approved ${formatDocDate(uploaded.reviewedAt, "")}`
                      : `Approved ${formatDocDate(uploaded.uploadedAt, "")}`;
                  } else if (docStatus === "under_review" || docStatus === "pending") {
                    subtext = `Submitted ${formatDocDate(uploaded.uploadedAt, "Recently")}`;
                  } else if (docStatus === "rejected") {
                    subtext = uploaded.notes || uploaded.rejectionReason || "Document rejected, please re-upload";
                  } else {
                    subtext = `Uploaded ${formatDocDate(uploaded.uploadedAt, "Recently")}`;
                  }
                }

                // Status Badge rendering
                let badgeNode = null;
                if (docStatus === "approved" || docStatus === "verified") {
                  badgeNode = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      Approved
                    </span>
                  );
                } else if (docStatus === "under_review" || docStatus === "pending") {
                  badgeNode = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                      Under review
                    </span>
                  );
                } else if (docStatus === "rejected") {
                  badgeNode = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                      Rejected
                    </span>
                  );
                } else {
                  badgeNode = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                      Missing
                    </span>
                  );
                }

                return (
                  <li
                    key={template.type}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    {/* Document Icon Box */}
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/70 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </span>

                    {/* Title & Subtext */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {template.name}
                        </span>
                        {uploaded?.fileUrl && (
                          <a
                            href={resolveMediaUrl(uploaded.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Open PDF"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="block truncate text-xs text-muted-foreground mt-0.5">
                        {subtext}
                      </span>
                    </div>

                    {/* Right Status Badge & Upload Button */}
                    <div className="flex shrink-0 items-center gap-2.5">
                      {badgeNode}

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
                          accept=".pdf,application/pdf"
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
          </Panel>
        </div>

        {/* Right Column: Why verify & Need help? */}
        <div className="space-y-4">
          {/* Why verify Panel */}
          <Panel title="Why verify">
            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              {[
                "Verified members rank higher in directory search.",
                "Buyers filter enquiries to verified suppliers.",
                "Verification is required for featured placement.",
                "Chamber events give verified members priority access.",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Need help? Panel */}
          <Panel title="Need help?">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The membership desk can review your documents before submission.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4 font-semibold text-xs sm:text-sm h-10 rounded-xl"
              asChild
            >
              <Link href="/biz/messages">Contact secretariat</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export { BizVerification };
export default BizVerification;
