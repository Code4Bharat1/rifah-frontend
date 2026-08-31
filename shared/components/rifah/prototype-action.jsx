"use client";
import * as React from "react";
import { CheckCircle2, MousePointerClick } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import {
  PrototypeActionContext,

} from "@shared/lib/prototype-action";







function blueprintFor(label) {
  const l = label.toLowerCase();

  const make = (
    summary,
    steps,
    data,
  ) => ({ summary, steps, data });

  if (/(enquir|quote|rfq|sourc)/.test(l))
    return make(
      "Opens the sourcing enquiry workflow so a buyer requirement is captured and routed to matching RIFAH members.",
      [
        "Buyer fills requirement, quantity, delivery city and timeline",
        "Enquiry is matched against member categories and chapters",
        "Up to 5 verified members are notified and can respond with a quote",
        "Buyer compares responses inside My Enquiries",
      ],
      [
        { label: "Avg. first response", value: "4h 20m" },
        { label: "Members matched", value: "5 verified suppliers" },
        { label: "Routing rule", value: "Category + city + membership tier" },
      ],
    );

  if (/(message|chat|reply|send)/.test(l))
    return make(
      "Opens the moderated RIFAH messaging thread between buyer and member business.",
      [
        "Thread is created against the enquiry reference",
        "Both sides get in-app and email notification",
        "Secretariat can audit the thread if a dispute is raised",
      ],
      [
        { label: "Thread SLA", value: "Respond within 24h" },
        { label: "Attachments", value: "PDF, JPG up to 10 MB" },
        { label: "Moderation", value: "Flagged words queued for review" },
      ],
    );

  if (/(verif|approve|reject|document|kyc)/.test(l))
    return make(
      "Runs the secretariat verification decision for the selected member business.",
      [
        "Reviewer checks GST, registration and address proof",
        "Decision is recorded with reviewer name and timestamp",
        "Member is notified; verified badge appears on the public profile",
      ],
      [
        { label: "Queue size", value: "18 pending applications" },
        { label: "Target turnaround", value: "3 working days" },
        { label: "Audit", value: "Every decision written to audit log" },
      ],
    );

  if (/(pay|invoice|renew|checkout|plan|membership|upgrade)/.test(l))
    return make(
      "Starts the membership purchase / renewal flow with invoice generation.",
      [
        "Plan and billing cycle selected",
        "GST invoice generated against the member profile",
        "Payment gateway confirms and membership tier activates instantly",
      ],
      [
        { label: "Silver", value: "₹5,000 / year" },
        { label: "Gold", value: "₹12,000 / year" },
        { label: "Platinum", value: "₹25,000 / year" },
      ],
    );

  if (/(register|regist|rsvp|event|ticket|attend)/.test(l))
    return make(
      "Registers the current user for the selected chamber event and issues a pass.",
      [
        "Seat is reserved and confirmation email sent",
        "QR pass added to My Events",
        "Attendee list shared with the organising chapter",
      ],
      [
        { label: "Next event", value: "RIFAH Business Meet — Mumbai" },
        { label: "Seats left", value: "42 of 250" },
        { label: "Member price", value: "Free for Gold & Platinum" },
      ],
    );

  if (/(save|shortlist|bookmark|follow)/.test(l))
    return make(
      "Adds the business to the buyer's shortlist for later comparison.",
      [
        "Business pinned to Saved Businesses",
        "Buyer can bulk-send one enquiry to the whole shortlist",
      ],
      [
        { label: "Saved suppliers", value: "7" },
        { label: "Bulk enquiry", value: "Up to 10 businesses" },
      ],
    );

  if (/(export|download|report|csv|pdf)/.test(l))
    return make(
      "Generates a chamber report export for the current filters.",
      [
        "Report queued with the applied date and chapter filters",
        "CSV / PDF emailed to the secretariat account",
      ],
      [
        { label: "Formats", value: "CSV, XLSX, PDF" },
        { label: "Retention", value: "Exports kept for 30 days" },
      ],
    );

  if (/(add|create|new|publish|upload|edit|save changes|update)/.test(l))
    return make(
      "Opens the editor for this record and writes the change back to the member profile.",
      [
        "Form validates required fields before submit",
        "Change is versioned with editor name and timestamp",
        "Public profile updates after moderation passes",
      ],
      [
        { label: "Profile completeness", value: "78% → 92% after this step" },
        { label: "Moderation", value: "Catalogue edits auto-approved for verified members" },
      ],
    );

  if (/(call|whatsapp|contact|email)/.test(l))
    return make(
      "Reveals verified contact details and logs the touchpoint against the member's lead record.",
      [
        "Contact reveal counted towards the member's lead analytics",
        "Buyer identity shared with the business",
      ],
      [
        { label: "Contact reveals (30d)", value: "134" },
        { label: "Reveal → enquiry rate", value: "28%" },
      ],
    );

  return make(
    "This control is part of the RIFAH Connect prototype journey. The layout, data and downstream steps below show what it does in the live product.",
    [
      "Action is captured with the current user role and context",
      "Relevant workspace list refreshes with the new state",
      "Notification is sent to the affected party",
    ],
    [
      { label: "Prototype", value: "Wireframe / clickable demo" },
      { label: "Status", value: "To confirm with chamber secretariat" },
    ],
  );
}

export function PrototypeActionProvider({ children }) {
  const [payload, setPayload] = React.useState(null);

  const ctx = React.useMemo(
    () => ({ open: (p) => setPayload(p) }),
    [],
  );

  const label = payload?.label?.trim() || "Prototype action";
  const bp = blueprintFor(label);

  return (
    <PrototypeActionContext.Provider value={ctx}>
      {children}
      <Dialog open={!!payload} onOpenChange={(o) => !o && setPayload(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
              <MousePointerClick className="size-4" />
              Action preview
            </div>
            <DialogTitle className="text-left text-lg">{label}</DialogTitle>
            <DialogDescription className="text-left">{bp.summary}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What happens next
              </p>
              <ul className="mt-2 space-y-2">
                {bp.steps.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {bp.data.map((d) => (
                <div key={d.label} className="rounded-xl border border-border p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {d.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{d.value}</p>
                </div>
              ))}
            </div>

            {payload?.context ? (
              <p className="text-xs text-muted-foreground">{payload.context}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="brand" onClick={() => setPayload(null)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PrototypeActionContext.Provider>
  );
}
