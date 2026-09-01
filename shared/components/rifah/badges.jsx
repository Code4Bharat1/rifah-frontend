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
    primary: "bg-primary-soft text-accent-foreground border-primary/20",
    brand: "bg-brand-soft text-brand border-brand/20",
    success: "bg-success-soft text-success border-success/25",
    warning: "bg-warning-soft text-warning-foreground border-warning/30",
    danger: "bg-brand-soft text-destructive border-destructive/25",
    navy: "bg-navy text-navy-foreground border-navy",
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
  correction: { label: "Correction required", tone: "warning", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  rejected: { label: "Not verified", tone: "danger", icon: <ShieldX className="h-3.5 w-3.5" /> },
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
  if (tier === "Free") return <Pill tone="neutral">Free listing</Pill>;
  if (tier === "Basic") return <Pill tone="primary">Basic member</Pill>;
  if (tier === "Premium")
    return (
      <Pill tone="brand" icon={<Star className="h-3.5 w-3.5" />}>
        Premium member
      </Pill>
    );
  return (
    <Pill tone="navy" icon={<Crown className="h-3.5 w-3.5" />}>
      Enterprise member
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
};

export function StatusBadge({ status }) {
  return <Pill tone={statusTone[status] ?? "neutral"}>{status}</Pill>;
}
