"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Ticket,
  MessageSquareText,
  CreditCard,
  Mic,
  User,
  CheckCircle2,
  Loader2,
  CalendarDays,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { userApi, eventApi, followupApi } from "@shared/lib/api-services";

const ROLE_META = {
  entranceIncharge: { label: "Gate Incharge", icon: Ticket },
  followupCoordinator: { label: "Follow-up Coordinator", icon: MessageSquareText },
  treasurer: { label: "Treasurer", icon: CreditCard },
  guestManager: { label: "Guest & Speaker Manager", icon: Mic },
  eventCoordinator: { label: "Event Coordinator", icon: User },
};

export function MyDuty() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [duty, setDuty] = useState(null);
  const [loadingDuty, setLoadingDuty] = useState(false);
  const [financeForm, setFinanceForm] = useState({ desc: "", amount: "", from: "" });
  const [submittingFinance, setSubmittingFinance] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getMyEventAssignments();
        const list = res?.data || [];
        setAssignments(list);
        if (list.length > 0) setSelectedEventId(list[0].eventId);
      } catch (err) {
        toast.error("Failed to load your event duties.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    (async () => {
      try {
        setLoadingDuty(true);
        const res = await eventApi.getMyDuty(selectedEventId);
        setDuty(res?.data || null);
      } catch (err) {
        toast.error("Failed to load duty details.");
      } finally {
        setLoadingDuty(false);
      }
    })();
  }, [selectedEventId]);

  const refetchDuty = async () => {
    if (!selectedEventId) return;
    const res = await eventApi.getMyDuty(selectedEventId);
    setDuty(res?.data || null);
  };

  const handleToggleCheckin = async (attendeeId, isCheckedIn) => {
    try {
      await eventApi.checkinAttendee(selectedEventId, attendeeId, isCheckedIn ? "Pending" : "Present");
      toast.success(isCheckedIn ? "Check-in reversed" : "Checked in!");
      refetchDuty();
    } catch (err) {
      toast.error("Failed to update check-in: " + (err.message || "Unknown error"));
    }
  };

  const handleUpdateFollowupStatus = async (id, status) => {
    try {
      await followupApi.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      refetchDuty();
    } catch (err) {
      toast.error("Failed to update follow-up: " + (err.message || "Unknown error"));
    }
  };

  const handleAddFinance = async () => {
    if (!financeForm.desc.trim() || !financeForm.amount) {
      toast.error("Please fill in description and amount.");
      return;
    }
    try {
      setSubmittingFinance(true);
      await eventApi.addFinanceTransaction(selectedEventId, {
        type: "moneyIn",
        desc: financeForm.desc,
        amount: Number(financeForm.amount),
        from: financeForm.from,
        method: "Cash",
        date: new Date().toISOString().split("T")[0],
      });
      toast.success("Transaction recorded!");
      setFinanceForm({ desc: "", amount: "", from: "" });
      refetchDuty();
    } catch (err) {
      toast.error("Failed to record transaction: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingFinance(false);
    }
  };

  const uniqueEvents = Array.from(
    new Map(assignments.map((a) => [String(a.eventId), a])).values()
  );

  return (
    <AppShell role="business" title="My Event Duty" subtitle="Tasks and access for events you're assigned to">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <ShieldCheck className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-base font-bold text-foreground">No current event duties</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              When a chapter admin assigns you a role (e.g. Gate Incharge, Treasurer) for an event you've registered for, it will appear here.
            </p>
          </div>
        ) : (
          <>
            {uniqueEvents.length > 1 && (
              <div className="max-w-sm">
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueEvents.map((a) => (
                      <SelectItem key={a.eventId} value={a.eventId}>{a.eventTitle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {loadingDuty || !duty ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CalendarDays className="h-4 w-4" /> {duty.date} · {duty.chapter}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{duty.title}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {duty.myRoles.map((r) => {
                      const meta = ROLE_META[r] || { label: r, icon: ShieldCheck };
                      return (
                        <Pill key={r} tone="success" className="gap-1">
                          <meta.icon className="h-3 w-3" /> {meta.label}
                        </Pill>
                      );
                    })}
                  </div>
                </div>

                {duty.myRoles.includes("entranceIncharge") && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <Ticket className="h-4 w-4 text-primary" /> Gate Check-In
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(duty.data.registrations || []).map((r) => {
                        const isCheckedIn = r.attendanceStatus === "Present";
                        return (
                          <div key={r._id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20">
                            <div>
                              <p className="text-sm font-medium">{r.user?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{r.user?.phone || ""}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={isCheckedIn ? "outline" : "default"}
                              onClick={() => handleToggleCheckin(r._id, isCheckedIn)}
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> {isCheckedIn ? "Checked In" : "Check In"}
                            </Button>
                          </div>
                        );
                      })}
                      {(duty.data.registrations || []).length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">No registrations yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {duty.myRoles.includes("followupCoordinator") && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <MessageSquareText className="h-4 w-4 text-primary" /> Follow-up Queue
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(duty.data.followups || []).map((f) => (
                        <div key={f._id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20">
                          <div>
                            <p className="text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.mobile} · {f.status}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => handleUpdateFollowupStatus(f._id, "contacted")}>Contacted</Button>
                            <Button size="sm" onClick={() => handleUpdateFollowupStatus(f._id, "completed")}>Done</Button>
                          </div>
                        </div>
                      ))}
                      {(duty.data.followups || []).length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">No follow-ups assigned yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {duty.myRoles.includes("treasurer") && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-primary" /> Finance
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Collections recorded: ₹{(duty.data.finance?.moneyIn || []).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString("en-IN")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input placeholder="Description" value={financeForm.desc} onChange={(e) => setFinanceForm((p) => ({ ...p, desc: e.target.value }))} />
                      <Input placeholder="Amount (₹)" type="number" value={financeForm.amount} onChange={(e) => setFinanceForm((p) => ({ ...p, amount: e.target.value }))} />
                      <Input placeholder="From (name)" value={financeForm.from} onChange={(e) => setFinanceForm((p) => ({ ...p, from: e.target.value }))} />
                    </div>
                    <Button size="sm" className="mt-2 gap-1.5" onClick={handleAddFinance} disabled={submittingFinance}>
                      {submittingFinance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />} Record Collection
                    </Button>
                  </div>
                )}

                {duty.myRoles.includes("guestManager") && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <Mic className="h-4 w-4 text-primary" /> Speakers & Guests
                    </h3>
                    <div className="space-y-2">
                      {(duty.data.speakers || []).map((s) => (
                        <div key={s.id || s.name} className="px-3 py-2 rounded-lg border border-border bg-muted/20">
                          <p className="text-sm font-medium">{s.name} <span className="text-xs text-muted-foreground">({s.type})</span></p>
                          <p className="text-xs text-muted-foreground">{s.organization} {s.mobile ? `· ${s.mobile}` : ""}</p>
                        </div>
                      ))}
                      {(duty.data.speakers || []).length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">No speakers added yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {duty.myRoles.includes("eventCoordinator") && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-primary" /> Event Snapshot
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {duty.data.kpi?.registeredCount || 0} registered of {duty.data.kpi?.seats || 0} seats
                    </p>
                    <div className="space-y-1.5">
                      {(duty.data.agenda || []).map((a, idx) => (
                        <div key={a.id || idx} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-muted/20">
                          <span>{a.title}</span>
                          <span className="text-xs text-muted-foreground">{a.speaker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
