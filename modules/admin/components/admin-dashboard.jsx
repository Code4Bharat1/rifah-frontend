"use client";
import Link from "next/link";
import { Building2, CalendarDays, ShieldCheck, Users, Wallet } from "lucide-react";

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

function AdminHome() {
  const { data: overviewData, refetch: refetchOverview } = useAdminOverview();
  const { data: queueData, refetch: refetchQueue } = useVerificationQueue();
  const { data: enquiriesData } = useAllEnquiries();
  const { data: chaptersData } = useChapters();
  const { data: auditData } = useAuditLogs();
  const { data: paymentsData } = useAllPayments();

  const kpi = overviewData?.kpi || {};
  const queue = queueData || [];
  const enquiries = enquiriesData?.enquiries || [];
  const chapters = chaptersData || [];
  const auditLogs = auditData?.logs || [];
  const payments = paymentsData?.payments || [];

  const handleApprove = async (id) => {
    try {
      await verificationApi.review(id, { decision: "approved", notes: "Approved by Secretariat" });
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
      await verificationApi.review(id, { decision: "rejected", notes: reason });
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
      subtitle="RIFAH Secretariat · central governance"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/reports">View reports</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Member businesses"
            value={String(kpi.totalBusinesses || 0)}
            hint={`${kpi.verifiedBusinesses || 0} verified`}
            icon={Building2}
            tone="primary"
            href="/admin/businesses"
          />
          <StatCard
            label="Verification queue"
            value={String(queue.length)}
            hint="Awaiting secretariat action"
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
            label="Total Enquiries"
            value={String(kpi.totalEnquiries || 0)}
            hint="Platform RFQs"
            icon={Wallet}
            tone="success"
            href="/admin/enquiries"
          />
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { AdminHome as AdminDashboard };
export default AdminHome;
