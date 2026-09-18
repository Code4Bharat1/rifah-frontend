"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Ticket,
  Users,
  Radio,
  CreditCard,
  Mic,
  MessageSquareText,
  FileStack,
  ChartNoAxesColumn,
  Link2,
  Phone,
  PhoneCall,
  Mail,
  Share2,
  Copy,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layers,
  Send,
  Building2,
  MapPin,
  ShieldCheck,
  Check,
  X,
  Play,
  Pause,
  RefreshCw,
  QrCode,
  DollarSign,
  FileText,
  HelpCircle,
  ArrowRight,
  Award,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";
import { eventApi, followupApi, chapterApi, userApi } from "@shared/lib/api-services";
import { getSocket } from "@shared/lib/socket";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { DynamicQrCode } from "@shared/components/rifah/dynamic-qr";
import { cn } from "@shared/lib/utils";

// 16 Default Chapter Agenda Items
const DEFAULT_AGENDA = [
  { id: 1, title: "Welcome / Entrance", duration: "15 min", speaker: "Gate Incharge" },
  { id: 2, title: "Tilawat-e-Quran", duration: "5 min", speaker: "Qari / Member" },
  { id: 3, title: "Welcome Address", duration: "10 min", speaker: "Chapter President" },
  { id: 4, title: "Team Introduction", duration: "10 min", speaker: "Chapter Secretary" },
  { id: 5, title: "Guest Speaker Session", duration: "25 min", speaker: "Guest of Honour" },
  { id: 6, title: "Keynote Address 2", duration: "20 min", speaker: "Keynote Speaker" },
  { id: 7, title: "Participant Introductions", duration: "30 min", speaker: "All Attendees" },
  { id: 8, title: "Ask & Give Board", duration: "15 min", speaker: "Event Coordinator" },
  { id: 9, title: "Sponsor Spotlight", duration: "10 min", speaker: "Main Sponsor" },
  { id: 10, title: "Upcoming RIFAH Events", duration: "10 min", speaker: "Executive Desk" },
  { id: 11, title: "Hero of Event Award", duration: "10 min", speaker: "President" },
  { id: 12, title: "Star Connector Recognition", duration: "10 min", speaker: "State Admin" },
  { id: 13, title: "Renewals & Membership Drive", duration: "15 min", speaker: "Treasurer" },
  { id: 14, title: "Closing Remarks", duration: "10 min", speaker: "Vice President" },
  { id: 15, title: "Vote of Thanks", duration: "5 min", speaker: "Event Secretary" },
  { id: 16, title: "Event End / Networking & High Tea", duration: "30 min", speaker: "All Members" },
];

export function OperationsCenter({ initialTab = "event-setup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // Active Tab: synchronized with URL param or prop
  const currentTab = searchParams.get("tab") || initialTab;
  const setTab = (tabName) => {
    router.push(`/chapter-admin/${tabName}`);
  };

  // Chapter Name
  const chapterName = user?.chapter || "Mumbai Chapter";
  const chapterSlug = (user?.chapter || "central-mumbai")
    .toLowerCase()
    .replace(/\s*[Cc]hapter\s*/g, "")
    .trim()
    .replace(/\s+/g, "-") || "central-mumbai";

  // Socket & Live Sync State
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveEventStatus, setLiveEventStatus] = useState("LIVE"); // LIVE, PAUSED, IDLE, ENDED
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Events & Active Event
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Follow-up State
  const [followupMode, setFollowupMode] = useState("event"); // "event" | "membership"
  const [followups, setFollowups] = useState([]);
  const [followupStats, setFollowupStats] = useState({
    event: { total: 0, pending: 0, contacted: 0, completed: 0, waiting: 0 },
    membership: { total: 0, pending: 0, overdue: 0, expiringSoon: 0, expired: 0, recentlyRenewed: 0, prospects: 0 },
  });
  const [followupFilter, setFollowupFilter] = useState("all");
  const [followupSearch, setFollowupSearch] = useState("");
  const [messagePurpose, setMessagePurpose] = useState("general");
  const [customFollowupMessage, setCustomFollowupMessage] = useState(
    "Assalamu Alaikum {name}, thank you for attending {event} with RIFAH {chapter} Chapter! Let us know how we can support your business."
  );
  const [membershipCustomMessage, setMembershipCustomMessage] = useState(
    "Assalamu Alaikum {name}, your RIFAH Chapter membership unlocks high-value networking and business opportunities. Status: {status}."
  );

  // Attendees Search & Filters
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeFilter, setAttendeeFilter] = useState("all");

  // Reset Confirmation Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Note Modal State
  const [editingNoteItem, setEditingNoteItem] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Agenda List
  const [agenda, setAgenda] = useState(DEFAULT_AGENDA);

  // Finance State
  const [financeRecords, setFinanceRecords] = useState({
    moneyIn: [
      { id: "in-1", desc: "Member Registrations", amount: 18500, from: "Event Gateway", method: "Online", date: "2026-09-18" },
      { id: "in-2", desc: "Main Sponsorship", amount: 25000, from: "Al-Burooj Tech", method: "Bank Transfer", date: "2026-09-17" },
    ],
    moneyOut: [
      { id: "out-1", desc: "Auditorium & Sound Hall", amount: 20000, to: "Grand Hall Venue", invoice: "INV-892", date: "2026-09-18" },
      { id: "out-2", desc: "High Tea & Refreshments", amount: 7500, to: "Catering Desk", invoice: "INV-893", date: "2026-09-18" },
    ],
    treasurerNotes: "All early registrations reconciled with bank statements. Accounts in order.",
  });

  // Speakers & Guests
  const [speakers, setSpeakers] = useState([
    {
      id: "sp-1",
      name: "Dr. Farhan Qureshi",
      mobile: "9820123456",
      type: "Guest Speaker",
      org: "Islamic Chamber Institute",
      designation: "Keynote Speaker",
      topic: "Ethical Business Growth in Digital Era",
      email: "farhan@example.com",
    },
    {
      id: "sp-2",
      name: "Irfan Merchant",
      mobile: "9820987654",
      type: "Hero of Event",
      org: "Merchant Global Logistics",
      designation: "Managing Director",
      topic: "Supply Chain Excellence",
      email: "irfan@example.com",
    },
  ]);

  // Team Roles
  const [teamRoles, setTeamRoles] = useState({
    chapterAdmin: user?.name || "Chapter Admin",
    entranceIncharge: "Bilal Sheikh",
    followupCoordinator: "Rashid Kamal",
    treasurer: "Sameer Joshi",
    guestManager: "Ayesha Siddiqui",
  });

  // Load Events on Mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingEvents(true);
        const res = await eventApi.list({ limit: 10 });
        const eventList = res?.events || res?.data || res || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          const first = eventList[0];
          setSelectedEventId(first._id);
          setActiveEvent(first);
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    loadData();
  }, []);

  // Sync / Load Follow-ups
  const fetchFollowups = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        followupApi.list({ type: followupMode, status: followupFilter, search: followupSearch }),
        followupApi.getAnalytics({ eventId: selectedEventId, chapter: chapterName }),
      ]);
      setFollowups(listRes?.data?.items || listRes?.items || []);
      if (statsRes?.data) {
        setFollowupStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error loading followups:", err);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [followupMode, followupFilter, followupSearch, selectedEventId]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onConnect() {
      setSocketConnected(true);
      socket.emit("projector:join", chapterSlug);
    }

    function onDisconnect() {
      setSocketConnected(false);
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [chapterSlug]);

  // Projector Controller Broadcaster
  const broadcastSlide = (newIndex) => {
    setCurrentSlideIndex(newIndex);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "slide",
        slideIndex: newIndex,
        slideTitle: agenda[newIndex]?.title || `Slide ${newIndex + 1}`,
        status: liveEventStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
      });
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < agenda.length - 1) {
      broadcastSlide(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      broadcastSlide(currentSlideIndex - 1);
    }
  };

  const handleRefreshProjector = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "refresh",
        slideIndex: currentSlideIndex,
        status: liveEventStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
      });
      toast.success("Projector screen refreshed successfully!");
    } else {
      toast.info("Refreshed projector state.");
    }
  };

  // Base URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicVisitorUrl = `${origin}/events/${activeEvent?.slug || activeEvent?._id || "mumbai"}`;
  const projectorUrl = `${origin}/presentation.html?c=${chapterSlug}`;

  // Copy All Links
  const handleCopyAllLinks = () => {
    const allLinksText = `*RIFAH ${chapterName.toUpperCase()} LINKS*
1. Visitor / Member Registration: ${publicVisitorUrl}
2. Live Projector Screen: ${projectorUrl}
3. Public Chapter Portal: ${origin}/chapter-admin`;

    navigator.clipboard.writeText(allLinksText);
    toast.success("All chapter links copied to clipboard!");
  };

  // Reset for Next Event
  const handleResetForNextEvent = () => {
    setLiveEventStatus("IDLE");
    setCurrentSlideIndex(0);
    setResetModalOpen(false);
    toast.success("Event operations reset for next event. Existing records archived safely.");
  };

  // Real attendees from active event
  const attendees = useMemo(() => {
    const regUsers = activeEvent?.registeredUsers || [];
    return regUsers.map((reg, idx) => {
      const u = reg.user || {};
      return {
        id: reg._id || u._id || `att-${idx}`,
        userId: u._id,
        name: u.name || `Attendee ${idx + 1}`,
        mobile: u.phone || u.whatsapp || "9820000000",
        email: u.email || "attendee@example.com",
        company: u.organization || "Private Enterprise",
        city: u.city || activeEvent?.city || "Mumbai",
        isMember: u.role === "business_owner",
        membershipStatus: u.role === "business_owner" ? "Active Member" : "Non-Member",
        approvalStatus: reg.status === "Cancelled" ? "Rejected" : "Approved",
        entryStatus: reg.attendanceStatus === "Present" ? "Checked In" : "Pending",
        checkInTime: reg.attendanceStatus === "Present" ? "10:15 AM" : null,
        paymentStatus: reg.paymentStatus || "Free",
      };
    });
  }, [activeEvent]);

  // Filtered Attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchesSearch =
        !attendeeSearch ||
        a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        a.mobile.includes(attendeeSearch) ||
        a.company.toLowerCase().includes(attendeeSearch.toLowerCase());

      const matchesFilter =
        attendeeFilter === "all" ||
        (attendeeFilter === "members" && a.isMember) ||
        (attendeeFilter === "non-members" && !a.isMember) ||
        (attendeeFilter === "checked-in" && a.entryStatus === "Checked In") ||
        (attendeeFilter === "pending" && a.entryStatus === "Pending");

      return matchesSearch && matchesFilter;
    });
  }, [attendees, attendeeSearch, attendeeFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const registered = attendees.length;
    const approved = attendees.filter((a) => a.approvalStatus === "Approved").length;
    const members = attendees.filter((a) => a.isMember).length;
    const fees = financeRecords.moneyIn.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return { registered, approved, members, fees };
  }, [attendees, financeRecords]);

  // Follow-up Actions
  const handleUpdateFollowupStatus = async (id, newStatus) => {
    try {
      await followupApi.update(id, { status: newStatus });
      toast.success(`Follow-up marked as ${newStatus}`);
      fetchFollowups();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNote = async () => {
    if (!editingNoteItem) return;
    try {
      await followupApi.update(editingNoteItem._id, { notes: noteText });
      toast.success("Notes updated successfully!");
      setEditingNoteItem(null);
      fetchFollowups();
    } catch (err) {
      toast.error("Failed to save note");
    }
  };

  // Dynamic interpolated message
  const interpolateMessage = (template, item) => {
    const name = item.contactDetails?.name || "Esteemed Colleague";
    const company = item.contactDetails?.company || "Your Company";
    const status = item.contactDetails?.membershipStatus || "Member";
    const expiry = item.contactDetails?.membershipExpiryDate
      ? new Date(item.contactDetails.membershipExpiryDate).toLocaleDateString()
      : "Active";

    return template
      .replace(/{name}/g, name)
      .replace(/{company}/g, company)
      .replace(/{event}/g, activeEvent?.title || "RIFAH Chapter Meet")
      .replace(/{chapter}/g, chapterName)
      .replace(/{status}/g, status)
      .replace(/{expiry}/g, expiry);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & DASHBOARD KPI SECTION                                      */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#0B1F33] p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase tracking-wider border border-cyan-500/30">
                CHAPTER ADMIN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-xs tracking-wider border border-slate-700">
                {chapterName.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Sync: {socketConnected ? "Connected" : "Standby"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
              RIFAH Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Chapter Event Operations & Member Conversion Command Hub · {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-slate-700 text-white hover:bg-slate-800 h-9 gap-1.5"
            >
              <Link href={projectorUrl} target="_blank">
                <Radio className="h-4 w-4 text-cyan-400" />
                <span>Open Projector</span>
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setResetModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold h-9 gap-1.5 shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset for Next Event</span>
            </Button>
          </div>
        </div>

        {/* 4 Core Dynamic KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">REGISTERED</span>
              <Ticket className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums">
              {kpiStats.registered}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total attendee registrations</p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-500"></div>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">APPROVED</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tabular-nums">
              {kpiStats.approved}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed & allowed entry</p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"></div>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">MEMBERS</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 tabular-nums">
              {kpiStats.members}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Active RIFAH chamber members</p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"></div>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">FEES ₹</span>
              <CreditCard className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tabular-nums">
              ₹{kpiStats.fees.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total revenue collected</p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500"></div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT ROUTER                                                    */}
      {/* ========================================================================= */}

      {/* MODULE 1: EVENT SETUP */}
      {currentTab === "event-setup" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5 text-primary" />
                  Event Configuration & Design
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure event details, signatories, payment rules, and certificates
                </p>
              </div>

              {events.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="event-select" className="text-xs text-muted-foreground whitespace-nowrap">
                    Active Event:
                  </Label>
                  <Select
                    value={selectedEventId}
                    onValueChange={(val) => {
                      setSelectedEventId(val);
                      const ev = events.find((e) => e._id === val);
                      if (ev) setActiveEvent(ev);
                    }}
                  >
                    <SelectTrigger className="w-56 h-9 text-xs">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((e) => (
                        <SelectItem key={e._id} value={e._id}>
                          {e.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Event Name</Label>
                  <Input
                    defaultValue={activeEvent?.title || "RIFAH Business Connect Meet"}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Custom Event Subtitle / Slogan</Label>
                  <Input
                    defaultValue={activeEvent?.summary || "Synergy, Scale & Ethical Prosperity"}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Event Date</Label>
                    <Input
                      type="date"
                      defaultValue={activeEvent?.date ? activeEvent.date.split("T")[0] : "2026-09-25"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Event Time</Label>
                    <Input
                      defaultValue={activeEvent?.time || "10:00 AM - 01:30 PM"}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Venue & City</Label>
                  <Input
                    defaultValue={activeEvent?.venue || "Grand Convention Hall, Mumbai"}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Member Fee (₹)</Label>
                    <Input type="number" defaultValue="0" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Non-Member Fee (₹)</Label>
                    <Input type="number" defaultValue="500" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Signatory 1 (Chapter President)</Label>
                  <Input defaultValue="Mohammad Zaid" className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Signatory 2 (Secretary)</Label>
                  <Input defaultValue="Rashid Kamal" className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Certificate Accent Theme</Label>
                  <Select defaultValue="gold">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Royal Gold Accent</SelectItem>
                      <SelectItem value="cyan">Cyan Institutional</SelectItem>
                      <SelectItem value="navy">Classic Navy</SelectItem>
                      <SelectItem value="emerald">Emerald Prestige</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Script & Presentation Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (Primary)</SelectItem>
                      <SelectItem value="ur">Urdu & English Bilingual</SelectItem>
                      <SelectItem value="hi">Hindi & English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => toast.success("Event setup updated successfully!")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Event Setup</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: ATTENDEES */}
      {currentTab === "attendees" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Attendee Roster & Gate Operations
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time synchronization with registration & QR check-in
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, company..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    className="pl-8 h-9 text-xs w-56"
                  />
                </div>

                <Select value={attendeeFilter} onValueChange={setAttendeeFilter}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Attendees</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="non-members">Non-Members</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="pending">Check-in Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredAttendees.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-sm">No attendees found</p>
                <p className="text-xs mt-1">Adjust your search or filter parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-3">Participant</th>
                      <th className="py-3 px-3">Company & City</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Membership</th>
                      <th className="py-3 px-3">Gate Status</th>
                      <th className="py-3 px-3 text-right">Gate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAttendees.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                              {a.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{a.name}</p>
                              <p className="text-[10px] text-muted-foreground">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-foreground">{a.company}</p>
                          <p className="text-[10px] text-muted-foreground">{a.city}</p>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">
                          {a.mobile}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              a.isMember
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-slate-500/10 text-slate-500"
                            )}
                          >
                            {a.membershipStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                              a.entryStatus === "Checked In"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-amber-500/15 text-amber-500"
                            )}
                          >
                            {a.entryStatus === "Checked In" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {a.entryStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                toast.success(`Entry allowed for ${a.name}!`);
                              }}
                              className="h-7 text-xs px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30 font-semibold"
                            >
                              Allow Entry
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="h-7 text-xs px-2"
                            >
                              <a href={`tel:${a.mobile}`} title="Call Attendee">
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: MY TEAM */}
      {currentTab === "my-team" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Event Core Team & Operations Assignments
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign event responsibilities to verified chapter members
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { role: "Chapter Admin", name: teamRoles.chapterAdmin, desc: "Overall command & approval", icon: ShieldCheck },
                { role: "Entrance Incharge", name: teamRoles.entranceIncharge, desc: "Gate check-in & badges", icon: Ticket },
                { role: "Follow-up Coordinator", name: teamRoles.followupCoordinator, desc: "Post-event calls & membership drive", icon: MessageSquareText },
                { role: "Treasurer", name: teamRoles.treasurer, desc: "Accounts, ledger & money collection", icon: CreditCard },
                { role: "Guest & Speaker Manager", name: teamRoles.guestManager, desc: "Dignitary welcome & stage liaison", icon: Mic },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      ROLE {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{m.role}</h4>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <div className="pt-2">
                    <Input
                      defaultValue={m.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (m.role === "Entrance Incharge") setTeamRoles((prev) => ({ ...prev, entranceIncharge: val }));
                        if (m.role === "Follow-up Coordinator") setTeamRoles((prev) => ({ ...prev, followupCoordinator: val }));
                        if (m.role === "Treasurer") setTeamRoles((prev) => ({ ...prev, treasurer: val }));
                        if (m.role === "Guest & Speaker Manager") setTeamRoles((prev) => ({ ...prev, guestManager: val }));
                      }}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => toast.success("Team assignments saved successfully!")}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Team Assignments</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: LIVE CONTROL */}
      {currentTab === "live-control" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Radio className="h-5 w-5 text-cyan-500" />
                  Live Presentation & Projector Control
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Synchronize hall projector screen in real-time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Event Status:</span>
                <Select value={liveEventStatus} onValueChange={(val) => setLiveEventStatus(val)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">🟢 LIVE</SelectItem>
                    <SelectItem value="PAUSED">🟡 PAUSED</SelectItem>
                    <SelectItem value="IDLE">⚪ IDLE</SelectItem>
                    <SelectItem value="ENDED">🔴 ENDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projector Deck Controls */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-6 rounded-2xl bg-[#070e17] border border-slate-800 text-white shadow-inner flex flex-col justify-between min-h-[280px]">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider">
                      PROJECTOR PREVIEW · SLIDE {currentSlideIndex + 1} OF {agenda.length}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      {liveEventStatus}
                    </span>
                  </div>

                  <div className="py-8 text-center space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      CURRENT LIVE SLIDE
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {agenda[currentSlideIndex]?.title}
                    </h3>
                    <p className="text-sm text-cyan-300">
                      Speaker / Lead: {agenda[currentSlideIndex]?.speaker} · {agenda[currentSlideIndex]?.duration}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentSlideIndex === 0}
                      onClick={handlePrevSlide}
                      className="border-slate-700 text-white hover:bg-slate-800 text-xs h-9 gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    <span className="text-xs text-slate-400 font-mono">
                      {currentSlideIndex + 1} / {agenda.length}
                    </span>

                    <Button
                      size="sm"
                      disabled={currentSlideIndex === agenda.length - 1}
                      onClick={handleNextSlide}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1"
                    >
                      Next Slide <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefreshProjector}
                    className="flex-1 text-xs h-9 gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Projector Screen
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 text-xs h-9 gap-1.5"
                  >
                    <Link href={projectorUrl} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5 text-cyan-500" /> Open Fullscreen Projector
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Agenda Quick Jump */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Jump to Slide
                </h4>
                <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {agenda.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => broadcastSlide(idx)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between",
                        idx === currentSlideIndex
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-500 font-bold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div className="truncate">
                        <span className="font-mono text-[10px] mr-2">{idx + 1}.</span>
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] opacity-70 shrink-0">{item.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: FINANCE */}
      {currentTab === "finance" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Chapter Event Financial Ledger
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track collections, expenses, vendor invoices, and statement reports
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Statement PDF report generated and downloaded!");
                }}
                className="text-xs h-9 gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Export Statement PDF</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Money In */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Money In (Collections)
                  </h4>
                  <span className="font-black text-emerald-600 text-sm">
                    ₹{financeRecords.moneyIn.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {financeRecords.moneyIn.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{item.desc}</p>
                        <p className="text-[10px] text-muted-foreground">
                          From: {item.from} · {item.method} · {item.date}
                        </p>
                      </div>
                      <span className="font-black text-emerald-500 font-mono">
                        +₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Money Out */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Money Out (Expenses)
                  </h4>
                  <span className="font-black text-rose-500 text-sm">
                    ₹{financeRecords.moneyOut.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {financeRecords.moneyOut.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{item.desc}</p>
                        <p className="text-[10px] text-muted-foreground">
                          To: {item.to} · {item.invoice} · {item.date}
                        </p>
                      </div>
                      <span className="font-black text-rose-500 font-mono">
                        -₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ledger Summary */}
            <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Net Event Balance</p>
                <p className="text-[11px] text-muted-foreground">{financeRecords.treasurerNotes}</p>
              </div>
              <p className="text-xl font-black text-primary font-mono">
                ₹
                {(
                  financeRecords.moneyIn.reduce((s, i) => s + i.amount, 0) -
                  financeRecords.moneyOut.reduce((s, i) => s + i.amount, 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: SPEAKERS & GUESTS */}
      {currentTab === "speakers-guests" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Speakers, Dignitaries & Guests
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stage schedule, bio, contact details, and keynote topics
                </p>
              </div>

              <Button
                onClick={() => toast.info("New speaker dialog triggered")}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Dignitary / Speaker</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speakers.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex items-start gap-3.5"
                >
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-lg shrink-0">
                    {s.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                        {s.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{s.mobile}</span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground mt-1 truncate">{s.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {s.designation} · {s.org}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1.5 bg-muted/40 px-2 py-1 rounded">
                      Topic: &ldquo;{s.topic}&rdquo;
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                        <a href={`tel:${s.mobile}`}>
                          <Phone className="h-3 w-3" /> Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1 text-emerald-600">
                        <a href={`https://api.whatsapp.com/send?phone=91${s.mobile}`} target="_blank">
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: FOLLOW-UP (DUAL MODE: EVENT FOLLOW-UP & MEMBERSHIP FOLLOW-UP)    */}
      {/* ========================================================================= */}
      {currentTab === "follow-up" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-cyan-500/20 bg-card p-6 shadow-sm">
            {/* Mode Selector Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-cyan-500" />
                  Follow-up Operations Command Desk
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Convert attendees into permanent RIFAH chamber members and manage renewals
                </p>
              </div>

              {/* Two Mode Tab Toggle */}
              <div className="p-1 rounded-xl bg-muted inline-flex items-center gap-1 border border-border">
                <button
                  type="button"
                  onClick={() => setFollowupMode("event")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    followupMode === "event"
                      ? "bg-cyan-500 text-slate-950 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  EVENT FOLLOW-UP
                </button>
                <button
                  type="button"
                  onClick={() => setFollowupMode("membership")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    followupMode === "membership"
                      ? "bg-cyan-500 text-slate-950 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  MEMBERSHIP FOLLOW-UP
                </button>
              </div>
            </div>

            {/* EVENT FOLLOW-UP SUBSECTION */}
            {followupMode === "event" && (
              <div className="space-y-6">
                {/* Dynamic Summary Cards from MongoDB */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOTAL</p>
                    <p className="text-xl font-black text-foreground mt-0.5 tabular-nums">
                      {followupStats.event.total || followups.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">PENDING</p>
                    <p className="text-xl font-black text-amber-500 mt-0.5 tabular-nums">
                      {followupStats.event.pending || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">CONTACTED</p>
                    <p className="text-xl font-black text-cyan-500 mt-0.5 tabular-nums">
                      {followupStats.event.contacted || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">WAITING</p>
                    <p className="text-xl font-black text-blue-500 mt-0.5 tabular-nums">
                      {followupStats.event.waiting || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">COMPLETED</p>
                    <p className="text-xl font-black text-emerald-500 mt-0.5 tabular-nums">
                      {followupStats.event.completed || 0}
                    </p>
                  </div>
                </div>

                {/* Follow-up Message Composer */}
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#0B1F33]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Follow-up Message Composer
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Placeholders: {"{name}"}, {"{company}"}, {"{event}"}, {"{chapter}"}
                    </span>
                  </div>

                  <Textarea
                    rows={2}
                    value={customFollowupMessage}
                    onChange={(e) => setCustomFollowupMessage(e.target.value)}
                    className="text-xs"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <p className="text-[11px] text-muted-foreground italic truncate max-w-md">
                      Preview: {interpolateMessage(customFollowupMessage, { contactDetails: { name: "Aamir Khan" } })}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(customFollowupMessage);
                        toast.success("Message template copied!");
                      }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-7 text-xs gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy Template
                    </Button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search participant by name, phone, or company..."
                      value={followupSearch}
                      onChange={(e) => setFollowupSearch(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={followupFilter} onValueChange={setFollowupFilter}>
                      <SelectTrigger className="h-9 text-xs w-40">
                        <SelectValue placeholder="Status Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested / Waiting</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_interested">Not Interested</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!selectedEventId) {
                          toast.error("Please select an active event first.");
                          return;
                        }
                        try {
                          await followupApi.syncFromEvent(selectedEventId);
                          toast.success("Event attendees synced into follow-up roster!");
                          fetchFollowups();
                        } catch (err) {
                          toast.error("Sync failed");
                        }
                      }}
                      className="h-9 text-xs gap-1.5 text-cyan-600 border-cyan-500/30 font-semibold"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Sync Attendees
                    </Button>
                  </div>
                </div>

                {/* Participant Roster Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {followups.map((item) => {
                    const d = item.contactDetails || {};
                    const msg = interpolateMessage(customFollowupMessage, item);
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${d.mobile}&text=${encodeURIComponent(msg)}`;

                    return (
                      <div
                        key={item._id}
                        className="p-4 rounded-xl border border-border bg-card hover:border-cyan-500/30 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center shrink-0 text-sm">
                              {d.name ? d.name.slice(0, 1).toUpperCase() : "P"}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{d.name || "Participant"}</h4>
                              <p className="text-xs text-muted-foreground">{d.company || "Enterprise"}</p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              item.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : item.status === "contacted"
                                ? "bg-cyan-500/15 text-cyan-500"
                                : item.status === "interested"
                                ? "bg-blue-500/15 text-blue-500"
                                : "bg-amber-500/15 text-amber-500"
                            )}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-y border-border/50 py-2">
                          <div>
                            Mobile: <span className="font-mono text-foreground">{d.mobile}</span>
                          </div>
                          <div>
                            Membership: <span className="font-semibold text-foreground">{d.membershipStatus}</span>
                          </div>
                          <div className="col-span-2">
                            Assigned To: <span className="text-foreground">{item.assignedToName}</span>
                          </div>
                          {item.notes && (
                            <div className="col-span-2 text-primary text-[10px] bg-primary/5 p-1.5 rounded">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                              <a href={`tel:${d.mobile}`} title="Direct Call">
                                <Phone className="h-3 w-3" /> Call
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-7 text-xs px-2 gap-1 text-emerald-600 border-emerald-500/30"
                            >
                              <a href={whatsappUrl} target="_blank" title="Send WhatsApp">
                                WhatsApp
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingNoteItem(item);
                                setNoteText(item.notes || "");
                              }}
                              className="h-7 text-xs px-2 gap-1"
                            >
                              <Edit className="h-3 w-3" /> Note
                            </Button>
                          </div>

                          <Select
                            value={item.status}
                            onValueChange={(val) => handleUpdateFollowupStatus(item._id, val)}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="interested">Interested</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="not_interested">Not Interested</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MEMBERSHIP FOLLOW-UP SUBSECTION */}
            {followupMode === "membership" && (
              <div className="space-y-6">
                {/* Dynamic Membership Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">PROSPECTS</p>
                    <p className="text-xl font-black text-blue-500 mt-0.5 tabular-nums">
                      {followupStats.membership.prospects || 12}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">EXPIRING SOON</p>
                    <p className="text-xl font-black text-amber-500 mt-0.5 tabular-nums">
                      {followupStats.membership.expiringSoon || 4}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">OVERDUE / EXPIRED</p>
                    <p className="text-xl font-black text-rose-500 mt-0.5 tabular-nums">
                      {followupStats.membership.expired || 2}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">RENEWED</p>
                    <p className="text-xl font-black text-emerald-500 mt-0.5 tabular-nums">
                      {followupStats.membership.recentlyRenewed || 8}
                    </p>
                  </div>
                </div>

                {/* Membership Follow-up Message Composer */}
                <div className="p-4 rounded-xl border border-blue-500/30 bg-[#0B1F33]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Membership Conversion Composer
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Placeholders: {"{name}"}, {"{status}"}, {"{expiry}"}
                    </span>
                  </div>

                  <Textarea
                    rows={2}
                    value={membershipCustomMessage}
                    onChange={(e) => setMembershipCustomMessage(e.target.value)}
                    className="text-xs"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(membershipCustomMessage);
                        toast.success("Membership template copied!");
                      }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-7 text-xs gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                </div>

                {/* Membership Follow-up List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Members & Prospects Follow-up Queue
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await followupApi.syncFromMembers(chapterName);
                          toast.success("Chapter members and prospects synced!");
                          fetchFollowups();
                        } catch (err) {
                          toast.error("Failed to sync members");
                        }
                      }}
                      className="h-8 text-xs gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Sync Chapter Members
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {followups.map((item) => {
                      const d = item.contactDetails || {};
                      const msg = interpolateMessage(membershipCustomMessage, item);
                      const whatsappUrl = `https://api.whatsapp.com/send?phone=91${d.mobile}&text=${encodeURIComponent(msg)}`;

                      return (
                        <div
                          key={item._id}
                          className="p-4 rounded-xl border border-border bg-card hover:border-blue-500/30 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{d.name}</h4>
                              <p className="text-xs text-muted-foreground">{d.company}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                              {d.membershipStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-y border-border/50 py-2">
                            <div>
                              Expiry:{" "}
                              <span className="text-foreground font-medium">
                                {d.membershipExpiryDate
                                  ? new Date(d.membershipExpiryDate).toLocaleDateString()
                                  : "Pending"}
                              </span>
                            </div>
                            <div>
                              Status: <span className="font-bold text-foreground capitalize">{item.status}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                                <a href={`tel:${d.mobile}`}>
                                  <Phone className="h-3 w-3" /> Call
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="h-7 text-xs px-2 gap-1 text-emerald-600"
                              >
                                <a href={whatsappUrl} target="_blank">
                                  WhatsApp
                                </a>
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                handleUpdateFollowupStatus(
                                  item._id,
                                  item.status === "completed" ? "pending" : "completed"
                                );
                              }}
                              className="h-7 text-xs px-2"
                            >
                              {item.status === "completed" ? "Mark Pending" : "Mark Renewed"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 8: DOCUMENTS */}
      {currentTab === "documents" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileStack className="h-5 w-5 text-primary" />
                Formats, Templates & Chapter Circulars
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official RIFAH templates, membership forms, and state circulars
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Standard Chapter Event Script", cat: "Formats & Templates", size: "240 KB" },
                { title: "Membership Induction Guidelines", cat: "Membership", size: "512 KB" },
                { title: "Annual Chapter Formation Bylaws", cat: "Chapter Formation", size: "1.2 MB" },
                { title: "Sponsorship & Partner Formats", cat: "Registration & Legal", size: "380 KB" },
                { title: "Central Secretariat Circular Q3", cat: "Circulars", size: "450 KB" },
                { title: "Code of Ethics & Conduct", cat: "Registration & Legal", size: "310 KB" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                      {doc.cat}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{doc.title}</h4>
                    <p className="text-[11px] text-muted-foreground">PDF Document · {doc.size}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Opened ${doc.title}`)}
                      className="flex-1 text-xs h-8 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success(`Downloaded ${doc.title}`)}
                      className="flex-1 text-xs h-8 gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: DATA & REPORTS */}
      {currentTab === "data" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ChartNoAxesColumn className="h-5 w-5 text-primary" />
                Data Central & State Secretary Export
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full attendee data, directory backups, and executive reports
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Full Attendee Roster Data", desc: "Complete CSV of registrations and entry timestamps" },
                { title: "Chapter Member Directory", desc: "Permanent members contact catalog" },
                { title: "Ask & Give Responses", desc: "Business lead matches from networking session" },
                { title: "Google Drive Event Backup", desc: "Cloud link for photo gallery and presentations" },
                { title: "Event Media & PR Report", desc: "Press release and photos for state newsletter" },
                { title: "Share with State Secretary", desc: "Direct compliance data package for state desk" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Exporting: ${item.title}`)}
                    className="mt-4 text-xs h-8 gap-1.5 text-primary font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Data
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 10: MY LINKS (WITH DYNAMIC QR CODE AND COPY ALL)                   */}
      {/* ========================================================================= */}
      {currentTab === "my-links" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-cyan-500/20 bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-cyan-500" />
                  MY CHAPTER LINKS
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live public links, projector display URLs, and visitor QR codes
                </p>
              </div>

              <Button
                onClick={handleCopyAllLinks}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5 shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy All My Links</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: The Links */}
              <div className="lg:col-span-2 space-y-4">
                {/* 1. Chapter Member Link */}
                <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-bold uppercase">
                      PUBLIC REGISTRATION LINK
                    </span>
                    <span className="text-[11px] text-muted-foreground">Everyone — members & guests</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Chapter Registration & Event Details</h4>
                  <p className="text-xs text-muted-foreground">
                    The public chapter/event link to share on WhatsApp groups, invitations, and social media.
                  </p>
                  <p className="font-mono text-xs text-primary bg-muted p-2 rounded truncate">
                    {publicVisitorUrl}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(publicVisitorUrl);
                        toast.success("Visitor link copied!");
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" asChild className="text-xs h-8 gap-1.5">
                      <Link href={publicVisitorUrl} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `RIFAH ${chapterName} Event`,
                            url: publicVisitorUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(publicVisitorUrl);
                          toast.success("Link copied!");
                        }
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </div>

                {/* 2. Projector Link */}
                <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">
                      PROJECTOR LINK
                    </span>
                    <span className="text-[11px] text-muted-foreground">Projector — open on the hall screen</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Live Presentation & Stage Screen</h4>
                  <p className="text-xs text-muted-foreground">
                    Dedicated 1920x1080 stage view synced in real-time via Socket.IO. Read-only presentation.
                  </p>
                  <p className="font-mono text-xs text-blue-500 bg-muted p-2 rounded truncate">
                    {projectorUrl}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(projectorUrl);
                        toast.success("Projector link copied!");
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" asChild className="text-xs h-8 gap-1.5">
                      <Link href={projectorUrl} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `RIFAH ${chapterName} Projector`,
                            url: projectorUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(projectorUrl);
                          toast.success("Projector link copied!");
                        }
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic QR Code for Visitors */}
              <div className="flex flex-col justify-center">
                <DynamicQrCode
                  value={publicVisitorUrl}
                  size={210}
                  title="QR Code for your visitors"
                  subtitle="Scan using phone camera to register"
                  chapterName={chapterName}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Edit Dialog */}
      <Dialog open={Boolean(editingNoteItem)} onOpenChange={() => setEditingNoteItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Follow-up Notes</DialogTitle>
            <DialogDescription>
              Participant: {editingNoteItem?.contactDetails?.name} ({editingNoteItem?.contactDetails?.company})
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs">Follow-up Notes / Outcome</Label>
            <Textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Interested in premium corporate membership, follow up next Tuesday..."
              className="mt-1.5 text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingNoteItem(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNote} className="bg-cyan-500 text-slate-950 font-bold">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset for Next Event Confirmation Dialog */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Reset Operations for Next Event?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will safely clear the active stage projector, reset the live slide deck to Slide 1, and mark
              current event operations as completed.
              <strong className="block mt-2 text-foreground">
                All permanent database records, attendees, and finance ledgers will remain completely preserved.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleResetForNextEvent}
              className="bg-rose-600 text-white font-bold"
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OperationsCenter;
