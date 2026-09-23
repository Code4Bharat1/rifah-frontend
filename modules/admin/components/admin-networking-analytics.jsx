"use client";
import { useState } from "react";
import { Trophy, ArrowUpRight, ArrowDownLeft, Loader2, Building2, MapPin } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/components/ui/tabs";
import { useAuth } from "@shared/providers/auth-provider";
import { useNetworkingOverview, useNetworkingLeaderboard, useNetworkingBreakdown } from "@shared/hooks/use-rifah-api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function AdminNetworkingAnalytics() {
  const { user } = useAuth();
  const role = user?.role;
  const currentRole = role === "state_admin" ? "state_admin" : role === "chapter_admin" ? "chapter_admin" : "admin";

  const { data: overview, isLoading: overviewLoading } = useNetworkingOverview();

  const [leaderboardType, setLeaderboardType] = useState("given");
  const { data: leaderboardData, isLoading: leaderboardLoading } = useNetworkingLeaderboard({
    type: leaderboardType,
    limit: 10,
  });
  const leaderboardRows = leaderboardData?.rows || [];

  const isCentral = role === "central_admin";
  const breakdownLevel = isCentral ? "state" : role === "state_admin" ? "chapter" : null;
  const { data: breakdownData, isLoading: breakdownLoading } = useNetworkingBreakdown({ level: breakdownLevel });
  const breakdownRows = breakdownData?.rows || [];

  const scopeName = overview?.scope?.name || "";
  const title =
    isCentral
      ? "Business Generated Analytics"
      : role === "state_admin"
        ? `${scopeName || "State"} — Business Analytics`
        : `${scopeName || "Chapter"} — Business Analytics`;

  const breakdownTitle = isCentral ? "State-wise Business Generated" : "Chapter-wise Business Generated";

  return (
    <AppShell
      role={currentRole}
      title={title}
      subtitle="Business generated between members through One to One meetings and Referrals"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Business given"
            value={overviewLoading ? "…" : currencyFormatter.format(overview?.totalGiven || 0)}
            icon={ArrowUpRight}
            tone="success"
            hint={`${overview?.givenCount || 0} transactions`}
          />
          <StatCard
            label="Business received"
            value={overviewLoading ? "…" : currencyFormatter.format(overview?.totalReceived || 0)}
            icon={ArrowDownLeft}
            tone="brand"
            hint={`${overview?.receivedCount || 0} transactions`}
          />
          <StatCard
            label="Total volume"
            value={overviewLoading ? "…" : currencyFormatter.format(overview?.totalVolume || 0)}
            icon={Building2}
            tone="primary"
            hint={`${overview?.transactionCount || 0} thank you notes`}
          />
          <StatCard
            label="Via referrals"
            value={overviewLoading ? "…" : currencyFormatter.format(overview?.bySource?.referral?.total || 0)}
            icon={MapPin}
            tone="warning"
            hint={`${overview?.bySource?.referral?.count || 0} referrals closed`}
          />
        </div>

        <Panel
          title="Leaderboard"
          description="Top members ranked by business generated for or received from others"
        >
          <Tabs value={leaderboardType} onValueChange={setLeaderboardType}>
            <TabsList>
              <TabsTrigger value="given">
                <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Top Givers
              </TabsTrigger>
              <TabsTrigger value="received">
                <ArrowDownLeft className="mr-1.5 h-3.5 w-3.5" /> Top Receivers
              </TabsTrigger>
            </TabsList>
            <TabsContent value={leaderboardType}>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading leaderboard...
                </div>
              ) : leaderboardRows.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No business generated yet"
                  description="As members log thank you notes for business given and received, the leaderboard will populate here."
                />
              ) : (
                <div className="space-y-2">
                  {leaderboardRows.map((row, index) => (
                    <div
                      key={`leaderboard-${row.businessId || index}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{row.businessName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {row.chapterName || "Chapter"}
                            {row.state ? ` · ${row.state}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{currencyFormatter.format(row.total)}</p>
                        <p className="text-[11px] text-muted-foreground">{row.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Panel>

        {breakdownLevel && (
          <Panel title={breakdownTitle} description="Business given and received, broken down by region">
            {breakdownLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading breakdown...
              </div>
            ) : breakdownRows.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No data yet"
                description="Once members start logging business generated, the breakdown will show here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-3">{isCentral ? "State" : "Chapter"}</th>
                      <th className="px-4 py-3">Given</th>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {breakdownRows.map((row, index) => (
                      <tr key={`breakdown-${row.chapterId || row.label || index}-${index}`} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-success font-semibold">{currencyFormatter.format(row.given)}</td>
                        <td className="px-4 py-3 text-primary font-semibold">{currencyFormatter.format(row.received)}</td>
                        <td className="px-4 py-3 font-bold">{currencyFormatter.format(row.given + row.received)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

export { AdminNetworkingAnalytics };
export default AdminNetworkingAnalytics;
