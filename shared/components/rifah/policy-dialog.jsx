"use client";

import {
  HelpCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";

export const POLICY_TABS = [
  {
    key: "faqs",
    label: "FAQs",
    fullLabel: "Frequently Asked Questions",
    icon: HelpCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    key: "terms",
    label: "Terms & Conditions",
    fullLabel: "Terms & Conditions of Membership",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  {
    key: "payment",
    label: "Payment Policy",
    fullLabel: "Payment & Billing Policy",
    icon: CreditCard,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  {
    key: "membership",
    label: "Membership Policy",
    fullLabel: "Membership Rules & Guidelines",
    icon: ShieldCheck,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
];

const FAQS_CONTENT = [
  {
    q: "How does RIFAH verification work?",
    a: "Businesses submit registration certificates (GST, MSME/Udyam, PAN, CIN) and KYC details in their workspace. The RIFAH Central Admin and Chapter Officers inspect all submitted documentation, verify business legitimacy, and either approve the verified badge, request revisions, or provide constructive guidance.",
  },
  {
    q: "How are leads and buyer enquiries routed to members?",
    a: "Enquiries from the RIFAH public marketplace and business directory are matched according to industry category, service capability, and geography. Premium, Gold, and Patron members receive early priority routing, while multi-branch groups can establish automated routing rules across units.",
  },
  {
    q: "Can a membership plan be upgraded mid-term?",
    a: "Yes. Membership upgrades take effect immediately upon confirmation. The unutilized balance and remaining duration of your current plan are prorated and deducted from your upgrade invoice.",
  },
  {
    q: "Who is eligible to join RIFAH Chamber of Commerce?",
    a: "Any registered proprietary firm, partnership, LLP, private limited company, public limited enterprise, startup, or certified professional committed to ethical business practices, fair commerce, and community empowerment is eligible to join.",
  },
  {
    q: "What digital capabilities are included in my membership?",
    a: "Depending on your selected tier, members receive an official verified business listing, digital product catalogue, access to B2B enquiries, RFQ broadcasts, RIFAH AI Copilot assistance, chapter directory networking, and exhibition discounts.",
  },
  {
    q: "How do chapter meetings and networking conclaves work?",
    a: "RIFAH chapters host regular fortnightly meetings, state business summits, trade expos, and cross-chapter industrial visits where members pitch services, exchange qualified referrals, and collaborate on commercial joint ventures.",
  },
];

const TERMS_CONTENT = [
  {
    title: "1. Acceptance of Chamber Terms",
    content:
      "By applying for, renewing, or maintaining membership in RIFAH Chamber of Commerce and Industry (RCCI), members agree to abide by the Chamber constitution, executive bylaws, and digital platform terms of service.",
  },
  {
    title: "2. Ethical Business Conduct",
    content:
      "Members solemnly pledge to conduct commercial transactions with integrity, transparency, fair pricing, and compliance with statutory laws. Misleading representations, unfair trade practices, or deliberate contractual defaults constitute grounds for disciplinary review.",
  },
  {
    title: "3. Directory Accuracy & Verification",
    content:
      "Members are solely responsible for ensuring that all business details, licences, catalogues, and certifications uploaded to the directory are authentic and up to date. RIFAH reserves the right to request audit documents or revoke verified credentials if discrepancies arise.",
  },
  {
    title: "4. Platform Use & Data Protection",
    content:
      "Member directories, buyer leads, and contact data accessible via RIFAH portals are intended strictly for verified B2B commerce. Scraping, harvesting, reselling member lists, or sending unsolicited mass marketing communications is strictly prohibited.",
  },
  {
    title: "5. Limitation of Chamber Liability",
    content:
      "RIFAH facilitates commercial connections and networking in good faith. The Chamber is not a party to commercial contracts, delivery agreements, or financial transactions between members, and assumes no liability for disputes arising from independent commercial dealings.",
  },
];

const PAYMENT_CONTENT = [
  {
    title: "1. Annual Subscription & Billing Cycles",
    content:
      "Membership dues are billed on an annual subscription basis. Rates are defined in Indian Rupees (₹ INR) for domestic enterprises and US Dollars ($ USD) for international chapters and NRI members.",
  },
  {
    title: "2. GST Invoicing & Tax Compliance",
    content:
      "All domestic membership fees are subject to 18% GST as per Indian taxation regulations. Digital tax invoices bearing the member's GSTIN are generated immediately upon successful payment clearance and remain downloadable from the billing dashboard.",
  },
  {
    title: "3. Accepted Modes of Payment",
    content:
      "Membership dues may be paid via secure online payment gateways (UPI, Credit/Debit Cards, Net Banking), Direct NEFT/RTGS bank transfers to the official RIFAH Chamber account, or crossed Demand Drafts.",
  },
  {
    title: "4. Renewals & Grace Period",
    content:
      "Membership renewal notices are dispatched 30, 15, and 7 days prior to expiry. A 14-day grace period is provided following expiry, during which listing visibility remains active before downgrading to associate status.",
  },
  {
    title: "5. Refund & Upgrade Policy",
    content:
      "Membership fees cover administrative costs, chapter governance, and platform operational services and are non-refundable once membership verification has been approved. Upgrades to higher tiers are prorated against the active plan balance.",
  },
];

const MEMBERSHIP_CONTENT = [
  {
    title: "1. Membership Classifications & Rights",
    content:
      "RIFAH provides structured membership tiers (Basic, Silver, Gold, Platinum, Patron). Each tier defines catalogue limits, priority in directory searches, RFQ access, and representation rights at national delegations.",
  },
  {
    title: "2. Chapter Affiliation & Cross-Networking",
    content:
      "Members are assigned to their primary local chapter based on their registered office. While voting rights are tied to the home chapter, members enjoy nationwide networking privileges across all RIFAH chapters.",
  },
  {
    title: "3. Corporate Representation",
    content:
      "Registered entities may nominate up to two designated partners, directors, or senior executives to represent the enterprise at chapter assemblies, business conclaves, and official Chamber delegations.",
  },
  {
    title: "4. Official Verified Badge Usage",
    content:
      "Members in good standing are authorized to display the official 'RIFAH Verified Member' badge on their websites, digital catalogues, business stationery, and marketing literature.",
  },
  {
    title: "5. Suspension & Termination",
    content:
      "The State or Central Disciplinary Committee may suspend or revoke membership in cases of substantiated commercial fraud, violation of ethical codes, or non-compliance with statutory regulations.",
  },
];

export function PolicyDialog({ openKey, onClose }) {
  const activeTab = openKey || "faqs";
  const currentTab = POLICY_TABS.find((t) => t.key === activeTab) || POLICY_TABS[0];
  const Icon = currentTab.icon;

  return (
    <Dialog open={Boolean(openKey)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-border shadow-2xl">
        {/* Header bar */}
        <div className="border-b border-border/80 bg-muted/40 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-xs", currentTab.bg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {currentTab.fullLabel}
                </DialogTitle>
                <span className={cn("hidden sm:inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border", currentTab.bg)}>
                  Official Document
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                RIFAH Chamber of Commerce and Industry
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body - Only showing the clicked document */}
        <div className="max-h-[66vh] sm:max-h-[68vh] overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === "faqs" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Find quick answers about Chamber membership, verification, business lead routing, and member privileges below.
                </span>
              </div>
              <div className="grid gap-3">
                {FAQS_CONTENT.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">{faq.q}</h4>
                    </div>
                    <p className="mt-2 pl-7 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <FileText className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  These terms govern your membership application, directory presence, and participation in RIFAH Chamber initiatives.
                </span>
              </div>
              <div className="space-y-3">
                {TERMS_CONTENT.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/80 bg-card p-4">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Review our transparent membership fee billing, GST invoice generation, annual renewals, and upgrade policies.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-center">
                  <div className="text-[11px] font-medium text-muted-foreground">GST Invoicing</div>
                  <div className="mt-1 text-xs font-bold text-foreground">18% Compliant</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-center">
                  <div className="text-[11px] font-medium text-muted-foreground">Billing Cycle</div>
                  <div className="mt-1 text-xs font-bold text-foreground">Annual Plan</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-center">
                  <div className="text-[11px] font-medium text-muted-foreground">Renewal Grace</div>
                  <div className="mt-1 text-xs font-bold text-foreground">14 Days</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-center">
                  <div className="text-[11px] font-medium text-muted-foreground">Plan Upgrades</div>
                  <div className="mt-1 text-xs font-bold text-foreground">Prorated Value</div>
                </div>
              </div>
              <div className="space-y-3">
                {PAYMENT_CONTENT.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/80 bg-card p-4">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "membership" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                <span>
                  Official Chamber guidelines for membership rights, chapter attendance, verified credentials, and disciplinary governance.
                </span>
              </div>
              <div className="space-y-3">
                {MEMBERSHIP_CONTENT.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/80 bg-card p-4">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with support info and Close button */}
        <div className="border-t border-border/80 bg-muted/30 px-5 py-3.5 sm:px-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">Questions? Contact Chamber:</span>
            <a href="mailto:office@rifah.org" className="hover:text-primary transition-colors flex items-center gap-1">
              <Mail className="h-3 w-3" /> office@rifah.org
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="tel:+91-809-778-1851" className="hover:text-primary transition-colors flex items-center gap-1">
              <Phone className="h-3 w-3" /> +91-809-778-1851
            </a>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-lg self-end sm:self-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PolicyDialog;
