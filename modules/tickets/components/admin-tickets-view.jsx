"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import {
  LifeBuoy,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  FileText,
  Paperclip,
  Send,
  Building2,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  User,
  Shield,
  Loader2,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ticketApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useAuth } from "@shared/providers/auth-provider";
import Link from "next/link";

const ESCALATION_REASONS_CHAPTER = [
  "Requires State Authority / Permission",
  "Cross-Chapter Policy Matter",
  "Technical / Platform Inconsistency",
  "Unresolved after Chapter Review",
  "Other",
];

const ESCALATION_REASONS_STATE = [
  "Central Chamber Policy Decision Needed",
  "Database / Platform / Core Bug",
  "Financial / Bank Gateway Reversal",
  "State-Level Unresolved",
  "Other",
];

export function AdminTicketsView({ role = "chapter_admin" }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, escalated: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Resolve dialog state
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  // Escalate dialog state
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [escalating, setEscalating] = useState(false);

  // Full-size photo preview lightbox
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  const isChapterAdmin = role === "chapter_admin";
  const isStateAdmin = role === "state_admin";
  const isCentralAdmin = role === "central_admin" || role === "admin" || role === "super_admin";

  const title = isChapterAdmin
    ? "Chapter Support Tickets"
    : isStateAdmin
    ? "State Support Tickets"
    : "Central Support Tickets";

  const subtitle = isChapterAdmin
    ? "Support tickets from registered businesses in your chapter"
    : isStateAdmin
    ? "Escalated and state-wide tickets for your state"
    : "Universal support ticket queue and central chamber oversight";

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (levelFilter !== "all") params.currentLevel = levelFilter;

      const res = await ticketApi.list(params);
      if (res && res.data) {
        setTickets(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, levelFilter]);

  const openTicketDetail = async (ticket) => {
    try {
      const res = await ticketApi.getById(ticket._id);
      setSelectedTicket(res.data);
    } catch (e) {
      setSelectedTicket(ticket);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await ticketApi.addMessage(selectedTicket._id, { message: replyText.trim() });
      toast.success("Reply posted to ticket conversation");
      setReplyText("");
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to post reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim() || !selectedTicket) {
      return toast.error("Please provide a resolution summary note.");
    }

    setResolving(true);
    try {
      const res = await ticketApi.resolve(selectedTicket._id, { resolutionNote: resolutionNote.trim() });
      toast.success(`Ticket ${selectedTicket.ticketNumber} marked as resolved!`);
      setResolveOpen(false);
      setResolutionNote("");
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const handleEscalateTicket = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim() || !handoverNote.trim() || !selectedTicket) {
      return toast.error("Please provide an escalation reason and handover note.");
    }

    setEscalating(true);
    try {
      const res = await ticketApi.escalate(selectedTicket._id, {
        reason: escalateReason.trim(),
        handoverNote: handoverNote.trim(),
      });
      toast.success(res.message || "Ticket successfully escalated!");
      setEscalateOpen(false);
      setEscalateReason("");
      setHandoverNote("");
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to escalate ticket");
    } finally {
      setEscalating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">Open</span>;
      case "In_Progress":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">In Progress</span>;
      case "Escalated_To_State":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">Escalated to State</span>;
      case "Escalated_To_Central":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">Escalated to Central</span>;
      case "Resolved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Resolved</span>;
      case "Closed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">Closed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "Urgent":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/15 text-red-600 border border-red-500/30">Urgent</span>;
      case "High":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">High</span>;
      case "Medium":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-600 border border-blue-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/15 text-slate-600 border border-slate-500/30">Low</span>;
    }
  };

  const getLevelBadge = (level) => {
    if (level === "CENTRAL") {
      return <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Central Admin</span>;
    }
    if (level === "STATE") {
      return <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">State Admin</span>;
    }
    return <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Chapter Admin</span>;
  };

  return (
    <AppShell role={role} title={title} subtitle={subtitle}>
      <div className="space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Assigned</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.total || tickets.length}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Open</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.open || 0}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">In Progress</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.inProgress || 0}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Escalated</span>
              <ArrowUpRight className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.escalated || 0}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.resolved || 0}</div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket #, business, or subject..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In_Progress">In Progress</option>
              <option value="Escalated_To_State">Escalated to State</option>
              <option value="Escalated_To_Central">Escalated to Central</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            {!isChapterAdmin && (
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="h-9 px-3 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Levels</option>
                <option value="CHAPTER">Chapter Level</option>
                <option value="STATE">State Level</option>
                <option value="CENTRAL">Central Level</option>
              </select>
            )}
          </div>
        </div>

        {/* Tickets List Panel */}
        <Panel className="p-0 overflow-hidden border border-border">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading support tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <LifeBuoy className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <div className="text-sm font-semibold text-foreground">No support tickets found</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                All business enquiries and assistance requests in this queue have been resolved or none are pending.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Business Enterprise</th>
                    <th className="p-3">Category & Subject</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Current Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">
                        {t.ticketNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{t.businessName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{t.chapter}, {t.state}</span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-foreground truncate">{t.subject}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-muted font-medium">{t.category}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="p-3">
                        {getLevelBadge(t.currentLevel)}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => openTicketDetail(t)}
                        >
                          Manage Ticket
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Admin Ticket Detail & Action Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            {selectedTicket && (
              <>
                <DialogHeader className="p-4 border-b bg-muted/20 flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{selectedTicket.ticketNumber}</span>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                    <DialogTitle className="text-base font-bold text-foreground mt-1">
                      {selectedTicket.subject}
                    </DialogTitle>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>Category: <strong>{selectedTicket.category}</strong></span>
                      <span>•</span>
                      <span>Current Level: {getLevelBadge(selectedTicket.currentLevel)}</span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* BUSINESS PROFILE SUMMARY CARD (As specifically requested by user) */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-background space-y-3">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Business Profile Record
                        </span>
                      </div>
                      {(selectedTicket.business?._id || selectedTicket.business) && (
                        <Link
                          href={
                            isChapterAdmin
                              ? `/chapter-admin/businesses/${selectedTicket.business?._id || selectedTicket.business}`
                              : isStateAdmin
                              ? `/state-admin/businesses/${selectedTicket.business?._id || selectedTicket.business}`
                              : `/admin/businesses/${selectedTicket.business?._id || selectedTicket.business}`
                          }
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          View Full Profile <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground text-[11px]">Business Name</div>
                        <div className="font-bold text-foreground">{selectedTicket.businessName}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">Tier: {selectedTicket.membershipTier || "Free Member"}</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-[11px]">Contact Person</div>
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{selectedTicket.contactPerson || "Not provided"}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-[11px]">Location & Chapter</div>
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{selectedTicket.chapter}, {selectedTicket.state}</span>
                        </div>
                      </div>

                      {selectedTicket.contactPhone && (
                        <div>
                          <div className="text-muted-foreground text-[11px]">Phone / Mobile</div>
                          <a
                            href={`tel:${selectedTicket.contactPhone}`}
                            className="font-mono font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" /> {selectedTicket.contactPhone}
                          </a>
                        </div>
                      )}

                      {selectedTicket.contactEmail && (
                        <div className="sm:col-span-2">
                          <div className="text-muted-foreground text-[11px]">Email Address</div>
                          <a
                            href={`mailto:${selectedTicket.contactEmail}`}
                            className="font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" /> {selectedTicket.contactEmail}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Escalation Trail if exists */}
                  {selectedTicket.escalations && selectedTicket.escalations.length > 0 && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5 text-purple-900 dark:text-purple-300">
                      <div className="font-bold flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                        <ArrowUpRight className="h-4 w-4" /> Escalation History ({selectedTicket.escalations.length})
                      </div>
                      {selectedTicket.escalations.map((esc, eIdx) => (
                        <div key={eIdx} className="pl-3 border-l-2 border-purple-400/50 py-0.5 space-y-0.5">
                          <div className="font-semibold text-[11px]">
                            Level: {esc.fromLevel} ➔ {esc.toLevel} by {esc.escalatedByName || "Admin"} on {new Date(esc.escalatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px]">Reason: <em>{esc.reason}</em></div>
                          <div className="text-[11px] opacity-90">Handover Note: {esc.handoverNote}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resolution Banner if resolved */}
                  {selectedTicket.resolution && selectedTicket.resolution.resolutionNote && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1 text-emerald-950 dark:text-emerald-300">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Issue Marked as Resolved
                      </div>
                      <div className="text-[11px] font-medium mt-1">
                        Resolution Verdict: {selectedTicket.resolution.resolutionNote}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Resolved by {selectedTicket.resolution.resolvedByName || "Chamber Admin"} on{" "}
                        {new Date(selectedTicket.resolution.resolvedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Attached Photos Overview */}
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                      <div className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4 text-primary" /> Attached Supporting Photo(s) ({selectedTicket.attachments.length})
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">Click photo to enlarge</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedTicket.attachments.map((att, aIdx) => {
                          const resolvedUrl = resolveMediaUrl(att);
                          return (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => setPreviewPhotoUrl(resolvedUrl)}
                              className="group relative overflow-hidden rounded-lg border border-border/80 hover:border-primary transition-all bg-background shadow-xs hover:shadow-md text-left"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={resolvedUrl}
                                alt={`Ticket Photo ${aIdx + 1}`}
                                className="h-24 w-32 object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.retried) {
                                    e.currentTarget.dataset.retried = "1";
                                    e.currentTarget.src = att.startsWith("http")
                                      ? att
                                      : `http://127.0.0.1:5000${att.startsWith("/") ? att : `/${att}`}`;
                                  }
                                }}
                              />
                              <div className="px-2 py-1 text-[10px] font-semibold text-center truncate max-w-[128px] bg-muted/90 flex items-center justify-center gap-1 text-foreground">
                                <ExternalLink className="h-2.5 w-2.5" /> Enlarge Photo
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Conversation Feed */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Conversation Thread ({selectedTicket.messages?.length || 0})
                    </div>

                    <div className="space-y-2.5">
                      {selectedTicket.messages?.map((msg, idx) => {
                        const isBiz = msg.senderRole === "business";
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs max-w-[85%] ${
                              isBiz
                                ? "mr-auto bg-muted/60 text-foreground border-border rounded-bl-xs"
                                : "ml-auto bg-primary text-primary-foreground border-primary/20 rounded-br-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-80">
                              <span className="font-bold">{msg.senderName} ({msg.senderRole?.replace("_", " ")})</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                            {/* Render attachments in message only if not already displayed in the top photo card */}
                            {(() => {
                              const extraAttachments =
                                msg.attachments?.filter(
                                  (att) => !selectedTicket.attachments?.includes(att)
                                ) || [];
                              if (extraAttachments.length === 0) return null;
                              return (
                                <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/20 flex flex-wrap gap-2">
                                  {extraAttachments.map((att, aIdx) => {
                                    const resolvedUrl = resolveMediaUrl(att);
                                    const isImg =
                                      typeof att === "string" &&
                                      (/\.(jpg|jpeg|png|webp|gif)$/i.test(att) ||
                                        att.includes("/files/") ||
                                        att.includes("cloudinary"));
                                    return isImg ? (
                                      <button
                                        key={aIdx}
                                        type="button"
                                        onClick={() => setPreviewPhotoUrl(resolvedUrl)}
                                        className="block group overflow-hidden rounded-lg border border-border/80 hover:border-primary transition-all bg-background/80 shadow-xs text-left"
                                        title="Click to view full photo"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={resolvedUrl}
                                          alt={`Attached Photo ${aIdx + 1}`}
                                          className="h-24 w-28 object-cover group-hover:scale-105 transition-transform"
                                          onError={(e) => {
                                            if (!e.currentTarget.dataset.retried) {
                                              e.currentTarget.dataset.retried = "1";
                                              e.currentTarget.src = att.startsWith("http")
                                                ? att
                                                : `http://127.0.0.1:5000${att.startsWith("/") ? att : `/${att}`}`;
                                            }
                                          }}
                                        />
                                        <div className="px-1.5 py-0.5 text-[9px] font-semibold text-center truncate max-w-[112px] bg-muted/90 text-foreground flex items-center justify-center gap-1">
                                          <ExternalLink className="h-2.5 w-2.5" /> View Photo
                                        </div>
                                      </button>
                                    ) : (
                                      <a
                                        key={aIdx}
                                        href={resolvedUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 text-[10px] underline"
                                      >
                                        <Paperclip className="h-3 w-3" /> View Attachment {aIdx + 1}
                                      </a>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-3 border-t bg-background space-y-2">
                  {/* Reply Input Form */}
                  {selectedTicket.status !== "Closed" && (
                    <form onSubmit={handleSendReply} className="flex items-center gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Post response or update to business..."
                        className="h-9 text-xs flex-1"
                      />
                      <Button type="submit" size="sm" disabled={sendingReply || !replyText.trim()} className="gap-1 font-semibold h-9 px-4">
                        {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Reply
                      </Button>
                    </form>
                  )}

                  {/* Resolution and Escalation Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Status: <strong>{selectedTicket.status.replace("_", " ")}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Resolve Action */}
                      {selectedTicket.status !== "Resolved" && selectedTicket.status !== "Closed" && (
                        <Button
                          size="sm"
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          onClick={() => setResolveOpen(true)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve Ticket
                        </Button>
                      )}

                      {/* Escalate Action (Chapter Admin can escalate to State; State Admin can escalate to Central) */}
                      {((isChapterAdmin && selectedTicket.currentLevel === "CHAPTER") ||
                        (isStateAdmin && selectedTicket.currentLevel === "STATE")) &&
                        selectedTicket.status !== "Resolved" &&
                        selectedTicket.status !== "Closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 gap-1"
                            onClick={() => setEscalateOpen(true)}
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            {isChapterAdmin ? "Escalate to State Admin" : "Escalate to Central Admin"}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Resolve Ticket Modal */}
        <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Resolve Support Ticket
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide a clear resolution summary for <strong>{selectedTicket?.businessName}</strong> explaining how the issue was fixed.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResolveTicket} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Resolution Note / Actions Taken *</label>
                <Textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Verified membership payment transaction with bank gateway and activated Gold plan immediately."
                  className="text-xs min-h-[90px]"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setResolveOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={resolving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1">
                  {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Confirm Resolution
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Escalate Ticket Modal */}
        <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
                {isChapterAdmin ? "Escalate to State Admin" : "Escalate to Central Admin"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Transfer responsibility of this ticket to {isChapterAdmin ? "State" : "Central"} Administration with a handover briefing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEscalateTicket} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Escalation Reason *</label>
                <select
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select reason...</option>
                  {(isChapterAdmin ? ESCALATION_REASONS_CHAPTER : ESCALATION_REASONS_STATE).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Handover Context Note *</label>
                <Textarea
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="Explain what steps you tried and why higher authority action is needed..."
                  className="text-xs min-h-[90px]"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setEscalateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={escalating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1">
                  {escalating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  Confirm Escalation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Full Photo Lightbox Dialog */}
        <Dialog open={!!previewPhotoUrl} onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}>
          <DialogContent className="max-w-3xl p-3 bg-background border border-border">
            <DialogHeader className="p-1 flex flex-row items-center justify-between">
              <DialogTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" /> Ticket Photo Attachment
              </DialogTitle>
              {previewPhotoUrl && (
                <a
                  href={previewPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open in New Tab <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogHeader>
            {previewPhotoUrl && (
              <div className="relative max-h-[75vh] overflow-auto flex items-center justify-center p-2 bg-black/5 dark:bg-black/40 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhotoUrl}
                  alt="Full preview"
                  className="max-h-[70vh] w-auto max-w-full rounded object-contain shadow-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default AdminTicketsView;
