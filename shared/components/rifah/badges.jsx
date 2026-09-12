import { AlertCircle, BadgeCheck, Clock, Crown, ShieldX, Star } from "lucide-react";



import { cn } from "@shared/lib/utils";

export function Pill({
  children,
  tone = "neutral",
  className,
  icon,
}




) {
  const tones = {
    neutral: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary-soft text-primary border-primary/25",
    brand: "bg-brand-soft text-brand border-brand/25",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    navy: "bg-navy text-white border-navy",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const verificationMap = {
  verified: { label: "Verified", tone: "success", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  pending: { label: "Verification pending", tone: "warning", icon: <Clock className="h-3.5 w-3.5" /> },
  under_review: { label: "Under Review", tone: "warning", icon: <Clock className="h-3.5 w-3.5" /> },
  correction: { label: "Correction required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  correction_requested: { label: "Changes Required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  changes_required: { label: "Changes Required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", tone: "danger", icon: <ShieldX className="h-3.5 w-3.5" /> },
  unverified: { label: "Not verified", tone: "neutral", icon: <ShieldX className="h-3.5 w-3.5" /> },
};

export function VerificationBadge({ status, compact = false }) {
  const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "unverified";
  const v = verificationMap[normalizedStatus] || {
    label: status || "Not verified",
    tone: "neutral",
    icon: <ShieldX className="h-3.5 w-3.5" />,
  };
  return (
    <Pill tone={v.tone} icon={v.icon}>
      {compact && normalizedStatus === "verified" ? "Verified" : v.label}
    </Pill>
  );
}

export function MembershipBadge({ tier }) {
  if (!tier) return <Pill tone="neutral">Free member</Pill>;
  
  const normalized = tier.toString().toLowerCase();
  if (normalized === "free") return <Pill tone="neutral">Free member</Pill>;
  if (normalized === "basic") return <Pill tone="primary">Basic member</Pill>;
  if (normalized === "premium")
    return (
      <Pill tone="brand" icon={<Star className="h-3.5 w-3.5" />}>
        Premium member
      </Pill>
    );
  if (normalized === "enterprise")
    return (
      <Pill tone="navy" icon={<Crown className="h-3.5 w-3.5" />}>
        Enterprise member
      </Pill>
    );
  
  // Fallback for custom dynamic plans
  return (
    <Pill tone="primary" icon={<Star className="h-3.5 w-3.5" />}>
      {tier} member
    </Pill>
  );
}

const statusTone = {
  New: "primary",
  "In Progress": "warning",
  Responded: "primary",
  Won: "success",
  Closed: "neutral",
  Rejected: "danger",
  Active: "success",
  Paid: "success",
  Pending: "warning",
  Processing: "warning",
  Failed: "danger",
  Refunded: "neutral",
  Cancelled: "neutral",
  Expired: "danger",
  Suspended: "danger",
  Draft: "neutral",
  Approved: "success",
  Upcoming: "primary",
  Past: "neutral",
  Forming: "warning",
  Planned: "warning",
  High: "danger",
  Medium: "warning",
  Low: "neutral",
  Escalated: "warning",
};

export function StatusBadge({ status }) {
  return <Pill tone={statusTone[status] ?? "neutral"}>{status}</Pill>;
}
