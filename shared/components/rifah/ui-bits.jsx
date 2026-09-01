import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";


import { cn } from "@shared/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
  href,
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
  };
  const destination = href ?? to;
  const body = (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", tones[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
  if (destination)
    return (
      <Link href={destination} className="block transition-colors hover:opacity-90">
        {body}
      </Link>
    );
  return body;
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
    <section className={cn("rounded-2xl border border-border bg-surface", className)}>
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3.5 md:px-5">
          <div className="min-w-0">
            {title && <h3 className="truncate text-sm font-semibold md:text-base">{title}</h3>}
            {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4 md:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function MoreLink({ to, href, children = "View all" }) {
  const destination = href ?? to ?? "#";
  return (
    <Link
      href={destination}
      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
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
  rows,
  columns,
  mobile,
  empty,
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  const renderMobileItem = typeof mobile === "function" ? mobile : (r) => (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
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
              <tr key={i} className="border-b border-border/70 last:border-0 hover:bg-muted/50">
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
