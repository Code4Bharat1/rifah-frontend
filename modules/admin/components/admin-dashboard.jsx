"use client";
import Link from "next/link";
import { Building2, CalendarDays, ShieldCheck, Users, Wallet, ArrowRight, Activity } from "lucide-react";
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
import { verificationApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";

function AdminHome() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "secretariat";
  const { data: overviewData, refetch: refetchOverview } = useAdminOverview();
  const { data: queueData, refetch: refetchQueue } = useVerificationQueue();
  const { data: enquiriesData } = useAllEnquiries();
  const { data: chaptersData } = useChapters();
  const { data: auditData } = useAuditLogs();
  const { data: paymentsData } = useAllPayments();

  const kpi = overviewData?.data?.kpi || {};
  const queue = queueData || [];
  const enquiries = enquiriesData?.data || [];
  const chapters = chaptersData || [];
  const auditLogs = auditData?.data || [];
  const payments = paymentsData?.data || [];
  
  const membershipGrowth = overviewData?.data?.membershipGrowth || [];
  const chaptersDist = overviewData?.data?.chaptersDistribution || [];
  const mix = overviewData?.data?.membershipMix || { Basic: 0, Premium: 0, Enterprise: 0 };
  const totalMembers = Object.values(mix).reduce((a, b) => a + b, 0) || 1;

  const handleApprove = async (id) => {
    try {
      await verificationApi.review(id, { status: "approved", remarks: "Approved by Secretariat" });
      refetchQueue();
      refetchOverview();
    } catch (err) {
      alert(err.message || "Failed to approve verification.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await verificationApi.review(id, { status: "rejected", remarks: reason });
      refetchQueue();
      refetchOverview();
    } catch (err) {
      alert(err.message || "Failed to reject verification.");
    }
  };

  return (
    <AppShell
      role="admin"
      title="Chamber administration"
      subtitle="RIFAH Secretariat · all chapters"
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/reports">View reports</Link>
        </Button>
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
            <Panel title="Chapters" action={<MoreLink href="/admin/chapters" />}>
              <div className="space-y-5 mt-2">
                {chaptersDist.length === 0 ? (
                   <p className="text-xs text-muted-foreground">No chapters data available.</p>
                ) : (
                   chaptersDist.map(c => {
                     const pct = Math.round((c.members / (chaptersDist[0]?.members || 1)) * 100);
                     return (
                       <div key={c.name} className="space-y-1.5">
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
            <Panel title="Membership mix">
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
            <Panel
              title="Verification queue"
              description="Businesses awaiting secretariat verification"
              action={<MoreLink href="/admin/verification" />}
            >
              {queue.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Verification queue is clear. No pending applications.
                </p>
              ) : (
                <ul className="space-y-3">
                  {queue.slice(0, 5).map((item) => (
                    <li key={item._id} className="rounded-xl border border-border p-3.5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.business?.name || "Business Application"}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.business?.industry} · {item.business?.city} · {item.business?.chapter}
                          </p>
                        </div>
                        <VerificationBadge status={item.status} compact />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleApprove(item._id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleReject(item._id)}>
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Recent enquiries" description="Lead flow across the chamber" action={<MoreLink href="/admin/enquiries" />}>
              {enquiries.length === 0 ? (
                <p className="py-4 text-xs text-muted-foreground">No recent enquiries.</p>
              ) : (
                <ul className="space-y-2.5">
                  {enquiries.slice(0, 5).map((e) => (
                    <li key={e._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
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
            {isSuperAdmin && (
              <>
                <Panel title="Chapters & Units" action={<MoreLink href="/admin/chapters" />}>
                  <ul className="space-y-3">
                    {chapters.slice(0, 5).map((c) => (
                      <li key={c._id || c.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
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
                      {payments.slice(0, 4).map((p) => (
                        <li key={p._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
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
                      {auditLogs.slice(0, 4).map((a) => (
                        <li key={a._id} className="min-w-0">
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
