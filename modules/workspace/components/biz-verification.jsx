"use client";
import { FileCheck2, ShieldCheck, Upload } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { FieldRow, Panel, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";

const docs = [
  { name: "Certificate of incorporation", status: "Approved" , at: "12 Nov 2025" },
  { name: "GST / tax registration", status: "Approved" , at: "12 Nov 2025" },
  { name: "Chamber membership form", status: "Approved" , at: "13 Nov 2025" },
  { name: "Factory licence", status: "Under review" , at: "Submitted 02 Aug 2026" },
  { name: "Bank details for invoicing", status: "Missing" , at: "Not uploaded" },
];

const tone = { Approved: "success", "Under review": "warning", Missing: "danger" } ;

function BizVerification() {
  return (
    <AppShell role="business" title="Verification" subtitle="RIFAH secretariat vetting status">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Progress">
            <Steps steps={["Submitted", "Documents checked", "Secretariat review", "Verified"]} current={2} />
            <dl className="mt-4">
              <FieldRow label="Current status" value={<VerificationBadge status="verified" compact />} />
              <FieldRow label="Reference" value="VER-2026-0184" />
              <FieldRow label="Reviewer" value="Secretariat · Mumbai Chapter" />
              <FieldRow label="Last update" value="Today 11:24" />
            </dl>
          </Panel>

          <Panel title="Documents" description="Upload or replace supporting documents">
            <ul className="space-y-3">
              {docs.map((d) => (
                <li key={d.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <FileCheck2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{d.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{d.at}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Pill tone={tone[d.status]}>{d.status}</Pill>
                    <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Why verify">
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Verified members rank higher in directory search.",
                "Buyers filter enquiries to verified suppliers.",
                "Verification is required for featured placement.",
                "Chamber events give verified members priority access.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Need help?">
            <p className="text-sm text-muted-foreground">
              The membership desk can review your documents before submission.
            </p>
            <Button variant="outline" className="mt-3 w-full">
              Contact secretariat
            </Button>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}


export { BizVerification };
export default BizVerification;
