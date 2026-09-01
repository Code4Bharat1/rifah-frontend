"use client";
import { FileCheck2, ShieldCheck, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { FieldRow, Panel, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useMyBusiness } from "@shared/hooks/use-rifah-api";
import { verificationApi } from "@shared/lib/api-services";

const docTemplates = [
  { type: "msme_udyam", name: "MSME Udyam Registration Certificate" },
  { type: "gst_certificate", name: "GST Registration Certificate" },
  { type: "pan_card", name: "Company PAN Card" },
  { type: "trade_license", name: "Trade License / Incorporation Certificate" },
];

function BizVerification() {
  const { data: business, refetch: refetchBiz } = useMyBusiness();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const fetchVerification = async () => {
    if (!business?._id) return;
    try {
      const res = await verificationApi.getByBusinessId(business._id);
      setVerificationData(res?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [business?._id]);

  const handleFileUpload = async (type, file) => {
    if (!file || !business?._id) return;
    setUploadingDoc(type);
    try {
      const uploadRes = await verificationApi.uploadDocument(file);
      const filePath = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.data?.path || uploadRes?.data?.url;

      // Submit or update verification
      await verificationApi.submit({
        businessId: business._id,
        documents: [
          ...(verificationData?.documents || []).filter((d) => d.type !== type),
          {
            type,
            name: file.name,
            fileUrl: filePath,
            status: "pending",
          },
        ],
      });

      await fetchVerification();
      await refetchBiz();
      alert("Document uploaded and submitted for review!");
    } catch (err) {
      alert(err.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const status = verificationData?.status || business?.verification || "pending";
  const stepIndex = status === "approved" ? 3 : status === "under_review" ? 2 : 1;

  return (
    <AppShell role="business" title="Verification" subtitle="RIFAH secretariat vetting status">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Progress">
            <Steps steps={["Application Submitted", "Documents Uploaded", "Secretariat Review", "Verified"]} current={stepIndex} />
            <dl className="mt-4">
              <FieldRow label="Current status" value={<VerificationBadge status={status} compact />} />
              <FieldRow label="Application Ref" value={`VER-${business?._id?.slice(-6).toUpperCase() || "NEW"}`} />
              <FieldRow label="Assigned Reviewer" value="Secretariat Verification Desk" />
            </dl>
          </Panel>

          <Panel title="Required Compliance Documents" description="Upload official documents for chamber accreditation">
            <ul className="space-y-3">
              {docTemplates.map((template) => {
                const uploaded = (verificationData?.documents || []).find((d) => d.type === template.type);
                const docStatus = uploaded ? uploaded.status || "Under review" : "Missing";

                return (
                  <li
                    key={template.type}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <FileCheck2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{template.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {uploaded ? `Uploaded: ${uploaded.name}` : "Not uploaded yet"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Pill tone={docStatus === "approved" ? "success" : docStatus === "rejected" ? "danger" : "warning"}>
                        {docStatus}
                      </Pill>
                      <label className="cursor-pointer">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          disabled={uploadingDoc === template.type}
                        >
                          <span>
                            {uploadingDoc === template.type ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Upload className="mr-1 h-3.5 w-3.5" /> Upload
                              </>
                            )}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(template.type, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Benefits of Chamber Verification">
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Verified badge displayed in public directory search.",
                "Direct buyer enquiries routed with highest priority.",
                "Eligibility to publish unlimited catalogue products.",
                "Access to exclusive chamber export summits.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export { BizVerification };
export default BizVerification;
