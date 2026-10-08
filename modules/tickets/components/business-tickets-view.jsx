"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
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
  Plus,
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
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Loader2,
  Image as ImageIcon,
  Camera,
  X,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { ticketApi, businessApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useAuth } from "@shared/providers/auth-provider";

const PRESET_CATEGORIES = [
  "Payment & Invoicing",
  "Membership & Renewal",
  "Profile & Verification",
  "Events & Passes",
  "Power Networking & Leads",
  "Technical Portal Glitch",
  "General Query",
];

const PRIORITIES = [
  { value: "Low", label: "Low", desc: "Routine query", color: "border-slate-500/30 text-slate-600 bg-slate-500/10" },
  { value: "Medium", label: "Medium", desc: "Normal issue", color: "border-blue-500/30 text-blue-600 bg-blue-500/10" },
  { value: "High", label: "High", desc: "Affects business", color: "border-amber-500/30 text-amber-600 bg-amber-500/10" },
  { value: "Urgent", label: "Urgent", desc: "Critical blocker", color: "border-red-500/30 text-red-600 bg-red-500/10" },
];

export function BusinessTicketsView() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, escalated: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myBusiness, setMyBusiness] = useState(null);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  // Form states
  const fileInputRef = useRef(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file (PNG, JPG, WEBP).");
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Photo size must be less than 10MB.");
    }

    const preview = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);

    try {
      const res = await ticketApi.uploadPhoto(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setUploadedPhotoUrl(url);
        toast.success("Photo uploaded and attached.");
      } else {
        throw new Error("Could not retrieve photo URL from server.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setUploadedPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await ticketApi.list(params);
      if (res && res.data) {
        setTickets(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBusiness = async () => {
    try {
      const res = await businessApi.getMyBusiness();
      const b = res?.data || res;
      if (b && b._id) setMyBusiness(b);
    } catch (e) {
      // Ignore if not loaded
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter]);

  useEffect(() => {
    fetchMyBusiness();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!categoryInput.trim()) {
      return toast.error("Please enter or select an issue category.");
    }
    if (!subject.trim()) {
      return toast.error("Please provide a subject summary for your issue.");
    }
    if (!description.trim() || description.trim().length < 15) {
      return toast.error("Please provide a detailed description (at least 15 characters).");
    }
    if (uploadingPhoto) {
      return toast.error("Please wait until the photo finishes uploading.");
    }

    setSubmitting(true);
    try {
      let finalPhotoUrl = uploadedPhotoUrl;
      if (photoFile && !finalPhotoUrl) {
        const uploadRes = await ticketApi.uploadPhoto(photoFile);
        finalPhotoUrl = uploadRes?.data?.url || uploadRes?.url;
      }

      const payload = {
        category: categoryInput.trim(),
        priority,
        subject: subject.trim(),
        description: description.trim(),
        referenceId: referenceId.trim() || undefined,
        attachments: finalPhotoUrl ? [finalPhotoUrl] : [],
      };

      const res = await ticketApi.create(payload);
      toast.success(res.message || "Ticket submitted successfully!");
      setCreateOpen(false);

      // Reset form
      setCategoryInput("");
      setPriority("Medium");
      setSubject("");
      setDescription("");
      setReferenceId("");
      handleRemovePhoto();

      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await ticketApi.addMessage(selectedTicket._id, { message: replyText.trim() });
      toast.success("Reply sent successfully");
      setReplyText("");
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const openTicketDetail = async (ticket) => {
    try {
      const res = await ticketApi.getById(ticket._id);
      setSelectedTicket(res.data);
    } catch (e) {
      setSelectedTicket(ticket);
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
    <AppShell
      role="business"
      title="Support Tickets"
      subtitle="Report issues and get direct assistance from your Chapter and Chamber administrators"
    >
      <div className="space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Tickets</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.total || tickets.length}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Open & In Progress</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{(stats.open || 0) + (stats.inProgress || 0)}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Escalated</span>
              <ArrowUpRight className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.escalated || 0}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.resolved || 0}</div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket #, subject, or category..."
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
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Raise New Ticket
          </Button>
        </div>

        {/* Tickets List Panel */}
        <Panel className="p-0 overflow-hidden border border-border">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading your support tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <LifeBuoy className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <div className="text-sm font-semibold text-foreground">No support tickets found</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Need help with payments, profile verification, membership, or portal features? Raise a ticket and your Chapter Admin will assist you immediately.
              </p>
              <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Raise Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Subject & Category</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Assigned Handler</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">
                        {t.ticketNumber}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-foreground truncate">{t.subject}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-muted font-medium">{t.category}</span>
                          {t.referenceId && <span className="font-mono text-[10px]">Ref: {t.referenceId}</span>}
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
                          variant="outline"
                          className="h-7 text-xs font-semibold"
                          onClick={() => openTicketDetail(t)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Raise New Ticket Modal */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <LifeBuoy className="h-5 w-5 text-primary" />
                Raise a Support Ticket
              </DialogTitle>
              <DialogDescription className="text-xs">
                Your ticket will be routed directly to your local Chapter Admin for immediate handling.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
              {/* Routing confirmation badge */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Automatic Chamber Routing:</span> This ticket will be assigned automatically to your registered chapter:{" "}
                  <span className="font-bold underline">{myBusiness?.chapter || user?.chapter || "Chamber Central"}</span> ({myBusiness?.state || user?.state || "State Network"}).
                </div>
              </div>

              {/* Hybrid Category Input (Combobox: select or type custom) */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Issue Category / Department *</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Select or type custom</span>
                </label>
                <div className="relative">
                  <Input
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="e.g. Payment & Invoicing, Profile Verification, etc."
                    className="h-9 text-xs pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 max-h-48 overflow-y-auto text-xs">
                      <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                        Suggested Categories
                      </div>
                      {PRESET_CATEGORIES.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setCategoryInput(preset);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors flex items-center justify-between"
                        >
                          <span>{preset}</span>
                          {categoryInput === preset && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Priority Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        priority === p.value
                          ? `${p.color} ring-1 ring-primary/40 font-bold shadow-xs`
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                      <div className="text-[9px] opacity-80">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Issue Subject / One-Line Summary *</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue (e.g., GST invoice not generated for payment)"
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Detailed Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, steps to reproduce, or any specific help needed..."
                  className="text-xs min-h-[90px] resize-y"
                  required
                />
              </div>

              {/* Optional Reference ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reference ID (Optional)
                </label>
                <Input
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. Invoice #, Transaction ID, or Order #"
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Direct Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    Upload Photo (Optional)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {!photoPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-muted/40 group flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Camera className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      Click to upload photo
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Attach photo of receipt, payment slip, bill, error, or document
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-border bg-background shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreview}
                          alt="Uploaded preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                          {photoFile?.name || "Uploaded Photo"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : "Image attachment"}
                        </div>
                        <div>
                          {uploadingPhoto ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                              <Loader2 className="h-3 w-3 animate-spin" /> Uploading photo...
                            </span>
                          ) : uploadedPhotoUrl ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> Photo attached ready
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="gap-1.5 font-bold">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Submit to Chapter Admin
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Ticket Details & Timeline Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
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
                      <span>Handler: {getLevelBadge(selectedTicket.currentLevel)}</span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Escalation Notification if escalated */}
                  {selectedTicket.escalations && selectedTicket.escalations.length > 0 && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1 text-purple-900 dark:text-purple-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <ArrowUpRight className="h-3.5 w-3.5 text-purple-600" />
                        Ticket Escalated to {selectedTicket.currentLevel} Admin
                      </div>
                      <div className="text-[11px] opacity-90">
                        {selectedTicket.escalations[selectedTicket.escalations.length - 1].reason} — Handover Note:{" "}
                        <em>{selectedTicket.escalations[selectedTicket.escalations.length - 1].handoverNote}</em>
                      </div>
                    </div>
                  )}

                  {/* Resolution Banner if resolved */}
                  {selectedTicket.resolution && selectedTicket.resolution.resolutionNote && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1 text-emerald-950 dark:text-emerald-300">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Issue Marked as Resolved
                      </div>
                      <div className="text-[11px] font-medium mt-1">
                        Resolution: {selectedTicket.resolution.resolutionNote}
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

                  {/* Conversation & Activity Feed */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Conversation & Updates ({selectedTicket.messages?.length || 0})
                    </div>

                    <div className="space-y-2.5">
                      {selectedTicket.messages?.map((msg, idx) => {
                        const isBiz = msg.senderRole === "business";
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs max-w-[85%] ${
                              isBiz
                                ? "ml-auto bg-primary text-primary-foreground border-primary/20 rounded-br-xs"
                                : "mr-auto bg-muted/60 text-foreground border-border rounded-bl-xs"
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

                {/* Reply Box Footer */}
                {selectedTicket.status !== "Closed" && (
                  <form onSubmit={handleSendReply} className="p-3 border-t bg-background flex items-center gap-2">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type a message or response to admin..."
                      className="h-9 text-xs flex-1"
                    />
                    <Button type="submit" size="sm" disabled={sendingReply || !replyText.trim()} className="gap-1 font-semibold h-9 px-4">
                      {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send
                    </Button>
                  </form>
                )}
              </>
            )}
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

export default BusinessTicketsView;
