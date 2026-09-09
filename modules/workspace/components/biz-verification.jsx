"use client";
import Link from "next/link";
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
    if (!file || !business?._id) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload documents in PDF format only (.pdf).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("PDF file size must be less than 15 MB.");
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
      toast.success("PDF document uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleResubmit = async () => {
    if (!business?._id) return;
    setResubmitting(true);
    try {
      const existingDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : [];
      await verificationApi.submit({
        businessId: business._id,
        documents: existingDocs,
        notes: resubmitNotes.trim() || "Owner resubmitted updated documents for review",
      });

      toast.success("Profile and documents resubmitted for Secretariat review!");
      setResubmitNotes("");
      await fetchVerification();
      await refetchBiz();
    } catch (err) {
      toast.error(err.message || "Failed to resubmit application.");
    } finally {
      setResubmitting(false);
    }
  };

  const rawStatus = (verificationData?.status || business?.verification || business?.verificationStatus || "unverified").toLowerCase();
  const uploadedDocs = Array.isArray(verificationData?.documents) ? verificationData.documents : (business?.documents || []);
  const uploadedCount = uploadedDocs.length;
  const hasUploadedDocs = uploadedCount > 0;

  // Strict Rule: A business cannot be considered verified on the verification desk if no documents are uploaded
  const isVerified = (business?.isVerified === true || rawStatus === "approved" || rawStatus === "verified") && hasUploadedDocs;
  const isChangesRequired = !isVerified && (rawStatus === "changes_required" || rawStatus === "correction" || rawStatus === "correction_requested");
  const isRejected = !isVerified && rawStatus === "rejected";
  const isUnderReview = !isVerified && !isChangesRequired && !isRejected && hasUploadedDocs && (rawStatus === "under_review" || rawStatus === "pending");
  const isUnsubmitted = !isVerified && !isChangesRequired && !isRejected && !isUnderReview;

  const stepIndex = isVerified
    ? 3
    : isUnderReview
    ? 2
    : hasUploadedDocs
    ? 1
    : 0;

  const referenceNo = verificationData?.referenceNo || `VER-2026-${business?._id ? business._id.slice(-4).toUpperCase() : "PENDING"}`;
  const reviewerName = `Secretariat · ${business?.chapter ? `${business.chapter} Chapter` : "Central Chapter"}`;
  const lastUpdate = formatLastUpdate(verificationData?.updatedAt, business?.updatedAt);
  const historyList = Array.isArray(business?.verificationHistory) ? business.verificationHistory : [];

  return (
    <AppShell role="business" title="Verification" subtitle="RIFAH Chamber Secretariat Vetting & Compliance Status">
      <div className="space-y-4">
        {/* Top Status Callouts */}
        {isUnsubmitted && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/40 p-4 text-amber-950 dark:text-amber-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-amber-950 dark:text-white">
                    Verification Incomplete — Documents Required
                  </h4>
                  <span className="rounded-full bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase">
                    Documents Pending
                  </span>
                </div>
                <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-300/80">
                  Business verification cannot be completed without official business paperwork. Please upload your registration documents (GST, PAN, Trade License / Incorporation Certificate) in PDF format below.
                </p>
              </div>
            </div>
          </div>
        )}

        {isChangesRequired && (
          <div className="rounded-2xl border border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/40 p-4 text-blue-950 dark:text-blue-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-blue-950 dark:text-white">
                    Action Required: Changes Requested by Chamber Secretariat
                  </h4>
                  <span className="rounded-full bg-blue-200 dark:bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">
                    Needs Action
                  </span>
                </div>
                <div className="mt-2 rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 border border-blue-200 dark:border-blue-900/60 text-xs">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">
                    Secretariat Instructions:
                  </span>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">
                    {business?.verificationReviewReason || verificationData?.remarks || "Please replace the requested documents below and submit for re-evaluation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isUnderReview && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/40 p-4 text-amber-950 dark:text-amber-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-white">
                  Application Under Secretariat Review
                </h4>
                <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-300/80">
                  Your business documents and payment are in the Secretariat Queue. Once approved, your business profile will be automatically published live on the public directory.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/90 dark:border-rose-800 dark:bg-rose-950/40 p-4 text-rose-950 dark:text-rose-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950 dark:text-white">
                  Verification Application Rejected
                </h4>
                <p className="mt-1 text-xs text-rose-900/80 dark:text-rose-300/80">
                  {business?.verificationReviewReason || "Your application could not be verified by the secretariat. Please review the requirements or contact chamber support."}
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/40 p-4 text-emerald-950 dark:text-emerald-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-white">
                    Verified Chamber Member — Live
                  </h4>
                  <Link
                    href={`/business/${business?.slug || business?._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>View Public Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-300/80">
                  Congratulations! Your business has been thoroughly vetted and approved by the RIFAH Secretariat. Your profile is active and publicly visible.
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

            {/* Resubmission Suite Panel (Available when changes required or under review) */}
            {(isChangesRequired || isUnderReview) && (
              <Panel
                title="Resubmit for Secretariat Review"
                description="If you replaced documents or updated your details, notify the secretariat to re-evaluate"
              >
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="resubmit-notes" className="text-xs font-semibold">
                      Notes for Secretariat (Optional)
                    </Label>
                    <Textarea
                      id="resubmit-notes"
                      rows={3}
                      value={resubmitNotes}
                      onChange={(e) => setResubmitNotes(e.target.value)}
                      placeholder="e.g. I have uploaded the updated GST Registration Certificate and correct Trade License as requested."
                      className="text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleResubmit}
                    disabled={resubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs gap-2"
                  >
                    {resubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting for Review...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Resubmit for Secretariat Review</span>
                      </>
                    )}
                  </Button>
                </div>
              </Panel>
            )}
          </div>

          {/* Right Column: Audit Timeline & Chamber Guidelines */}
          <div className="space-y-4">
            {/* Audit History Timeline */}
            <Panel title="Verification Audit Timeline">
              {historyList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">
                  No activity logged yet. Status updates will appear here in chronological order.
                </p>
              ) : (
                <div className="relative border-l-2 border-primary/20 ml-2 space-y-4 pl-3 py-1">
                  {historyList.map((h, i) => (
                    <div key={i} className="relative text-xs">
                      <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">
                          {(h.action || h.status || "Update").replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-GB") : "—"}
                        </span>
                      </div>
                      {h.reason && (
                        <p className="mt-1 text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-md">
                          {h.reason}
                        </p>
                      )}
                    </div>
                  ))}
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

          <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-900 overflow-hidden">
            {previewDoc?.fileUrl && (
              <iframe
                src={resolveMediaUrl(previewDoc.fileUrl)}
                title={previewDoc.name || "PDF Document"}
                className="w-full h-full border rounded-lg bg-white shadow-xs"
              />
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
