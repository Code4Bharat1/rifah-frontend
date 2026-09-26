import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";


import { cn } from "@shared/lib/utils";
import { resolveMediaUrl } from "@shared/lib/api-client";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
  href,
  onClick,
  active = false,
  className,
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-primary-soft text-primary",
    neutral: "bg-muted text-muted-foreground",
  };
  const destination = href ?? to;
  const isClickable = Boolean(destination || onClick);

  const cardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border transition-all duration-200 p-4 select-none cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        active
          ? "border-primary/20 bg-primary/[0.04] dark:bg-primary/10 shadow-xs"
          : "border-border/70 bg-surface hover:bg-muted/30 hover:border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "min-w-0 text-xs font-medium transition-colors",
            active ? "font-semibold text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200 group-hover:scale-105",
              active ? "bg-primary text-primary-foreground shadow-xs" : tones[tone]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight tabular-nums transition-colors",
          active ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );

  if (destination) {
    return (
      <Link href={destination} className="block h-full transition-transform focus:outline-none">
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full h-full text-left transition-transform focus:outline-none"
      >
        {cardContent}
      </button>
    );
  }

  return cardContent;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}




) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}






) {
  return (
    <section className={cn("rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden", className)}>
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="min-w-0">
            {title && (
              typeof title === "string" ? (
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white md:text-base">{title}</h3>
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white md:text-base">{title}</div>
              )
            )}
            {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4 md:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function MoreLink({ to, href, children, label, className, onClick }) {
  const destination = href ?? to ?? "#";
  let content = children ?? label ?? "View all";
  if (typeof content === "string") {
    content = content.replace(/[→\->]/g, "").trim();
  }
  return (
    <Link
      href={destination}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors select-none",
        className
      )}
    >
      <span>{content || "View all"}</span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}

export function TrendNote({ children }) {
  return (
    <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
      <TrendingUp className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

/** Responsive table: real table from md up, stacked cards on mobile. */
export function ResponsiveTable({
  rows = [],
  columns = [],
  mobile,
  empty,
  onRowClick,
}) {
  if (!rows || rows.length === 0) return empty ? <>{empty}</> : null;

  const renderMobileItem = typeof mobile === "function" ? mobile : (r) => (
    <div 
      className={cn("rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs", onRowClick && "cursor-pointer hover:border-primary/50 transition-colors")}
      onClick={() => onRowClick && onRowClick(r)}
    >
      {columns.map((c) => (
        c.header ? (
          <div key={c.key} className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">{c.header}</span>
            <div>{c.cell(r)}</div>
          </div>
        ) : (
          <div key={c.key} className="pt-1 flex justify-end">{c.cell(r)}</div>
        )
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((r, i) => (
          <div key={i}>{renderMobileItem(r, i)}</div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn("px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground", c.className)}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr 
                key={i} 
                className={cn("border-b border-border/70 last:border-0 hover:bg-muted/50", onRowClick && "cursor-pointer")}
                onClick={() => onRowClick && onRowClick(r)}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-3 py-3 align-middle", c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,40%)_minmax(0,1fr)] gap-3 border-b border-border py-2.5 last:border-0 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
      <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="min-w-0 text-sm font-medium">{value}</dd>
    </div>
  );
}

export function Steps({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label="Progress">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                state === "done" && "bg-success text-success-foreground",
                state === "current" && "bg-primary text-primary-foreground",
                state === "todo" && "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                state === "todo" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

export function UserAvatar({ user, className, iconClassName, fallbackClassName }) {
  const [imgError, setImgError] = useState(false);
  const rawAvatar = user?.avatar || user?.picture || user?.image;
  const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : "";

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "Profile"}
        onError={() => setImgError(true)}
        className={cn("h-7 w-7 rounded-full object-cover shrink-0", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground",
        className,
        fallbackClassName
      )}
    >
      {user?.name?.charAt(0)?.toUpperCase() || "U"}
    </span>
  );
}
