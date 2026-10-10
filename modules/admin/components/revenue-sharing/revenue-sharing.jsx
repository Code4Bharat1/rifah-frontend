"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  IndianRupee,
  Wallet,
  Receipt,
  TrendingUp,
  FileStack,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Settings2,
  Building2,
  MapPinned,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { useAuth } from "@shared/providers/auth-provider";
import { revenueShareApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@shared/components/ui/dialog";
import {
  StatCard,
  Panel,
  ResponsiveTable,
} from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const STATUS_TONE = {
  draft: "neutral",
  submitted: "primary",
  under_review: "warning",
  approved: "success",
  rejected: "danger",
  partially_paid: "warning",
  paid: "success",
  cancelled: "neutral",
  pending: "neutral",
  payable: "warning",
  reversed: "danger",
  disputed: "danger",
};

/**
 * RIFAH Revenue Sharing & Settlement — Central/State/Chapter Admin.
 *
 * One shared component reused across /admin, /state-admin, /chapter-admin via a role
 * prop (same convention as admin-settings.jsx / admin-lms.jsx) — visibility of what data
 * each tier sees is entirely server-enforced (revenue-sharing.routes.js + getChapterFilter
 * reuse), this component just also hides actions a role can never perform (submitting a
 * claim as Central Admin, approving as anyone but Central Admin, rule config as anyone
 * but Central Admin) so nobody sees a button that would just 403.
 */
export function RevenueSharing({ expectedRole }) {
  const { user } = useAuth();
  const role = user?.role || expectedRole || "admin";
  const isCentralAdmin = [
    "central_admin",
    "admin",
    "super_admin",
    "secretariat",
  ].includes(role);
  const isStateAdmin = role === "state_admin";
  const isChapterAdmin = role === "chapter_admin";
  const canClaim = isStateAdmin || isChapterAdmin;

  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "ledger", label: "Ledger" },
    { key: "claims", label: "Claims" },
    ...(isCentralAdmin ? [{ key: "rules", label: "Rules" }] : []),
  ];

  return (
    <AppShell
      role={isCentralAdmin ? "admin" : role}
      title="Revenue Sharing & Settlement"
      subtitle="Who owes whom, and why — membership and event revenue allocations, claims and settlements"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-5 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-2.5 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab isCentralAdmin={isCentralAdmin} />
        )}
        {activeTab === "ledger" && (
          <LedgerTab isCentralAdmin={isCentralAdmin} />
        )}
        {activeTab === "claims" && (
          <ClaimsTab
            isCentralAdmin={isCentralAdmin}
            canClaim={canClaim}
            userRole={role}
          />
        )}
        {activeTab === "rules" && isCentralAdmin && <RulesTab />}
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function DashboardTab({ isCentralAdmin }) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    revenueType: "all",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await revenueShareApi.getDashboard(filters);
      setData(res.data);
    } catch (e) {
      toast.error(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.revenueType]);

  const handleExport = async (format) => {
    try {
      if (format === "csv") await revenueShareApi.downloadLedgerCsv(filters);
      else await revenueShareApi.downloadLedgerPdf(filters);
      toast.success(`${format.toUpperCase()} export downloaded`);
    } catch (e) {
      toast.error(e?.message || "Export failed");
    }
  };

  if (loading && !data) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }
  if (!data) return null;

  const {
    totals,
    allocationsByLevel,
    payableByChapter,
    payableByState,
    claims,
    reconciliationExceptions,
  } = data;

  return (
    <div className="space-y-5">
      <Panel
        title="Filters"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleExport("csv")}
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleExport("pdf")}
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">From date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, startDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Revenue type</Label>
            <Select
              value={filters.revenueType}
              onValueChange={(v) =>
                setFilters((p) => ({ ...p, revenueType: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Gross Collections"
          value={inr(totals.grossAmount)}
          icon={IndianRupee}
          tone="primary"
        />
        <StatCard
          label="GST Collected"
          value={inr(totals.gstAmount)}
          icon={Receipt}
        />
        <StatCard
          label="Eligible Revenue Base"
          value={inr(totals.eligibleRevenueBase)}
          icon={TrendingUp}
          tone="brand"
        />
        <StatCard
          label="Total Allocated"
          value={inr(totals.totalAllocated)}
          icon={Wallet}
          tone="success"
        />
      </div>

      <Panel
        title="Allocations by Beneficiary Level"
        description="Membership: Chapter 50% / State 25% / Central 25% — Event: 100% to organizer"
      >
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Chapter"
            value={inr(allocationsByLevel.chapter)}
            icon={Building2}
          />
          <StatCard
            label="State"
            value={inr(allocationsByLevel.state)}
            icon={MapPinned}
          />
          <StatCard
            label="Central"
            value={inr(allocationsByLevel.central)}
            icon={IndianRupee}
          />
        </div>
      </Panel>

      <Panel title="Claims Funnel">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["submitted", "approved", "rejected", "paid"].map((s) => (
            <StatCard
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              value={`${claims[s]?.count || 0}`}
              hint={inr(claims[s]?.amount || 0)}
            />
          ))}
        </div>
      </Panel>

      {payableByChapter.length > 0 && (
        <Panel title="Center Payable — by Chapter">
          <ResponsiveTable
            rows={payableByChapter}
            columns={[
              {
                key: "chapter",
                header: "Chapter",
                cell: (r) => r.chapterName || "—",
              },
              { key: "earned", header: "Earned", cell: (r) => inr(r.earned) },
              {
                key: "outstanding",
                header: "Outstanding",
                cell: (r) => (
                  <span className="font-bold text-amber-600">
                    {inr(r.outstanding)}
                  </span>
                ),
              },
            ]}
          />
        </Panel>
      )}

      {payableByState.length > 0 && (
        <Panel title="Center Payable — by State">
          <ResponsiveTable
            rows={payableByState}
            columns={[
              { key: "state", header: "State", cell: (r) => r.state || "—" },
              { key: "earned", header: "Earned", cell: (r) => inr(r.earned) },
              {
                key: "outstanding",
                header: "Outstanding",
                cell: (r) => (
                  <span className="font-bold text-amber-600">
                    {inr(r.outstanding)}
                  </span>
                ),
              },
            ]}
          />
        </Panel>
      )}

      {isCentralAdmin && reconciliationExceptions.length > 0 && (
        <Panel
          title="Reconciliation Exceptions"
          description="Payments whose allocations don't exactly sum to the eligible base — should never normally appear."
        >
          <ResponsiveTable
            rows={reconciliationExceptions}
            columns={[
              {
                key: "pay",
                header: "Payment",
                cell: (r) => String(r.sourcePaymentId),
              },
              {
                key: "base",
                header: "Eligible Base",
                cell: (r) => inr(r.eligibleBase),
              },
              {
                key: "alloc",
                header: "Allocated",
                cell: (r) => inr(r.allocated),
              },
              {
                key: "diff",
                header: "Difference",
                cell: (r) => (
                  <span className="text-destructive font-bold">
                    {inr(r.difference)}
                  </span>
                ),
              },
            ]}
          />
        </Panel>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ledger
// ─────────────────────────────────────────────────────────────────────────────
function LedgerTab() {
  const [filters, setFilters] = useState({
    revenueType: "all",
    beneficiaryLevel: "all",
    status: "all",
    page: 1,
  });
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await revenueShareApi.listLedger(filters);
      setEntries(res.data || []);
      setMeta(res.meta);
    } catch (e) {
      toast.error(e?.message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.revenueType,
    filters.beneficiaryLevel,
    filters.status,
    filters.page,
  ]);

  return (
    <div className="space-y-4">
      <Panel title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            value={filters.revenueType}
            onValueChange={(v) =>
              setFilters((p) => ({ ...p, revenueType: v, page: 1 }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Revenue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All revenue types</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.beneficiaryLevel}
            onValueChange={(v) =>
              setFilters((p) => ({ ...p, beneficiaryLevel: v, page: 1 }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Beneficiary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All beneficiaries</SelectItem>
              <SelectItem value="chapter">Chapter</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="central">Central</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              setFilters((p) => ({ ...p, status: v, page: 1 }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {[
                "pending",
                "payable",
                "partially_paid",
                "paid",
                "reversed",
                "disputed",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Panel>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading ledger…
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No ledger entries"
          description="No revenue-sharing allocations match these filters yet."
        />
      ) : (
        <>
          <ResponsiveTable
            rows={entries}
            onRowClick={(r) => setSelected(r)}
            columns={[
              {
                key: "date",
                header: "Date",
                cell: (r) =>
                  new Date(r.transactionDate).toLocaleDateString("en-IN"),
              },
              {
                key: "type",
                header: "Type",
                cell: (r) => <Pill tone="neutral">{r.revenueType}</Pill>,
              },
              {
                key: "ben",
                header: "Beneficiary",
                cell: (r) => <Pill tone="primary">{r.beneficiaryLevel}</Pill>,
              },
              {
                key: "org",
                header: "Chapter / State",
                cell: (r) => r.chapterId?.name || r.chapter || r.state || "—",
              },
              {
                key: "amt",
                header: "Allocated",
                cell: (r) => (
                  <span className="font-bold">{inr(r.allocatedAmount)}</span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <Pill tone={STATUS_TONE[r.status] || "neutral"}>
                    {r.status}
                  </Pill>
                ),
              },
            ]}
          />
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} entries)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPrevPage}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ledger Entry Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <Row
                label="Source Payment"
                value={String(selected.sourcePaymentId)}
              />
              <Row label="Revenue Type" value={selected.revenueType} />
              <Row label="Beneficiary" value={selected.beneficiaryLevel} />
              <Row
                label="Chapter / State"
                value={
                  selected.chapterId?.name ||
                  selected.chapter ||
                  selected.state ||
                  "—"
                }
              />
              <Row label="Gross Amount" value={inr(selected.grossAmount)} />
              <Row label="GST" value={inr(selected.gstAmount)} />
              <Row label="Eligible Base" value={inr(selected.eligibleBase)} />
              <Row
                label="Calculation Basis"
                value={selected.calculationBasis}
              />
              <Row label="Rule Version" value={`v${selected.ruleVersion}`} />
              <Row label="Percentage" value={`${selected.percentage}%`} />
              <Row
                label="Allocated Amount"
                value={inr(selected.allocatedAmount)}
              />
              <Row
                label="Status"
                value={
                  <Pill tone={STATUS_TONE[selected.status] || "neutral"}>
                    {selected.status}
                  </Pill>
                }
              />
              <Row
                label="Accounting Period"
                value={selected.accountingPeriod}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Claims
// ─────────────────────────────────────────────────────────────────────────────
function ClaimsTab({ isCentralAdmin, canClaim }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({
    amount: "",
    method: "Bank Transfer",
    referenceNumber: "",
    notes: "",
  });
  const [newClaim, setNewClaim] = useState({
    claimedAmount: "",
    periodFrom: "",
    periodTo: "",
    notes: "",
  });
  const [balance, setBalance] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await revenueShareApi.listClaims(
        statusFilter === "all" ? {} : { status: statusFilter },
      );
      setClaims(res.data || []);
    } catch (e) {
      toast.error(e?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await revenueShareApi.createClaim({
        claimedAmount: Number(newClaim.claimedAmount),
        periodFrom: newClaim.periodFrom,
        periodTo: newClaim.periodTo,
        notes: newClaim.notes,
      });
      toast.success("Claim created as draft");
      setCreateOpen(false);
      setNewClaim({
        claimedAmount: "",
        periodFrom: "",
        periodTo: "",
        notes: "",
      });
      load();
    } catch (e) {
      toast.error(e?.message || "Failed to create claim");
    }
  };

  const act = async (fn, successMsg) => {
    try {
      await fn();
      toast.success(successMsg);
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e?.message || "Action failed");
    }
  };

  const handleSettle = async () => {
    try {
      await revenueShareApi.recordSettlement(selected._id, {
        amount: Number(settleForm.amount),
        method: settleForm.method,
        referenceNumber: settleForm.referenceNumber,
        notes: settleForm.notes,
        idempotencyKey: `${selected._id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
      toast.success("Settlement recorded");
      setSettleOpen(false);
      setSettleForm({
        amount: "",
        method: "Bank Transfer",
        referenceNumber: "",
        notes: "",
      });
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e?.message || "Failed to record settlement");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {[
              "draft",
              "submitted",
              "under_review",
              "approved",
              "rejected",
              "partially_paid",
              "paid",
              "cancelled",
            ].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canClaim && (
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Claim
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading claims…
        </div>
      ) : claims.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No claims"
          description="No claims match this filter yet."
        />
      ) : (
        <ResponsiveTable
          rows={claims}
          onRowClick={(r) => setSelected(r)}
          columns={[
            { key: "num", header: "Claim #", cell: (r) => r.claimNumber },
            {
              key: "ben",
              header: "Beneficiary",
              cell: (r) =>
                `${r.beneficiaryLevel}: ${r.chapterId?.name || r.state || "—"}`,
            },
            {
              key: "amt",
              header: "Claimed",
              cell: (r) => inr(r.claimedAmount),
            },
            {
              key: "status",
              header: "Status",
              cell: (r) => (
                <Pill tone={STATUS_TONE[r.status] || "neutral"}>
                  {r.status}
                </Pill>
              ),
            },
            {
              key: "date",
              header: "Created",
              cell: (r) => new Date(r.createdAt).toLocaleDateString("en-IN"),
            },
          ]}
        />
      )}

      {/* Create claim */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a Revenue Share Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Claimed amount (₹)</Label>
              <Input
                type="number"
                value={newClaim.claimedAmount}
                onChange={(e) =>
                  setNewClaim((p) => ({ ...p, claimedAmount: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Period from</Label>
                <Input
                  type="date"
                  value={newClaim.periodFrom}
                  onChange={(e) =>
                    setNewClaim((p) => ({ ...p, periodFrom: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Period to</Label>
                <Input
                  type="date"
                  value={newClaim.periodTo}
                  onChange={(e) =>
                    setNewClaim((p) => ({ ...p, periodTo: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={newClaim.notes}
                onChange={(e) =>
                  setNewClaim((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim detail / actions */}
      <Dialog
        open={Boolean(selected) && !rejectOpen && !settleOpen}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.claimNumber}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <Row
                label="Beneficiary"
                value={`${selected.beneficiaryLevel}: ${selected.chapterId?.name || selected.state || "—"}`}
              />
              <Row label="Claimed Amount" value={inr(selected.claimedAmount)} />
              <Row
                label="Status"
                value={
                  <Pill tone={STATUS_TONE[selected.status] || "neutral"}>
                    {selected.status}
                  </Pill>
                }
              />
              <Row
                label="Period"
                value={`${selected.periodFrom || "—"} to ${selected.periodTo || "—"}`}
              />
              {selected.notes && <Row label="Notes" value={selected.notes} />}
              {selected.rejectionReason && (
                <Row
                  label="Rejection Reason"
                  value={selected.rejectionReason}
                />
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {selected.status === "draft" && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      act(
                        () => revenueShareApi.submitClaim(selected._id),
                        "Claim submitted",
                      )
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Submit
                  </Button>
                )}
                {isCentralAdmin && selected.status === "submitted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      act(
                        () => revenueShareApi.reviewClaim(selected._id),
                        "Marked under review",
                      )
                    }
                  >
                    <Clock className="h-3.5 w-3.5" /> Mark Under Review
                  </Button>
                )}
                {isCentralAdmin &&
                  ["submitted", "under_review"].includes(selected.status) && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          act(
                            () => revenueShareApi.approveClaim(selected._id),
                            "Claim approved",
                          )
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => setRejectOpen(true)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                {isCentralAdmin &&
                  ["approved", "partially_paid"].includes(selected.status) && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSettleOpen(true)}
                    >
                      <Wallet className="h-3.5 w-3.5" /> Record Settlement
                    </Button>
                  )}
                {!["paid", "cancelled"].includes(selected.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      act(
                        () => revenueShareApi.cancelClaim(selected._id),
                        "Claim cancelled",
                      )
                    }
                  >
                    Cancel Claim
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject reason */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim — reason required</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Why is this claim being rejected?"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() =>
                act(
                  () => revenueShareApi.rejectClaim(selected._id, rejectReason),
                  "Claim rejected",
                ).then(() => {
                  setRejectOpen(false);
                  setRejectReason("");
                })
              }
            >
              Reject Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record settlement */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Settlement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={settleForm.amount}
                onChange={(e) =>
                  setSettleForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Claimed: {inr(selected?.claimedAmount)}. Partial settlements are
                allowed.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Method</Label>
              <Select
                value={settleForm.method}
                onValueChange={(v) =>
                  setSettleForm((p) => ({ ...p, method: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Reference Number</Label>
              <Input
                value={settleForm.referenceNumber}
                onChange={(e) =>
                  setSettleForm((p) => ({
                    ...p,
                    referenceNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={settleForm.notes}
                onChange={(e) =>
                  setSettleForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSettleOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!settleForm.amount} onClick={handleSettle}>
              Record Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules — Central Admin only
// ─────────────────────────────────────────────────────────────────────────────
function RulesTab() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    revenueType: "membership",
    effectiveFrom: "",
    notes: "",
    allocations: [
      { beneficiaryLevel: "chapter", percentage: 50 },
      { beneficiaryLevel: "state", percentage: 25 },
      { beneficiaryLevel: "central", percentage: 25 },
    ],
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await revenueShareApi.listRules("all");
      setRules(res.data || []);
    } catch (e) {
      toast.error(e?.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = form.allocations.reduce(
    (s, a) => s + (Number(a.percentage) || 0),
    0,
  );

  const handleCreate = async () => {
    try {
      await revenueShareApi.createRuleVersion(form);
      toast.success("New rule version published");
      setCreateOpen(false);
      load();
    } catch (e) {
      toast.error(e?.message || "Failed to publish rule");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground max-w-xl">
          Rule changes apply only from their effective date onward — past
          allocations keep using whichever version was active when they were
          calculated.
        </p>
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Rule Version
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading rules…
        </div>
      ) : (
        <ResponsiveTable
          rows={rules}
          columns={[
            {
              key: "type",
              header: "Type",
              cell: (r) => <Pill tone="neutral">{r.revenueType}</Pill>,
            },
            { key: "ver", header: "Version", cell: (r) => `v${r.version}` },
            {
              key: "alloc",
              header: "Allocations",
              cell: (r) =>
                r.allocations
                  .map((a) => `${a.beneficiaryLevel} ${a.percentage}%`)
                  .join(" / "),
            },
            {
              key: "from",
              header: "Effective From",
              cell: (r) =>
                new Date(r.effectiveFrom).toLocaleDateString("en-IN"),
            },
            {
              key: "to",
              header: "Effective To",
              cell: (r) =>
                r.effectiveTo
                  ? new Date(r.effectiveTo).toLocaleDateString("en-IN")
                  : "Open-ended",
            },
          ]}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish New Rule Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Revenue type</Label>
              <Select
                value={form.revenueType}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    revenueType: v,
                    allocations:
                      v === "membership"
                        ? [
                            { beneficiaryLevel: "chapter", percentage: 50 },
                            { beneficiaryLevel: "state", percentage: 25 },
                            { beneficiaryLevel: "central", percentage: 25 },
                          ]
                        : [{ beneficiaryLevel: "organizer", percentage: 100 }],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Effective from</Label>
              <Input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) =>
                  setForm((p) => ({ ...p, effectiveFrom: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Allocations</Label>
              {form.allocations.map((a, idx) => (
                <div
                  key={a.beneficiaryLevel}
                  className="flex items-center gap-2"
                >
                  <span className="w-24 text-sm capitalize">
                    {a.beneficiaryLevel}
                  </span>
                  <Input
                    type="number"
                    value={a.percentage}
                    onChange={(e) => {
                      const next = [...form.allocations];
                      next[idx] = {
                        ...next[idx],
                        percentage: Number(e.target.value),
                      };
                      setForm((p) => ({ ...p, allocations: next }));
                    }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ))}
              <p
                className={`text-xs ${total === 100 ? "text-emerald-600" : "text-destructive"}`}
              >
                Total: {total}% {total !== 100 && "(must equal 100%)"}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={total !== 100 || !form.effectiveFrom}
              onClick={handleCreate}
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RevenueSharing;
