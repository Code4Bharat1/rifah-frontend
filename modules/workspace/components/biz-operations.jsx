"use client";

// Operations Centre — business-owner side. A member only ever sees the panels for the
// roles their chapter admin assigned them on an event, and those panels only become
// actionable once the admin takes the event live.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Award,
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  FileText,
  Images,
  Loader2,
  LogOut,
  Megaphone,
  MessageSquareText,
  Mic,
  Mic2,
  Monitor,
  Radio,
  ShieldCheck,
  Ticket,
  User,
  XCircle,
} from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EventGallery } from "@shared/components/rifah/event-gallery";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { userApi, eventApi, followupApi } from "@shared/lib/api-services";

// Roles that unlock a working tool panel.
const FUNCTIONAL_ROLE_META = {
  entranceIncharge: { label: "Gate Incharge", icon: Ticket },
  followupCoordinator: { label: "Follow-up Coordinator", icon: MessageSquareText },
  treasurer: { label: "Treasurer", icon: CreditCard },
  guestManager: { label: "Guest & Speaker Manager", icon: Mic },
  eventCoordinator: { label: "Event Coordinator", icon: User },
  photosVideo: { label: "Media Team", icon: Camera },
};

// Ceremonial roles — no tools, but the member is told they are presenting.
const STAGE_ROLE_META = {
  chapterAdmin: { label: "Chapter Admin", icon: ShieldCheck, verb: "leading" },
  tilawatEquran: { label: "Tilawat-e-Quran", icon: FileText, verb: "presenting" },
  presidentWelcome: { label: "Welcome Address (President)", icon: Monitor, verb: "delivering" },
  secretaryIntro: { label: "Team Introduction (Secretary)", icon: User, verb: "delivering" },
  keynote1: { label: "Keynote Address 1", icon: Mic2, verb: "delivering" },
  keynote2: { label: "Keynote Address 2", icon: Mic2, verb: "delivering" },
  heroOfEvent: { label: "Hero of the Event", icon: Award, verb: "presenting" },
  best60SecPitch: { label: "Best 60 Second Pitch", icon: Megaphone, verb: "presenting" },
  closingRemarks: { label: "Closing Remarks", icon: CheckCircle2, verb: "delivering" },
  voteOfThanks: { label: "Vote of Thanks", icon: MessageSquareText, verb: "delivering" },
  eventEnd: { label: "Event End / Farewell", icon: LogOut, verb: "delivering" },
};

const roleMeta = (key) =>
  FUNCTIONAL_ROLE_META[key] || STAGE_ROLE_META[key] || { label: key, icon: ShieldCheck };

function LockedNotice({ status, stageStatus }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
      <Radio className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-foreground">Waiting for the event to go live</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your duties unlock the moment your admin takes this event live from the Operations Centre.
          Until then everything below is read-only.
          <span className="block mt-1 opacity-75">
            Event status: {status} · Stage: {stageStatus || "IDLE"}
          </span>
        </p>
      </div>
    </div>
  );
}

function MyDutyPanel() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [duty, setDuty] = useState(null);
  const [loadingDuty, setLoadingDuty] = useState(false);
  const [financeForm, setFinanceForm] = useState({ desc: "", amount: "", from: "" });
  const [submittingFinance, setSubmittingFinance] = useState(false);
  const [busyGateId, setBusyGateId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getMyEventAssignments();
        const list = res?.data || [];
        setAssignments(list);
        if (list.length > 0) {
          // Default to an event that is actually live, if there is one.
          const live = list.find((a) => a.isLive);
          setSelectedEventId(String((live || list[0]).eventId));
        }
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

  const canAct = Boolean(duty?.canAct);

  const handleGate = async (attendeeId, gateStatus) => {
    try {
      setBusyGateId(attendeeId);
      await eventApi.setGateStatus(selectedEventId, attendeeId, gateStatus);
      toast.success(gateStatus === "approved" ? "Entry approved" : "Entry rejected");
      await refetchDuty();
    } catch (err) {
      toast.error(err?.message || "Failed to update the gate.");
    } finally {
      setBusyGateId(null);
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

  const uniqueEvents = Array.from(new Map(assignments.map((a) => [String(a.eventId), a])).values());

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
        <ShieldCheck className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
        <h3 className="text-base font-bold text-foreground">No current event duties</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          When your chapter admin assigns you a role — Gate Incharge, Treasurer, Media Team or a stage
          slot such as Tilawat-e-Quran — it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uniqueEvents.length > 1 && (
        <div className="max-w-md">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger id="duty-event"><SelectValue /></SelectTrigger>
            <SelectContent>
              {uniqueEvents.map((a) => (
                <SelectItem key={a.eventId} value={String(a.eventId)}>
                  {a.eventTitle} {a.isLive ? "· LIVE" : ""}
                </SelectItem>
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarDays className="h-4 w-4" /> {duty.date} · {duty.chapter}
                </div>
                <h2 className="text-lg font-bold text-foreground">{duty.title}</h2>
              </div>
              {duty.isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {duty.stageStatus || "IDLE"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {duty.myRoles.map((r) => {
                const meta = roleMeta(r);
                return (
                  <Pill key={r} tone="success" className="gap-1">
                    <meta.icon className="h-3 w-3" /> {meta.label}
                  </Pill>
                );
              })}
            </div>
          </div>

          {!duty.isLive && <LockedNotice status={duty.status} stageStatus={duty.stageStatus} />}

          {/* Ceremonial stage roles — a heads-up, not a tool. */}
          {(duty.myStageRoles || []).length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Mic2 className="h-4 w-4 text-primary" /> Your stage slot
              </h3>
              <div className="space-y-2">
                {duty.myStageRoles.map((r) => {
                  const meta = STAGE_ROLE_META[r] || { label: r, icon: ShieldCheck, verb: "presenting" };
                  return (
                    <div key={r} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
                      <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          You are {meta.verb} <span className="text-primary">{meta.label}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          at {duty.title} · {duty.date}
                          {duty.venue ? ` · ${duty.venue}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {duty.myRoles.includes("entranceIncharge") && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Ticket className="h-4 w-4 text-primary" /> Gate Entry Approvals
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(duty.data.registrations || []).map((r) => {
                  const state = r.gateStatus || "waiting";
                  const busy = busyGateId === r._id;
                  return (
                    <div key={r._id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-muted/20">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.user?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.user?.businessName || r.user?.phone || ""}
                        </p>
                      </div>
                      {state === "waiting" ? (
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            className="gap-1.5"
                            disabled={!canAct || busy}
                            onClick={() => handleGate(r._id, "approved")}
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={!canAct || busy}
                            onClick={() => handleGate(r._id, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <Pill tone={state === "approved" ? "success" : "danger"}>
                            {state === "approved" ? "Approved" : "Rejected"}
                          </Pill>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!canAct || busy}
                            onClick={() => handleGate(r._id, "waiting")}
                          >
                            Undo
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(duty.data.registrations || []).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No registrations yet.</p>
                )}
              </div>
            </div>
          )}

          {duty.myRoles.includes("photosVideo") && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-primary" /> Media Team
              </h3>
              <p className="text-xs text-muted-foreground">
                You can post photos and videos to this event&apos;s gallery folder — open the{" "}
                <strong className="text-foreground">Gallery</strong> tab above and pick{" "}
                <strong className="text-foreground">{duty.title}</strong>.
                {typeof duty.data.mediaCount === "number" && (
                  <span className="block mt-1">{duty.data.mediaCount} item(s) posted so far.</span>
                )}
              </p>
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
                      <Button size="sm" variant="outline" disabled={!canAct} onClick={() => handleUpdateFollowupStatus(f._id, "contacted")}>Contacted</Button>
                      <Button size="sm" disabled={!canAct} onClick={() => handleUpdateFollowupStatus(f._id, "completed")}>Done</Button>
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
                Collections recorded: ₹
                {(duty.data.finance?.moneyIn || [])
                  .reduce((s, i) => s + (Number(i.amount) || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input id="fin-desc" placeholder="Description" disabled={!canAct} value={financeForm.desc} onChange={(e) => setFinanceForm((p) => ({ ...p, desc: e.target.value }))} />
                <Input id="fin-amount" placeholder="Amount (₹)" type="number" disabled={!canAct} value={financeForm.amount} onChange={(e) => setFinanceForm((p) => ({ ...p, amount: e.target.value }))} />
                <Input id="fin-from" placeholder="From (name)" disabled={!canAct} value={financeForm.from} onChange={(e) => setFinanceForm((p) => ({ ...p, from: e.target.value }))} />
              </div>
              <Button size="sm" className="mt-2 gap-1.5" onClick={handleAddFinance} disabled={!canAct || submittingFinance}>
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
    </div>
  );
}

export function BizOperations({ initialTab = "my-duty" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <AppShell
      role="business"
      title="Operations Center"
      subtitle="Your event duties and the chamber photo gallery"
    >
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-duty" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> My Duty
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <Images className="h-4 w-4" /> Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-duty">
          <MyDutyPanel />
        </TabsContent>

        <TabsContent value="gallery">
          <EventGallery />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

export default BizOperations;
