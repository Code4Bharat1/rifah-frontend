"use client";
import { Eye, MessageSquare, Star, Target } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard, TrendNote } from "@shared/components/rifah/ui-bits";
import { Progress } from "@shared/components/ui/progress";
import { catalogue, leadTrend, reviews } from "@shared/lib/mock-data";

function BizAnalytics() {
  const maxViews = Math.max(...leadTrend.map((d) => d.views));
  const maxLeads = Math.max(...leadTrend.map((d) => d.leads));
  const top = catalogue.slice(0, 5).map((c, i) => ({ ...c, views: 320 - i * 48 }));

  return (
    <AppShell role="business" title="Analytics" subtitle="Last 6 months of activity">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Profile views" value="860" hint="+21% vs last month" icon={Eye} tone="primary" />
          <StatCard label="Leads received" value="46" icon={Target} tone="brand" />
          <StatCard label="Enquiries" value="58" icon={MessageSquare} tone="success" />
          <StatCard label="Average rating" value="4.6" hint="24 reviews" icon={Star} tone="warning" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Profile views" description="Monthly unique views">
            <div className="flex items-end gap-2 sm:gap-3" role="img" aria-label="Monthly profile views">
              {leadTrend.map((d) => (
                <div key={d.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{d.views}</span>
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${(d.views / maxViews) * 130}px` }} />
                  <span className="text-[11px] text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <TrendNote>Steady growth since the Premium upgrade</TrendNote>
            </div>
          </Panel>

          <Panel title="Leads vs enquiries" description="Volume by month">
            <ul className="space-y-3">
              {leadTrend.map((d) => (
                <li key={d.month} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">{d.month}</span>
                  <div className="space-y-1">
                    <Progress value={(d.leads / maxLeads) * 100} />
                    <Progress value={(d.enquiries / (maxLeads * 1.3)) * 100} className="h-1.5" />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {d.leads}/{d.enquiries}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Top catalogue items" description="By buyer views">
            <ul className="space-y-3">
              {top.map((t) => (
                <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <Progress value={(t.views / 320) * 100} className="mt-1.5" />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{t.views}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent reviews">
            <ul className="space-y-3.5">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold">{r.title}</p>
                    <span className="flex shrink-0 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={i < r.rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted"} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {r.author} · {r.date}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}


export { BizAnalytics };
export default BizAnalytics;
