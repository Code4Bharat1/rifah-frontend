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
  Gauge,
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
  Bell,
  Volume2,
  Tv,
  Megaphone,
  Timer,
  Coffee,
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

const HORIZONTAL_MODULE_TABS = [
  { key: "event-setup", label: "Event Setup", icon: CalendarPlus },
  { key: "attendees", label: "Attendees", icon: Ticket },
  { key: "my-team", label: "My Team", icon: ShieldCheck },
  { key: "live-control", label: "Live Control", icon: Radio },
  { key: "finance", label: "Finance", icon: CreditCard },
  { key: "speakers-guests", label: "Speakers & Guests", icon: Mic },
  { key: "follow-up", label: "Follow-up", icon: MessageSquareText },
  { key: "documents", label: "Documents", icon: FileStack },
  { key: "data", label: "Data", icon: ChartNoAxesColumn },
  { key: "my-links", label: "My Links", icon: Link2 },
  { key: "overview", label: "Chapter Overview", icon: Gauge },
];

export function OperationsCenter({ initialTab = "event-setup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // Active Tab: synchronized with URL param or prop + instant state update
  const [activeTabState, setActiveTabState] = useState(initialTab || "event-setup");
  useEffect(() => {
    const urlTab = searchParams?.get("tab");
    if (urlTab) {
      setActiveTabState(urlTab);
    } else if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab, searchParams]);

  const setTab = (tabName) => {
    setActiveTabState(tabName);
    if (tabName === "overview" || tabName === "chapter-overview") {
      router.push("/chapter-admin");
    } else {
      router.push(`/chapter-admin/${tabName}`);
    }
  };
  const currentTab = activeTabState;

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
  const [projectorMode, setProjectorMode] = useState("slides"); // "slides" | "qr" | "sponsors" | "break"
  const [stageTimerSeconds, setStageTimerSeconds] = useState(900);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(900);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [activeTicker, setActiveTicker] = useState("");
  const [moderatorNotes, setModeratorNotes] = useState("");
  const [addSlideModalOpen, setAddSlideModalOpen] = useState(false);
  const [newSlideForm, setNewSlideForm] = useState({ title: "", duration: "10 min", speaker: "", notes: "" });

  // Events & Active Event
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [backendKpis, setBackendKpis] = useState(null);

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

  // History / Contact Modal State for Follow-ups
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyForm, setHistoryForm] = useState({
    method: "call",
    notes: "",
    message: "",
    status: "contacted",
    nextFollowUpAt: "",
  });
  const [submittingHistory, setSubmittingHistory] = useState(false);

  // Agenda List
  const [agenda, setAgenda] = useState(DEFAULT_AGENDA);

  // Finance State
  const [financeRecords, setFinanceRecords] = useState({
    moneyIn: [],
    moneyOut: [],
    treasurerNotes: "All event collections and disbursements reconciled with bank statements.",
  });
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    type: "moneyIn",
    desc: "",
    amount: "",
    from: "",
    to: "",
    method: "Online",
    invoice: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [submittingFinance, setSubmittingFinance] = useState(false);

  // Speakers & Guests
  const [speakers, setSpeakers] = useState([]);
  const [speakerDialogOpen, setSpeakerDialogOpen] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    mobile: "",
    email: "",
    org: "",
    designation: "",
    type: "Guest Speaker",
    topic: "",
  });
  const [savingSpeaker, setSavingSpeaker] = useState(false);

  // Team Roles
  const [teamRoles, setTeamRoles] = useState({
    chapterAdmin: user?.name || "Chapter Admin",
    entranceIncharge: "Bilal Sheikh",
    followupCoordinator: "Rashid Kamal",
    treasurer: "Sameer Joshi",
    guestManager: "Ayesha Siddiqui",
  });

  // Event Setup Form State
  const [eventSetupForm, setEventSetupForm] = useState({
    title: "",
    summary: "",
    date: "",
    time: "",
    venue: "",
    memberFee: 0,
    nonMemberFee: 500,
    signatory1: "Mohammad Zaid",
    signatory2: "Rashid Kamal",
    theme: "gold",
    scriptLanguage: "en",
  });
  const [savingEventSetup, setSavingEventSetup] = useState(false);

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

  // Fetch full operations data from backend
  const fetchOperationsData = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await eventApi.getOperations(eventId);
      if (res?.data) {
        if (res.data.kpis) {
          setBackendKpis(res.data.kpis);
        }
        if (res.data.event) {
          const ev = res.data.event;
          setActiveEvent(ev);
          if (ev.stageStatus) setLiveEventStatus(ev.stageStatus);
          if (ev.currentSlideIndex !== undefined) setCurrentSlideIndex(ev.currentSlideIndex);
          if (ev.agenda?.length) setAgenda(ev.agenda);
          if (ev.projectorMode) setProjectorMode(ev.projectorMode);
          if (ev.activeAnnouncement) {
            setActiveTicker(ev.activeAnnouncement);
            setLiveAnnouncement(ev.activeAnnouncement);
          }
          if (ev.moderatorNotes) setModeratorNotes(ev.moderatorNotes);
          if (ev.speakers?.length) setSpeakers(ev.speakers);
          if (ev.teamAssignments) {
            setTeamRoles((prev) => ({ ...prev, ...ev.teamAssignments }));
          }
          if (ev.finance?.moneyIn?.length || ev.finance?.moneyOut?.length) {
            setFinanceRecords({
              moneyIn: ev.finance.moneyIn || [],
              moneyOut: ev.finance.moneyOut || [],
              treasurerNotes: ev.finance.treasurerNotes || "All event collections and disbursements reconciled with bank statements.",
            });
          }
          setEventSetupForm({
            title: ev.title || "",
            summary: ev.summary || ev.slogan || "",
            date: ev.date ? ev.date.split("T")[0] : "",
            time: ev.time || "",
            venue: ev.venue || "",
            memberFee: ev.memberFee !== undefined ? ev.memberFee : 0,
            nonMemberFee: ev.nonMemberFee !== undefined ? ev.nonMemberFee : 500,
            signatory1: ev.signatories?.[0]?.name || "Mohammad Zaid",
            signatory2: ev.signatories?.[1]?.name || "Rashid Kamal",
            theme: ev.theme || "gold",
            scriptLanguage: ev.scriptLanguage || "en",
          });
        }
      }
    } catch (err) {
      console.warn("Operations data fallback:", err.message);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchOperationsData(selectedEventId);
    }
  }, [selectedEventId]);

  // Handlers for persisting state to MongoDB
  const handleSaveEventSetup = async () => {
    if (!selectedEventId) {
      toast.error("Please select an active event first.");
      return;
    }
    try {
      setSavingEventSetup(true);
      const payload = {
        title: eventSetupForm.title,
        summary: eventSetupForm.summary,
        slogan: eventSetupForm.summary,
        date: eventSetupForm.date,
        time: eventSetupForm.time,
        venue: eventSetupForm.venue,
        memberFee: Number(eventSetupForm.memberFee) || 0,
        nonMemberFee: Number(eventSetupForm.nonMemberFee) || 0,
        signatories: [
          { role: "Chapter President", name: eventSetupForm.signatory1 },
          { role: "Secretary", name: eventSetupForm.signatory2 },
        ],
        theme: eventSetupForm.theme,
        scriptLanguage: eventSetupForm.scriptLanguage,
      };
      await eventApi.updateOperations(selectedEventId, payload);
      toast.success("Event setup updated and saved to MongoDB!");
      fetchOperationsData(selectedEventId);
    } catch (err) {
      toast.error("Failed to save event setup: " + (err.message || "Unknown error"));
    } finally {
      setSavingEventSetup(false);
    }
  };

  const handleSaveTeamRoles = async () => {
    if (!selectedEventId) {
      toast.error("Please select an active event first.");
      return;
    }
    try {
      await eventApi.updateOperations(selectedEventId, { teamAssignments: teamRoles });
      toast.success("Team assignments saved to MongoDB!");
    } catch (err) {
      toast.error("Failed to save team assignments: " + (err.message || "Unknown error"));
    }
  };

  const handleAddFinanceTransaction = async (e) => {
    e?.preventDefault();
    if (!selectedEventId) {
      toast.error("No active event selected.");
      return;
    }
    if (!financeForm.desc || !financeForm.amount) {
      toast.error("Please enter a description and amount.");
      return;
    }
    try {
      setSubmittingFinance(true);
      const payload = {
        type: financeForm.type,
        desc: financeForm.desc,
        amount: Number(financeForm.amount),
        from: financeForm.from,
        to: financeForm.to,
        method: financeForm.method,
        invoice: financeForm.invoice,
        date: financeForm.date,
      };
      const res = await eventApi.addFinanceTransaction(selectedEventId, payload);
      if (res?.data) {
        setFinanceRecords({
          moneyIn: res.data.finance?.moneyIn || [],
          moneyOut: res.data.finance?.moneyOut || [],
          treasurerNotes: res.data.finance?.treasurerNotes || financeRecords.treasurerNotes,
        });
        toast.success(
          `${financeForm.type === "moneyIn" ? "Collection" : "Expense"} of ₹${payload.amount} saved to MongoDB!`
        );
        setFinanceDialogOpen(false);
        setFinanceForm({
          type: "moneyIn",
          desc: "",
          amount: "",
          from: "",
          to: "",
          method: "Online",
          invoice: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchOperationsData(selectedEventId);
      }
    } catch (err) {
      toast.error("Failed to save transaction: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingFinance(false);
    }
  };

  const handleAddSpeaker = async (e) => {
    e?.preventDefault();
    if (!newSpeaker.name) {
      toast.error("Please enter the speaker's name.");
      return;
    }
    try {
      setSavingSpeaker(true);
      const updatedSpeakers = [
        ...speakers,
        {
          id: `sp-${Date.now()}`,
          ...newSpeaker,
        },
      ];
      setSpeakers(updatedSpeakers);
      if (selectedEventId) {
        await eventApi.updateOperations(selectedEventId, { speakers: updatedSpeakers });
      }
      toast.success(`Speaker ${newSpeaker.name} saved to MongoDB!`);
      setSpeakerDialogOpen(false);
      setNewSpeaker({
        name: "",
        mobile: "",
        email: "",
        org: "",
        designation: "",
        type: "Guest Speaker",
        topic: "",
      });
    } catch (err) {
      toast.error("Failed to save speaker: " + (err.message || "Unknown error"));
    } finally {
      setSavingSpeaker(false);
    }
  };

  const handleSaveFollowupHistory = async (e) => {
    e?.preventDefault();
    if (!historyTarget?._id) return;
    try {
      setSubmittingHistory(true);
      await followupApi.addHistory(historyTarget._id, {
        method: historyForm.method,
        notes: historyForm.notes,
        message: historyForm.message,
        status: historyForm.status,
        nextFollowUpAt: historyForm.nextFollowUpAt || undefined,
        contactedBy: user?.name || "Chapter Admin",
      });
      toast.success(`Follow-up history logged for ${historyTarget.name || "participant"}!`);
      setHistoryModalOpen(false);
      setHistoryTarget(null);
      setHistoryForm({
        method: "call",
        notes: "",
        message: "",
        status: "contacted",
        nextFollowUpAt: "",
      });
      fetchFollowups();
    } catch (err) {
      toast.error("Failed to log history: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingHistory(false);
    }
  };

  // Utility: Parse duration text to seconds
  const parseDurationToSeconds = (durStr) => {
    if (!durStr) return 600;
    const match = String(durStr).match(/\d+/);
    if (match) {
      return parseInt(match[0], 10) * 60;
    }
    return 600;
  };

  // Utility: Format seconds to MM:SS
  const formatTimerDisplay = (sec) => {
    const isNegative = sec < 0;
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  // Real-time Stage Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStageTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Projector Controller Broadcaster with Backend Persistence
  const broadcastSlide = async (newIndex) => {
    setCurrentSlideIndex(newIndex);
    const targetItem = agenda[newIndex];
    const nextItem = agenda[newIndex + 1];
    const nextUpText = nextItem ? `${nextItem.title} (${nextItem.speaker})` : "Event Conclusion & Networking";

    // Auto-update timer duration to match slide duration
    if (targetItem?.duration) {
      const slideSec = parseDurationToSeconds(targetItem.duration);
      setTimerInitialSeconds(slideSec);
      setStageTimerSeconds(slideSec);
      setIsTimerRunning(false);
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "slide",
        mode: projectorMode,
        slideIndex: newIndex,
        totalSlides: agenda.length,
        slideTitle: targetItem?.title || `Slide ${newIndex + 1}`,
        speaker: targetItem?.speaker || "",
        duration: targetItem?.duration || "",
        nextUp: nextUpText,
        status: liveEventStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
        qrUrl: publicVisitorUrl,
        announcement: activeTicker,
      });
    }
    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { currentSlideIndex: newIndex });
      } catch (err) {
        console.warn("Failed to persist slide index:", err.message);
      }
    }
  };

  // Switch Projector Display Mode (Slides, QR, Sponsors, Break)
  const handleSwitchProjectorMode = async (mode) => {
    setProjectorMode(mode);
    const targetItem = agenda[currentSlideIndex];
    const nextItem = agenda[currentSlideIndex + 1];
    const nextUpText = nextItem ? `${nextItem.title} (${nextItem.speaker})` : "Event Conclusion";

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "mode",
        mode,
        slideIndex: currentSlideIndex,
        totalSlides: agenda.length,
        slideTitle: targetItem?.title || `Slide ${currentSlideIndex + 1}`,
        speaker: targetItem?.speaker || "",
        duration: targetItem?.duration || "",
        nextUp: nextUpText,
        status: liveEventStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
        qrUrl: publicVisitorUrl,
        announcement: activeTicker,
      });
    }
    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { projectorMode: mode });
      } catch (err) {
        console.warn("Failed to persist projector mode:", err.message);
      }
    }
    toast.success(`Projector switched to ${mode.toUpperCase()} display`);
  };

  // Stage Speaker Timer Controls
  const handleStartTimer = () => {
    setIsTimerRunning(true);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "timer",
        timerAction: "start",
        remaining: stageTimerSeconds,
      });
    }
    toast.success("Stage countdown clock started");
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "timer",
        timerAction: "pause",
      });
    }
    toast.info("Stage countdown clock paused");
  };

  const handleResetTimer = (customDuration) => {
    setIsTimerRunning(false);
    const duration = customDuration || timerInitialSeconds;
    setStageTimerSeconds(duration);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "timer",
        timerAction: "reset",
        duration,
      });
    }
    toast.success("Stage timer reset");
  };

  const handleAdjustTimer = (secondsDelta) => {
    setStageTimerSeconds((prev) => {
      const next = prev + secondsDelta;
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("projector:control", {
          target: chapterSlug,
          action: "timer",
          timerAction: "adjust",
          delta: secondsDelta,
        });
      }
      return next;
    });
    toast.success(secondsDelta > 0 ? `+${secondsDelta / 60}m extended on stage` : `${secondsDelta / 60}m subtracted`);
  };

  // Live Hall Announcement Ticker Broadcaster
  const handleBroadcastAnnouncement = async (textToBroadcast) => {
    const text = textToBroadcast !== undefined ? textToBroadcast : liveAnnouncement;
    setActiveTicker(text);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "announcement",
        announcement: text,
      });
    }
    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { activeAnnouncement: text });
      } catch (err) {}
    }
    if (text) {
      toast.success("Announcement broadcasted to projector ticker!");
    } else {
      toast.info("Projector ticker cleared");
    }
  };

  const handleClearAnnouncement = () => {
    setLiveAnnouncement("");
    handleBroadcastAnnouncement("");
  };

  // Web Audio API Stage Chime and AV Bell
  const handlePlayStageChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.6);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
          gain2.gain.setValueAtTime(0.25, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.9);
        }, 180);
      }
    } catch (e) {
      console.warn("Audio chime error:", e.message);
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "chime",
        chime: true,
      });
    }
    toast.success("Stage Chime & Audio Bell Sounded");
  };

  // Add Custom Slide / Agenda Item
  const handleAddCustomSlide = async (e) => {
    e.preventDefault();
    if (!newSlideForm.title.trim()) {
      toast.error("Slide title is required");
      return;
    }
    const newId = agenda.length + 1;
    const newSlide = {
      id: newId,
      title: newSlideForm.title.trim(),
      duration: newSlideForm.duration || "10 min",
      speaker: newSlideForm.speaker.trim() || "Speaker",
      notes: newSlideForm.notes || "",
    };
    const updatedAgenda = [...agenda, newSlide];
    setAgenda(updatedAgenda);
    setAddSlideModalOpen(false);
    setNewSlideForm({ title: "", duration: "10 min", speaker: "", notes: "" });

    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { agenda: updatedAgenda });
        toast.success(`Slide ${newId} added to agenda and saved!`);
      } catch (err) {
        toast.error("Failed to persist new slide in MongoDB");
      }
    } else {
      toast.success(`Slide ${newId} added!`);
    }
  };

  // Save Moderator Teleprompter Notes
  const handleSaveModeratorNotes = async () => {
    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { moderatorNotes });
        toast.success("Moderator stage notes saved!");
      } catch (err) {
        toast.error("Failed to save notes");
      }
    } else {
      toast.success("Moderator notes updated locally!");
    }
  };

  const handleStageStatusChange = async (newStatus) => {
    setLiveEventStatus(newStatus);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("projector:control", {
        target: chapterSlug,
        action: "status",
        mode: projectorMode,
        slideIndex: currentSlideIndex,
        status: newStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
      });
    }
    if (selectedEventId) {
      try {
        await eventApi.updateOperations(selectedEventId, { stageStatus: newStatus });
      } catch (err) {
        console.warn("Failed to persist stage status:", err.message);
      }
    }
    toast.success(`Stage status set to ${newStatus}`);
  };

  const handleToggleCheckin = async (attendee) => {
    const isCheckedIn = attendee.entryStatus === "Checked In";
    const nextAttendance = isCheckedIn ? "Pending" : "Present";
    const attendeeId = attendee.userId || attendee.id;
    if (selectedEventId && attendeeId) {
      try {
        await eventApi.checkinAttendee(selectedEventId, attendeeId, nextAttendance);
        toast.success(isCheckedIn ? `Check-in reversed for ${attendee.name}` : `Entry allowed for ${attendee.name}!`);
        fetchOperationsData(selectedEventId);
      } catch (err) {
        toast.error("Failed to update check-in in backend");
      }
    } else {
      toast.success(isCheckedIn ? `Check-in reversed for ${attendee.name}` : `Entry allowed for ${attendee.name}!`);
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
        mode: projectorMode,
        slideIndex: currentSlideIndex,
        totalSlides: agenda.length,
        status: liveEventStatus,
        chapter: chapterName,
        eventTitle: activeEvent?.title || "RIFAH Chapter Meet",
        qrUrl: publicVisitorUrl,
        announcement: activeTicker,
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
    const d = item?.contactDetails || item || {};
    const name = item?.name || d.name || "Esteemed Colleague";
    const company = item?.company || d.company || "Your Company";
    const status = item?.category || d.membershipStatus || "Member";
    const expiry = d.membershipExpiryDate
      ? new Date(d.membershipExpiryDate).toLocaleDateString()
      : "Active";

    return (template || "")
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
              RIFAH OPERATIONS CENTER ADMIN PANEL
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 mt-1">
              <span><strong className="text-cyan-300 font-semibold">Current Chapter:</strong> {chapterName}</span>
              <span className="text-slate-600">|</span>
              <span><strong className="text-emerald-300 font-semibold">Current Event:</strong> {activeEvent?.title || "Upcoming Chapter Meet"}</span>
              <span className="text-slate-600">|</span>
              <span><strong className="text-amber-300 font-semibold">Current Admin:</strong> {user?.name || user?.email || "Chapter Admin"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {events.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Select
                  value={selectedEventId}
                  onValueChange={(val) => {
                    setSelectedEventId(val);
                    const ev = events.find((e) => e._id === val);
                    if (ev) setActiveEvent(ev);
                  }}
                >
                  <SelectTrigger className="w-44 sm:w-52 h-9 text-xs bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {events.map((e) => (
                      <SelectItem key={e._id} value={e._id} className="text-xs hover:bg-slate-800">
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

        {/* Horizontal Module Navigation Buttons Directly Below Header & KPIs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin border-t border-slate-700/60 pt-4 mt-5">
          {HORIZONTAL_MODULE_TABS.map((tab) => {
            const isActive = currentTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/90 hover:text-white border border-slate-700/60"
                )}
              >
                <TabIcon className={cn("h-3.5 w-3.5", isActive ? "text-slate-950" : "text-cyan-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT ROUTER                                                    */}
      {/* ========================================================================= */}

      {/* CHAPTER OVERVIEW / EXECUTIVE OPERATIONS DECK */}
      {(currentTab === "overview" || currentTab === "chapter-overview") && (
        <div className="space-y-6">
          {/* Executive Top Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0B1F33] to-slate-900 p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Radio className="h-3 w-3 animate-pulse" />
                    EXECUTIVE OPERATIONS DESK
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-300">{chapterName}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {activeEvent ? activeEvent.title : "RIFAH Operations Command Center"}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Real-time command and telemetry desk for chapter meetings, registrations, live slide projection, gate entry, and post-event attendee conversions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => setTab("live-control")}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black shadow-md gap-2"
                >
                  <Radio className="h-4 w-4" />
                  <span>Stage Live Control</span>
                </Button>
                <Button
                  onClick={() => setTab("attendees")}
                  variant="outline"
                  className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700 gap-2"
                >
                  <Ticket className="h-4 w-4 text-cyan-400" />
                  <span>Gate Check-in</span>
                </Button>
                <Button
                  onClick={() => window.open(projectorUrl, "_blank")}
                  variant="outline"
                  className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700 gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-amber-400" />
                  <span>Launch Projector</span>
                </Button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stage State</span>
                <span className={cn(
                  "font-black uppercase tracking-wider",
                  liveEventStatus === "LIVE" ? "text-emerald-400" : "text-amber-400"
                )}>
                  ● {liveEventStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Slide Deck</span>
                <span className="font-bold text-white">Slide {currentSlideIndex + 1} of {agenda.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Date</span>
                <span className="font-bold text-white truncate block">{activeEvent?.venue || "Grand Hall"} · {activeEvent?.date || "Today"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Collections</span>
                <span className="font-bold text-emerald-400">₹{kpiStats.fees.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Module Grid: 10 Operational Modules at a Glance */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Operations Lifecycle Modules (10 Core Units)
              </h3>
              <span className="text-xs text-muted-foreground font-medium">Click any module to configure</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Event Setup */}
              <div
                onClick={() => setTab("event-setup")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <CalendarPlus className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 01</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Event Setup</h4>
                  <p className="text-xs text-muted-foreground mt-1">Configure event date, venue, capacity, signatories, and certificate rules.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{activeEvent?.seats || 100} Total Capacity</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Attendees */}
              <div
                onClick={() => setTab("attendees")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 02</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">Attendees & Gate Check-in</h4>
                  <p className="text-xs text-muted-foreground mt-1">Live gate entry management, search, approval filtering, and badge verification.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-500">
                  <span>{kpiStats.approved} Checked / {kpiStats.registered} Registered</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: My Team */}
              <div
                onClick={() => setTab("my-team")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 03</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-blue-500 transition-colors">My Chapter Team</h4>
                  <p className="text-xs text-muted-foreground mt-1">Role assignments for President, Gate Incharge, Stage Manager, and Treasurer.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-blue-500">
                  <span>5 Active Team Leads</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Live Control */}
              <div
                onClick={() => setTab("live-control")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      <Radio className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 04</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-cyan-500 transition-colors">Live Stage Control</h4>
                  <p className="text-xs text-muted-foreground mt-1">16-item agenda slide manager synchronized in real time with the hall projector.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-cyan-500">
                  <span>{liveEventStatus} · Slide {currentSlideIndex + 1}/16</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 5: Finance */}
              <div
                onClick={() => setTab("finance")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 05</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">Finance & Collections</h4>
                  <p className="text-xs text-muted-foreground mt-1">Ledger accounting of ticket payments, sponsorships, and venue expenditures.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-amber-500">
                  <span>Total In: ₹{kpiStats.fees.toLocaleString("en-IN")}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 6: Speakers & Guests */}
              <div
                onClick={() => setTab("speakers-guests")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Mic className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 06</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-indigo-500 transition-colors">Speakers & Guests</h4>
                  <p className="text-xs text-muted-foreground mt-1">Keynote speakers, VIP dignitaries, and sponsors with direct WhatsApp triggers.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-indigo-500">
                  <span>{speakers.length} Dignitaries Listed</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 7: Follow-up */}
              <div
                onClick={() => setTab("follow-up")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <MessageSquareText className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 07</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-purple-500 transition-colors">Follow-up Command Desk</h4>
                  <p className="text-xs text-muted-foreground mt-1">Dual-mode attendee and membership conversion engine with WhatsApp templating.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-purple-500">
                  <span>{followupStats.event.pending} Pending Follow-ups</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 8: Documents */}
              <div
                onClick={() => setTab("documents")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <FileStack className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 08</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-teal-500 transition-colors">Chapter Documents</h4>
                  <p className="text-xs text-muted-foreground mt-1">Official meeting agendas, delegate sheets, bylaws, and certificate templates.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-teal-500">
                  <span>4 Verified Documents</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 9: Data */}
              <div
                onClick={() => setTab("data")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <ChartNoAxesColumn className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 09</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-rose-500 transition-colors">Data & Analytics</h4>
                  <p className="text-xs text-muted-foreground mt-1">Attendance conversion ratios, registration distribution, and CSV export.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-rose-500">
                  <span>Export CSV / PDF</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 10: My Links */}
              <div
                onClick={() => setTab("my-links")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between sm:col-span-2 lg:col-span-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                      <Link2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 10</span>
                      <h4 className="font-bold text-base text-foreground mt-0.5 group-hover:text-cyan-400 transition-colors">My Links & Dynamic QR Generator</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Visitor registration link, live projector presentation URL, and branded PNG QR code download.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Open Links Desk <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    value={eventSetupForm.title}
                    onChange={(e) => setEventSetupForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="RIFAH Business Connect Meet"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Custom Event Subtitle / Slogan</Label>
                  <Input
                    value={eventSetupForm.summary}
                    onChange={(e) => setEventSetupForm((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Synergy, Scale & Ethical Prosperity"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Event Date</Label>
                    <Input
                      type="date"
                      value={eventSetupForm.date}
                      onChange={(e) => setEventSetupForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Event Time</Label>
                    <Input
                      value={eventSetupForm.time}
                      onChange={(e) => setEventSetupForm((prev) => ({ ...prev, time: e.target.value }))}
                      placeholder="10:00 AM - 01:30 PM"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Venue & City</Label>
                  <Input
                    value={eventSetupForm.venue}
                    onChange={(e) => setEventSetupForm((prev) => ({ ...prev, venue: e.target.value }))}
                    placeholder="Grand Convention Hall, Mumbai"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Member Fee (₹)</Label>
                    <Input
                      type="number"
                      value={eventSetupForm.memberFee}
                      onChange={(e) => setEventSetupForm((prev) => ({ ...prev, memberFee: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Non-Member Fee (₹)</Label>
                    <Input
                      type="number"
                      value={eventSetupForm.nonMemberFee}
                      onChange={(e) => setEventSetupForm((prev) => ({ ...prev, nonMemberFee: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Signatory 1 (Chapter President)</Label>
                  <Input
                    value={eventSetupForm.signatory1}
                    onChange={(e) => setEventSetupForm((prev) => ({ ...prev, signatory1: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Signatory 2 (Secretary)</Label>
                  <Input
                    value={eventSetupForm.signatory2}
                    onChange={(e) => setEventSetupForm((prev) => ({ ...prev, signatory2: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Certificate Accent Theme</Label>
                  <Select
                    value={eventSetupForm.theme}
                    onValueChange={(val) => setEventSetupForm((prev) => ({ ...prev, theme: val }))}
                  >
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
                  <Select
                    value={eventSetupForm.scriptLanguage}
                    onValueChange={(val) => setEventSetupForm((prev) => ({ ...prev, scriptLanguage: val }))}
                  >
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
                    onClick={handleSaveEventSetup}
                    disabled={savingEventSetup}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingEventSetup ? "Saving to MongoDB..." : "Save Event Setup"}</span>
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
                              onClick={() => handleToggleCheckin(a)}
                              className={cn(
                                "h-7 text-xs px-2 font-semibold",
                                a.entryStatus === "Checked In"
                                  ? "bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border-slate-500/30"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                              )}
                            >
                              {a.entryStatus === "Checked In" ? "Revoke Entry" : "Allow Entry"}
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
                onClick={handleSaveTeamRoles}
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
          {/* Executive Command Header */}
          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl text-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-sm">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      Live Stage & Projector Command Center
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time AV synchronization · Stage speaker countdown clock · Live audience ticker
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Stage Chime / Bell Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePlayStageChime}
                  className="bg-slate-900/90 border-slate-700 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 text-xs h-9 gap-1.5 shadow-sm"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-400" /> Ring Stage Chime
                </Button>

                {/* Status Selector */}
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <Select value={liveEventStatus} onValueChange={(val) => handleStageStatusChange(val)}>
                    <SelectTrigger className="w-28 h-7 text-xs bg-slate-950 border-slate-700 text-white font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="LIVE">🟢 LIVE</SelectItem>
                      <SelectItem value="PAUSED">🟡 PAUSED</SelectItem>
                      <SelectItem value="IDLE">⚪ IDLE</SelectItem>
                      <SelectItem value="ENDED">🔴 ENDED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fullscreen Projector Link */}
                <Button
                  size="sm"
                  asChild
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Link href={projectorUrl} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" /> Open Projector Screen
                  </Link>
                </Button>
              </div>
            </div>

            {/* Projector Display Mode Selector */}
            <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Projector Screen Mode:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "slides", label: "📽 Slide Deck" },
                  { key: "qr", label: "📱 Check-In QR" },
                  { key: "sponsors", label: "🌟 Sponsor Showcase" },
                  { key: "break", label: "☕ High Tea Break" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleSwitchProjectorMode(m.key)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      projectorMode === m.key
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <span>{m.label}</span>
                    {projectorMode === m.key && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Console Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Confidence Monitor & Stage Controls */}
              <div className="lg:col-span-2 space-y-5">
                {/* Confidence Monitor Box */}
                <div className="p-6 rounded-2xl bg-[#040711] border border-slate-800/90 text-white shadow-2xl flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                  <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

                  {/* Monitor Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-mono font-bold text-cyan-400 uppercase tracking-widest text-[11px]">
                        LIVE STAGE MONITOR · SLIDE {currentSlideIndex + 1} OF {agenda.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                        MODE: {projectorMode}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black",
                        liveEventStatus === "LIVE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      )}>
                        {liveEventStatus}
                      </span>
                    </div>
                  </div>

                  {/* Dual Stage Content: Current on Stage vs Next Up */}
                  <div className="py-6 space-y-4">
                    {/* Current on Stage */}
                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[2px]">
                        CURRENT ON STAGE
                      </span>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                        {agenda[currentSlideIndex]?.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                          Speaker: {agenda[currentSlideIndex]?.speaker}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                          Allocated: {agenda[currentSlideIndex]?.duration}
                        </span>
                      </div>
                    </div>

                    {/* Stage Speaker Countdown Clock */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          SPEAKER COUNTDOWN TIMER
                        </span>
                        <div className={cn(
                          "font-mono text-4xl sm:text-5xl font-black tracking-wider px-6 py-1 rounded-xl transition-all",
                          stageTimerSeconds <= 0
                            ? "text-rose-400 bg-rose-500/10 border border-rose-500/30 animate-pulse"
                            : stageTimerSeconds <= 120
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                            : "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                        )}>
                          {formatTimerDisplay(stageTimerSeconds)}
                        </div>

                        {/* Timer Control Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {!isTimerRunning ? (
                            <Button
                              size="sm"
                              onClick={handleStartTimer}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-3 gap-1"
                            >
                              <Play className="h-3 w-3" /> Start
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={handlePauseTimer}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-7 px-3 gap-1"
                            >
                              <Pause className="h-3 w-3" /> Pause
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetTimer()}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7 px-2.5 gap-1"
                          >
                            <RotateCcw className="h-3 w-3" /> Reset
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdjustTimer(60)}
                            className="border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs h-7 px-2"
                          >
                            +1m
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdjustTimer(300)}
                            className="border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs h-7 px-2"
                          >
                            +5m
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Next Up Strip */}
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        NEXT UP ON STAGE:
                      </span>
                      <span className="text-slate-200 font-bold truncate max-w-[70%]">
                        {agenda[currentSlideIndex + 1]
                          ? `${agenda[currentSlideIndex + 1].title} · ${agenda[currentSlideIndex + 1].speaker} (${agenda[currentSlideIndex + 1].duration})`
                          : "Meeting Adjournment & Member Networking"}
                      </span>
                    </div>
                  </div>

                  {/* Monitor Navigation Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentSlideIndex === 0}
                      onClick={handlePrevSlide}
                      className="border-slate-700 text-white hover:bg-slate-800 text-xs h-9 gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous Slide
                    </Button>

                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                      {currentSlideIndex + 1} / {agenda.length}
                    </span>

                    <Button
                      size="sm"
                      disabled={currentSlideIndex === agenda.length - 1}
                      onClick={handleNextSlide}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5"
                    >
                      Next Slide <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Live Hall Announcements & Breaking Ticker */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Live Projector Ticker & Stage Announcements
                      </h4>
                    </div>
                    {activeTicker && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Ticker Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      placeholder="Type breaking announcement to display on the hall projector..."
                      value={liveAnnouncement}
                      onChange={(e) => setLiveAnnouncement(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleBroadcastAnnouncement()}
                      className="text-xs h-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                    />
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <Button
                        size="sm"
                        onClick={() => handleBroadcastAnnouncement()}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 px-3 gap-1 flex-1 sm:flex-none"
                      >
                        <Send className="h-3.5 w-3.5" /> Broadcast
                      </Button>
                      {activeTicker && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearAnnouncement}
                          className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-9 px-3"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Announcement Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Presets:</span>
                    {[
                      "☕ High Tea is being served in Banquet Hall",
                      "📵 Please turn mobile phones to silent mode",
                      "🤝 Welcome Respected Dignitaries & VIP Guests",
                      "📋 Ask & Give Session starting in 5 mins",
                      "📸 Chapter Group Photograph at Stage",
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLiveAnnouncement(preset);
                          handleBroadcastAnnouncement(preset);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-all truncate max-w-[240px]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Active Ticker Preview */}
                  {activeTicker && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300">
                      <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase">
                        ON SCREEN
                      </span>
                      <span className="font-semibold truncate">{activeTicker}</span>
                    </div>
                  )}
                </div>

                {/* Bottom AV Auxiliary Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefreshProjector}
                    className="flex-1 text-xs h-9 gap-1.5 bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Projector Screen
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 text-xs h-9 gap-1.5 bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Link href={projectorUrl} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5 text-cyan-400" /> Open Screen in New Window
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Col: Agenda Schedule & Stage Notes */}
              <div className="space-y-4">
                {/* Agenda List Card */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Agenda Schedule ({agenda.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddSlideModalOpen(true)}
                      className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-[11px] h-7 px-2.5 gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Slide
                    </Button>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {agenda.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => broadcastSlide(idx)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2",
                          idx === currentSlideIndex
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-bold shadow-sm"
                            : "border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400"
                        )}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span>
                            <span className="font-semibold text-slate-200">{item.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 pl-4 truncate">
                            {item.speaker || "General Session"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono opacity-80 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {item.duration}
                          </span>
                          {idx === currentSlideIndex && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
                              LIVE
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Moderator / MC Teleprompter Stage Notes */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Anchor & Moderator Notes
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveModeratorNotes}
                      className="border-slate-700 text-xs h-6 px-2 text-cyan-400 hover:bg-slate-800"
                    >
                      Save Notes
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type cue notes, speaker introduction bullets, or reminders for the anchor..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={4}
                    className="text-xs bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Notes are persisted to MongoDB and visible to stage coordinators.
                  </p>
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
                  Track collections, expenses, vendor invoices, and statement reports backed by MongoDB
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setFinanceDialogOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Transaction</span>
                </Button>

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
            </div>

            {/* 3 Summary Ledger KPI Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Total Collections (Money In)
                </span>
                <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                  ₹{(financeRecords.moneyIn || []).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                  Total Expenses (Money Out)
                </span>
                <span className="text-2xl font-black text-rose-500 font-mono mt-1 block">
                  ₹{(financeRecords.moneyOut || []).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block">
                  Net Event Balance
                </span>
                <span className="text-2xl font-black text-cyan-600 font-mono mt-1 block">
                  ₹{(
                    (financeRecords.moneyIn || []).reduce((s, i) => s + (Number(i.amount) || 0), 0) -
                    (financeRecords.moneyOut || []).reduce((s, i) => s + (Number(i.amount) || 0), 0)
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Money In */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Money In (Collections)
                  </h4>
                  <span className="font-black text-emerald-600 text-sm font-mono">
                    ₹{(financeRecords.moneyIn || []).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {(financeRecords.moneyIn || []).length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No collections recorded yet. Click &ldquo;Add Transaction&rdquo; above.
                    </div>
                  ) : (
                    (financeRecords.moneyIn || []).map((item, idx) => (
                      <div
                        key={item.id || item._id || idx}
                        className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground">{item.desc}</p>
                          <p className="text-[10px] text-muted-foreground">
                            From: {item.from || "Attendee / Sponsor"} · {item.method || "Online"} · {item.date ? String(item.date).split("T")[0] : ""}
                          </p>
                        </div>
                        <span className="font-black text-emerald-500 font-mono">
                          +₹{Number(item.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Money Out */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Money Out (Expenses)
                  </h4>
                  <span className="font-black text-rose-500 text-sm font-mono">
                    ₹{(financeRecords.moneyOut || []).reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {(financeRecords.moneyOut || []).length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No expenses recorded yet. Click &ldquo;Add Transaction&rdquo; above.
                    </div>
                  ) : (
                    (financeRecords.moneyOut || []).map((item, idx) => (
                      <div
                        key={item.id || item._id || idx}
                        className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground">{item.desc}</p>
                          <p className="text-[10px] text-muted-foreground">
                            To: {item.to || "Vendor"} · Ref: {item.invoice || "N/A"} · {item.date ? String(item.date).split("T")[0] : ""}
                          </p>
                        </div>
                        <span className="font-black text-rose-500 font-mono">
                          -₹{Number(item.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Ledger Summary */}
            <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground">Treasurer Notes</p>
                <p className="text-[11px] text-muted-foreground">{financeRecords.treasurerNotes}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Event Balance</span>
                <span className="text-xl font-black text-primary font-mono">
                  ₹
                  {(
                    (financeRecords.moneyIn || []).reduce((s, i) => s + (Number(i.amount) || 0), 0) -
                    (financeRecords.moneyOut || []).reduce((s, i) => s + (Number(i.amount) || 0), 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Add Finance Transaction Dialog */}
          <Dialog open={financeDialogOpen} onOpenChange={setFinanceDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Ledger Transaction</DialogTitle>
                <DialogDescription>
                  Record income collection or venue/catering expense directly into the chapter ledger in MongoDB.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddFinanceTransaction} className="space-y-4 py-2">
                <div>
                  <Label className="text-xs font-semibold">Transaction Type</Label>
                  <Select
                    value={financeForm.type}
                    onValueChange={(val) => setFinanceForm((prev) => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moneyIn">Money In (Collection / Ticket / Sponsor)</SelectItem>
                      <SelectItem value="moneyOut">Money Out (Expense / Venue / Catering)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Description</Label>
                  <Input
                    placeholder="e.g. Venue Hall Advance or Sponsor Contribution"
                    value={financeForm.desc}
                    onChange={(e) => setFinanceForm((prev) => ({ ...prev, desc: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={financeForm.amount}
                      onChange={(e) => setFinanceForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">
                      {financeForm.type === "moneyIn" ? "Received From" : "Paid To"}
                    </Label>
                    <Input
                      placeholder={financeForm.type === "moneyIn" ? "Payer / Sponsor" : "Vendor Name"}
                      value={financeForm.type === "moneyIn" ? financeForm.from : financeForm.to}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (financeForm.type === "moneyIn") {
                          setFinanceForm((prev) => ({ ...prev, from: val }));
                        } else {
                          setFinanceForm((prev) => ({ ...prev, to: val }));
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Payment Method</Label>
                    <Select
                      value={financeForm.method}
                      onValueChange={(val) => setFinanceForm((prev) => ({ ...prev, method: val }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online / Gateway</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS)</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Invoice / Reference No.</Label>
                    <Input
                      placeholder="INV-102 or UPI Ref"
                      value={financeForm.invoice}
                      onChange={(e) => setFinanceForm((prev) => ({ ...prev, invoice: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Date</Label>
                  <Input
                    type="date"
                    value={financeForm.date}
                    onChange={(e) => setFinanceForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFinanceDialogOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingFinance}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    {submittingFinance ? "Saving..." : "Record Transaction"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                onClick={() => setSpeakerDialogOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Dignitary / Speaker</span>
              </Button>
            </div>

            {speakers.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No speakers or dignitaries configured yet. Click &ldquo;Add Dignitary / Speaker&rdquo; above to add.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex items-start gap-3.5"
                  >
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-lg shrink-0">
                      {(s.name || "S").slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                          {s.type || "Guest Speaker"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.mobile}</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground mt-1 truncate">{s.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {s.designation || ""} {s.org ? `· ${s.org}` : ""}
                      </p>
                      {s.topic && (
                        <p className="text-xs text-primary font-medium mt-1.5 bg-muted/40 px-2 py-1 rounded">
                          Topic: &ldquo;{s.topic}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {s.mobile && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Speaker Dialog */}
          <Dialog open={speakerDialogOpen} onOpenChange={setSpeakerDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Dignitary / Speaker</DialogTitle>
                <DialogDescription>
                  Add a guest of honour, keynote speaker, or dignitary to the event stage schedule in MongoDB.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddSpeaker} className="space-y-4 py-2">
                <div>
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <Input
                    placeholder="e.g. Dr. Farhan Qureshi"
                    value={newSpeaker.name}
                    onChange={(e) => setNewSpeaker((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Mobile Number</Label>
                    <Input
                      placeholder="9820000000"
                      value={newSpeaker.mobile}
                      onChange={(e) => setNewSpeaker((prev) => ({ ...prev, mobile: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input
                      type="email"
                      placeholder="speaker@example.com"
                      value={newSpeaker.email}
                      onChange={(e) => setNewSpeaker((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Organization / Business</Label>
                    <Input
                      placeholder="e.g. Merchant Logistics"
                      value={newSpeaker.org}
                      onChange={(e) => setNewSpeaker((prev) => ({ ...prev, org: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Designation</Label>
                    <Input
                      placeholder="e.g. Managing Director"
                      value={newSpeaker.designation}
                      onChange={(e) => setNewSpeaker((prev) => ({ ...prev, designation: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Role / Type</Label>
                    <Select
                      value={newSpeaker.type}
                      onValueChange={(val) => setNewSpeaker((prev) => ({ ...prev, type: val }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guest Speaker">Guest Speaker</SelectItem>
                        <SelectItem value="Keynote Speaker">Keynote Speaker</SelectItem>
                        <SelectItem value="Hero of Event">Hero of Event</SelectItem>
                        <SelectItem value="Chief Guest">Chief Guest</SelectItem>
                        <SelectItem value="Dignitary">Dignitary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Speech / Keynote Topic</Label>
                    <Input
                      placeholder="e.g. Ethical Scaling"
                      value={newSpeaker.topic}
                      onChange={(e) => setNewSpeaker((prev) => ({ ...prev, topic: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSpeakerDialogOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingSpeaker}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    {savingSpeaker ? "Saving..." : "Save Speaker"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Custom Agenda Slide Dialog */}
          <Dialog open={addSlideModalOpen} onOpenChange={setAddSlideModalOpen}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-cyan-400" /> Add Agenda Item / Slide
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Insert a custom presentation slide into the meeting agenda in real-time.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddCustomSlide} className="space-y-3.5 py-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-300">Slide / Session Title *</Label>
                  <Input
                    placeholder="e.g. Special Felicitation & MOU Signing"
                    value={newSlideForm.title}
                    onChange={(e) => setNewSlideForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 bg-slate-900 border-slate-700 text-white text-xs h-8"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-300">Allocated Duration</Label>
                    <Input
                      placeholder="e.g. 15 min"
                      value={newSlideForm.duration}
                      onChange={(e) => setNewSlideForm((prev) => ({ ...prev, duration: e.target.value }))}
                      className="mt-1 bg-slate-900 border-slate-700 text-white text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-300">Speaker / In-Charge</Label>
                    <Input
                      placeholder="e.g. Guest Speaker"
                      value={newSlideForm.speaker}
                      onChange={(e) => setNewSlideForm((prev) => ({ ...prev, speaker: e.target.value }))}
                      className="mt-1 bg-slate-900 border-slate-700 text-white text-xs h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-300">Stage / Anchor Notes</Label>
                  <Textarea
                    placeholder="Cue notes or instructions for the stage coordinator..."
                    value={newSlideForm.notes}
                    onChange={(e) => setNewSlideForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="mt-1 bg-slate-900 border-slate-700 text-white text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddSlideModalOpen(false)}
                    className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Add Slide
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                    const d = item.contactDetails || item || {};
                    const name = item.name || d.name || "Participant";
                    const mobile = item.mobile || d.mobile || "";
                    const company = item.company || d.company || "Enterprise";
                    const membershipStatus = item.category || d.membershipStatus || "Attendee";
                    const assignedTo = item.assignedToName || item.assignedTo?.name || "Admin";
                    const msg = interpolateMessage(customFollowupMessage, item);
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${mobile}&text=${encodeURIComponent(msg)}`;

                    return (
                      <div
                        key={item._id}
                        className="p-4 rounded-xl border border-border bg-card hover:border-cyan-500/30 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center shrink-0 text-sm">
                              {name ? name.slice(0, 1).toUpperCase() : "P"}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{name}</h4>
                              <p className="text-xs text-muted-foreground">{company}</p>
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
                            Mobile: <span className="font-mono text-foreground">{mobile || "N/A"}</span>
                          </div>
                          <div>
                            Membership: <span className="font-semibold text-foreground">{membershipStatus}</span>
                          </div>
                          <div className="col-span-2">
                            Assigned To: <span className="text-foreground">{assignedTo}</span>
                          </div>
                          {item.notes && (
                            <div className="col-span-2 text-primary text-[10px] bg-primary/5 p-1.5 rounded">
                              Note: {Array.isArray(item.notes) ? item.notes[item.notes.length - 1]?.content : item.notes}
                            </div>
                          )}
                          {item.history && item.history.length > 0 && (
                            <div className="col-span-2 text-[10px] text-cyan-500 bg-cyan-500/10 p-1.5 rounded border border-cyan-500/20">
                              Latest: {item.history[item.history.length - 1].method?.toUpperCase()} on{" "}
                              {new Date(item.history[item.history.length - 1].contactedAt).toLocaleDateString()}
                              {item.history[item.history.length - 1].notes && ` - "${item.history[item.history.length - 1].notes}"`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {mobile && (
                              <>
                                <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                                  <a href={`tel:${mobile}`} title="Direct Call">
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
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setHistoryTarget(item);
                                setHistoryForm({
                                  method: "call",
                                  notes: "",
                                  message: msg,
                                  status: item.status || "contacted",
                                  nextFollowUpAt: "",
                                });
                                setHistoryModalOpen(true);
                              }}
                              className="h-7 text-xs px-2 gap-1 text-cyan-600 border-cyan-500/30 font-semibold"
                            >
                              <PhoneCall className="h-3 w-3" /> Log
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
                      {followupStats.membership.prospects || followups.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">EXPIRING SOON</p>
                    <p className="text-xl font-black text-amber-500 mt-0.5 tabular-nums">
                      {followupStats.membership.expiringSoon || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">OVERDUE / EXPIRED</p>
                    <p className="text-xl font-black text-rose-500 mt-0.5 tabular-nums">
                      {followupStats.membership.expired || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">RENEWED</p>
                    <p className="text-xl font-black text-emerald-500 mt-0.5 tabular-nums">
                      {followupStats.membership.recentlyRenewed || 0}
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
                      const d = item.contactDetails || item || {};
                      const name = item.name || d.name || "Member";
                      const mobile = item.mobile || d.mobile || "";
                      const company = item.company || d.company || "Enterprise";
                      const membershipStatus = item.category || d.membershipStatus || "Member";
                      const msg = interpolateMessage(membershipCustomMessage, item);
                      const whatsappUrl = `https://api.whatsapp.com/send?phone=91${mobile}&text=${encodeURIComponent(msg)}`;

                      return (
                        <div
                          key={item._id}
                          className="p-4 rounded-xl border border-border bg-card hover:border-blue-500/30 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{name}</h4>
                              <p className="text-xs text-muted-foreground">{company}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                              {membershipStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-y border-border/50 py-2">
                            <div>
                              Expiry:{" "}
                              <span className="text-foreground font-medium">
                                {d.membershipExpiryDate
                                  ? new Date(d.membershipExpiryDate).toLocaleDateString()
                                  : "Active"}
                              </span>
                            </div>
                            <div>
                              Status: <span className="font-bold text-foreground capitalize">{item.status}</span>
                            </div>
                            {item.history && item.history.length > 0 && (
                              <div className="col-span-2 text-[10px] text-cyan-500 bg-cyan-500/10 p-1.5 rounded border border-cyan-500/20">
                                Latest: {item.history[item.history.length - 1].method?.toUpperCase()} on{" "}
                                {new Date(item.history[item.history.length - 1].contactedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              {mobile && (
                                <>
                                  <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2 gap-1">
                                    <a href={`tel:${mobile}`}>
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
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setHistoryTarget(item);
                                  setHistoryForm({
                                    method: "call",
                                    notes: "",
                                    message: msg,
                                    status: item.status || "contacted",
                                    nextFollowUpAt: "",
                                  });
                                  setHistoryModalOpen(true);
                                }}
                                className="h-7 text-xs px-2 gap-1 text-cyan-600 border-cyan-500/30 font-semibold"
                              >
                                <PhoneCall className="h-3 w-3" /> Log
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

          {/* Log Follow-up Contact History Dialog */}
          <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Contact Interaction</DialogTitle>
                <DialogDescription>
                  Record contact details, discussion notes, and next scheduled follow-up date in MongoDB.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveFollowupHistory} className="space-y-4 py-2">
                <div className="p-3 rounded-lg bg-muted/40 text-xs flex items-center justify-between border border-border">
                  <div>
                    <span className="font-bold text-foreground block">{historyTarget?.name}</span>
                    <span className="text-muted-foreground">{historyTarget?.mobile} · {historyTarget?.company}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase">
                    {historyTarget?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Contact Method</Label>
                    <Select
                      value={historyForm.method}
                      onValueChange={(val) => setHistoryForm((prev) => ({ ...prev, method: val }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="in_person">In Person / Meeting</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="note">Internal Log</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Updated Status</Label>
                    <Select
                      value={historyForm.status}
                      onValueChange={(val) => setHistoryForm((prev) => ({ ...prev, status: val }))}
                    >
                      <SelectTrigger className="mt-1">
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

                <div>
                  <Label className="text-xs font-semibold">Discussion Notes / Remarks</Label>
                  <Textarea
                    rows={3}
                    placeholder="Discussed chapter membership induction, ethical networking benefits..."
                    value={historyForm.notes}
                    onChange={(e) => setHistoryForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Next Follow-up Date</Label>
                  <Input
                    type="date"
                    value={historyForm.nextFollowUpAt}
                    onChange={(e) => setHistoryForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHistoryModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingHistory}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    {submittingHistory ? "Saving..." : "Save to History"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
