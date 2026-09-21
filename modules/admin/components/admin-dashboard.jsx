"use client";
import { toast } from "sonner";
import Link from "next/link";
import { Building2, CalendarDays, ShieldCheck, Users, Wallet, ArrowRight, Activity, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from "recharts";

import { AppShell } from "@shared/components/rifah/app-shell";
import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { MoreLink, Panel, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import {
  useAdminOverview,
  useVerificationQueue,
  useAllEnquiries,
  useChapters,
  useAuditLogs,
  useAllPayments,
} from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";

function AdminHome() {
  const { user } = useAuth();
  const isCentralAdmin = user?.role === "central_admin";

  const { data: overviewData, refetch: refetchOverview } = useAdminOverview();
  const { data: queueData, refetch: refetchQueue } = useVerificationQueue();
  const { data: enquiriesData } = useAllEnquiries();
  const { data: chaptersData } = useChapters();
  const { data: auditData } = useAuditLogs();
  const { data: paymentsData } = useAllPayments();

  const kpi = overviewData?.kpi || {};
  const queue = Array.isArray(queueData) ? queueData : (queueData?.verifications || []);
  const enquiries = Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData?.enquiries || enquiriesData?.data || []);
  const chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.chapters || []);
  const auditLogs = Array.isArray(auditData) ? auditData : (auditData?.logs || auditData?.auditLogs || []);
  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || paymentsData?.data || []);
  
  const membershipGrowth = overviewData?.membershipGrowth || [];
  const chaptersDist = overviewData?.chaptersDistribution || [];
  const mix = overviewData?.membershipMix || { Basic: 0, Premium: 0, Enterprise: 0 };
  const totalMembers = Object.values(mix).reduce((a, b) => a + b, 0) || 1;



  return (
    <AppShell
      role="admin"
      title="Central administration"
      subtitle="RIFAH Central Admin · all chapters"
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={user?.role === "chapter_admin" ? "/chapter-admin/reports" : "/admin/reports"}>View reports</Link>
          </Button>
          {isCentralAdmin && (
            <Button asChild className="rounded-full gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/admin/businesses/new">
                <Plus className="h-4 w-4" /> Add Business
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Member businesses"
            value={String(kpi.totalBusinesses || 0)}
            hint={`+${membershipGrowth[membershipGrowth.length - 1]?.new || 0} this month`}
            icon={Building2}
            tone="primary"
            href="/admin/businesses"
          />
          <StatCard
            label="Verification queue"
            value={String(queue.length)}
            hint={`${kpi.pendingVerifications || 0} pending`}
            icon={ShieldCheck}
            tone="warning"
            href="/admin/verification"
          />
          <StatCard
            label="Registered users"
            value={String(kpi.totalUsers || 0)}
            icon={Users}
            href="/admin/users"
          />
          <StatCard
            label="Payments this month"
            value={String(kpi.paidTransactions || 0)}
            hint={`₹ ${kpi.totalRevenue || 0} collected`}
            icon={Wallet}
            tone="success"
            href="/admin/payments"
          />
        </div>

        {/* Charts & Progress Panels Row */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <div className="mb-6">
                <h3 className="text-lg font-bold">Membership growth</h3>
                <p className="text-sm text-muted-foreground">Total members and new registrations</p>
             </div>
             <div className="h-[280px] w-full border-b border-border/40 pb-4">
                {membershipGrowth.every(d => d.total === 0) ? (
                  <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
                    <Activity className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No membership data yet.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membershipGrowth} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#888888' }} dy={10} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                         {membershipGrowth.map((entry, index) => (
                           <Cell key={`cell-${index}`} className="fill-primary" />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
             </div>
             <div className="mt-4 grid grid-cols-3 divide-x divide-border/40 text-center">
                <div>
                   <p className="text-2xl font-bold">{membershipGrowth[membershipGrowth.length - 1]?.new || 0}</p>
                   <p className="text-xs text-muted-foreground mt-1">New registrations</p>
                   <p className="text-[10px] text-green-600 font-medium mt-0.5">↗ Registrations up</p>
                </div>
                <div>
                   <p className="text-2xl font-bold">91%</p>
                   <p className="text-xs text-muted-foreground mt-1">Renewal rate</p>
                </div>
                <div>
                   <p className="text-2xl font-bold">{Math.round(((mix.Premium + mix.Enterprise) / totalMembers) * 100) || 0}%</p>
                   <p className="text-xs text-muted-foreground mt-1">Premium share</p>
                </div>
             </div>
          </div>
          
          <div className="space-y-6">
            <Panel title="Chapters Distribution" action={<MoreLink href="/admin/chapters" />}>
              <div className="space-y-5 mt-2">
                {chaptersDist.length === 0 ? (
                   <p className="text-xs text-muted-foreground">No chapters data available.</p>
                ) : (
                   chaptersDist.map((c, idx) => {
                     const pct = Math.round((c.members / (chaptersDist[0]?.members || 1)) * 100);
                     return (
                       <div key={c.name || idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                             <span className="font-medium">{c.name}</span>
                             <span className="font-semibold">{c.members}</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                       </div>
                     );
                   })
                )}
              </div>
            </Panel>
            <Panel title="Membership mix" action={<MoreLink href="/admin/memberships" />}>
               <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between bg-primary text-primary-foreground p-3 rounded-lg">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Enterprise member</span>
                     </div>
                     <span className="text-sm font-bold">{mix.Enterprise}</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Premium member</span>
                     </div>
                     <span className="text-sm font-bold">{mix.Premium}</span>
                  </div>
                  <div className="flex items-center justify-between bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Basic member</span>
                     </div>
                     <span className="text-sm font-bold">{mix.Basic}</span>
                  </div>
               </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {!isCentralAdmin && (
              <Panel
                title="Verification queue"
                description="Businesses awaiting chapter document verification"
                action={<MoreLink href="/admin/verification" />}
              >
                {queue.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Verification queue is clear. No pending applications.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {queue.slice(0, 5).map((item, idx) => (
                      <li key={item._id || item.id || idx} className="rounded-xl border border-border p-3.5 hover:border-primary/40 transition-colors">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{item.business?.name || "Business Application"}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {item.business?.industry} · {item.business?.city} · {item.business?.chapter}
                            </p>
                          </div>
                          <VerificationBadge status={item.status} compact />
                        </div>
                        {['pending', 'under_review'].includes(item.status?.toLowerCase()) && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                            <span className="text-xs text-muted-foreground">
                              {item.documents?.length || 0} document{(item.documents?.length || 0) === 1 ? "" : "s"} submitted
                            </span>
                            <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs font-semibold text-primary hover:bg-primary/10">
                              <Link href="/admin/verification">
                                Inspect & Review <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            <Panel title="Recent enquiries" description="Lead flow across the chamber" action={<MoreLink href="/admin/enquiries" />}>
              {enquiries.length === 0 ? (
                <p className="py-4 text-xs text-muted-foreground">No recent enquiries.</p>
              ) : (
                <ul className="space-y-2.5">
                  {enquiries.slice(0, 5).map((e, idx) => (
                    <li key={e._id || e.id || idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.buyerName} · {e.city} · {new Date(e.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Pill tone={e.responses?.length > 0 ? "success" : "warning"}>
                        {e.responses?.length || 0} resp.
                      </Pill>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            {isCentralAdmin && (
              <>
                <Panel title="Chapters & Units" action={<MoreLink href="/admin/chapters" />}>
                  <ul className="space-y-3">
                    {chapters.slice(0, 5).map((c, idx) => (
                      <li key={c._id || c.id || c.name || idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.city}, {c.state}</p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">{c.units?.length || 0} units</span>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel title="Latest payments" action={<MoreLink href="/admin/payments" />}>
                  {payments.length === 0 ? (
                    <p className="py-4 text-xs text-muted-foreground">No payment records.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {payments.slice(0, 4).map((p, idx) => (
                        <li key={p._id || p.id || idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.invoiceNumber}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              ₹ {p.amount} · {new Date(p.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Pill tone={p.status === "completed" ? "success" : "warning"}>
                            {p.status}
                          </Pill>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Audit log" action={<MoreLink href="/admin/audit" />}>
                  {auditLogs.length === 0 ? (
                    <p className="py-4 text-xs text-muted-foreground">No audit logs.</p>
                  ) : (
                    <ul className="space-y-3">
                      {auditLogs.slice(0, 4).map((a, idx) => (
                        <li key={a._id || a.id || idx} className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.action}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.entity} · {a.user?.name || "Admin"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { AdminHome as AdminDashboard };
export default AdminHome;
