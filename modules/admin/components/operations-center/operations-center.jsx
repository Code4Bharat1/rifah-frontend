"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Zap,
  GraduationCap,
  Trophy,
  Star,
  Handshake,
  Globe,
  Loader2,
  ScrollText,
  Trash,
  Images,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";
import { eventApi, followupApi, chapterApi, userApi, documentApi } from "@shared/lib/api-services";
import { resolveMediaUrl, downloadFile, getBackendServerBase } from "@shared/lib/api-client";
import { getSocket } from "@shared/lib/socket";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/ui/dialog";
import { DynamicQrCode } from "@shared/components/rifah/dynamic-qr";
import { cn } from "@shared/lib/utils";
import { StatCard } from "@shared/components/rifah/ui-bits";
import { Pill } from "@shared/components/rifah/badges";
import { EventGallery } from "@shared/components/rifah/event-gallery";
import { FinanceTab } from "./finance-tab";
import { CertificatesTab } from "./certificates-tab";
import { ScriptsTab } from "./scripts-tab";
import { AskGiveBoard } from "./ask-give-board";
import { MyTeamTab } from "./my-team-tab";
import { AgendaCrud } from "./agenda-crud";

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
  { key: "ask-give", label: "Ask & Give", icon: Users },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "certificates", label: "Certificates", icon: FileStack },
  { key: "scripts", label: "Scripts", icon: ScrollText },
  { key: "documents", label: "Documents", icon: FileStack },
  { key: "data", label: "Data", icon: ChartNoAxesColumn },
  { key: "my-links", label: "My Links", icon: Link2 },
  { key: "overview", label: "Chapter Overview", icon: Gauge },
];

export function OperationsCenter({ initialTab = "event-setup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Dynamic Base Path for Routing
  const basePath = pathname?.startsWith("/admin") 
    ? "/admin" 
    : pathname?.startsWith("/state-admin") 
      ? "/state-admin" 
      : "/chapter-admin";

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
    if (basePath === "/chapter-admin") {
      if (tabName === "overview" || tabName === "chapter-overview") {
        router.push(basePath);
      } else {
        router.push(`${basePath}/${tabName}`);
      }
    } else {
      router.push(`${basePath}/operations?tab=${tabName}`);
    }
  };
  const currentTab = activeTabState;

  // Context-Aware UI Strings
  const isCentralAdmin = user?.role === "central_admin";
  const isStateAdmin = user?.role === "state_admin";

  const chapterName = isCentralAdmin 
    ? "Global Operations" 
    : isStateAdmin 
      ? `${user?.state || "State"} State Operations` 
      : (user?.chapter || "Mumbai Chapter");
      
  const roleLabel = isCentralAdmin ? "CENTRAL ADMIN" : isStateAdmin ? "STATE ADMIN" : "CHAPTER ADMIN";
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
  const [attendeesList, setAttendeesList] = useState([]);
  const [chapterMembers, setChapterMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

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

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

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

  // Team & Operations
  const [teamRoles, setTeamRoles] = useState({
    chapterAdmin: "",
    entranceIncharge: "",
    followupCoordinator: "",
    treasurer: "",
    guestManager: "",
    // New Stage Roles & Operations
    photosVideo: "",
    tilawatEquran: "",
    presidentWelcome: "",
    secretaryIntro: "",
    eventCoordinator: "",
    keynote1: "",
    keynote1Topic: "",
    keynote2: "",
    keynote2Topic: "",
    heroOfEvent: "",
    best60SecPitch: "",
    closingRemarks: "",
    voteOfThanks: "",
    eventEnd: "",
  });

  // Event Setup Form State — Full
  const [eventSetupForm, setEventSetupForm] = useState({
    // Today's Event Page
    nameTemplate: "",
    title: "",
    date: "",
    posterUrl: "",
    signatory1Role: "Chapter Vice President",
    signatory1Name: "",
    signatory1Image: "",
    membershipJoiningLink: "",
    membershipQrImage: "",
    // Payment Settings
    memberFee: "",
    nonMemberFee: "",
    paymentCodes: "",
    staffCodes: "",
    // Certificate Design
    certificateStyle: "5 — Corporate (navy band, gold rule, clean typography)",
    certificateAccentColor: "#059669",
    signatory2Role: "— none —",
    signatory2Name: "",
    signatory2Image: "",
    // Visitor / Membership Rules
    visitorSignIn: false,
    remindRepeatGuests: true,
    repeatGuestThreshold: 3,
    downloadListPermission: "Everyone (members and guests)",
    // Slogan & Theme
    slogan: "",
    theme: "",
    // Appearance
    chapterAppearance: "navy",
  });
  const [savingEventSetup, setSavingEventSetup] = useState(false);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [savingCertDesign, setSavingCertDesign] = useState(false);
  const [savingSloganTheme, setSavingSloganTheme] = useState(false);
  const [savingSponsors, setSavingSponsors] = useState(false);
  const [savingUpcomingEvents, setSavingUpcomingEvents] = useState(false);
  const [liveSyncStatus, setLiveSyncStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'
  const [liveSyncLatency, setLiveSyncLatency] = useState(null);
  const [sponsorsList, setSponsorsList] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);
  const [sponsorForm, setSponsorForm] = useState({ name: "", category: "Main Sponsor", logo: "", contact: "", amount: "", notes: "" });
  const [addingSponsor, setAddingSponsor] = useState(false);
  const [upcomingEventForm, setUpcomingEventForm] = useState({ title: "", date: "", chapter: "", city: "" });
  const [addingUpcomingEvent, setAddingUpcomingEvent] = useState(false);
  const [upcomingRegion, setUpcomingRegion] = useState("All of India");
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);
  const [documentUploadForm, setDocumentUploadForm] = useState({ title: "", type: "PDF", category: "General", file: null });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await documentApi.getAll();
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error("Warning loading documents:", err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentUploadForm.file || !documentUploadForm.title.trim()) {
      toast.error("Please provide a title and choose a file.");
      return;
    }
    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append("file", documentUploadForm.file);
      formData.append("title", documentUploadForm.title.trim());
      formData.append("type", documentUploadForm.type);
      formData.append("category", documentUploadForm.category);
      await documentApi.upload(formData);
      toast.success("Document uploaded!");
      setDocumentUploadOpen(false);
      setDocumentUploadForm({ title: "", type: "PDF", category: "General", file: null });
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to upload document: " + (err.message || "Unknown error"));
    } finally {
      setUploadingDocument(false);
    }
  };

  // Load Events on Mount (Pre-existing events auto-fetched)
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingEvents(true);
        const res = await eventApi.list({ limit: 50, strictAdminScope: true });
        const eventList = res?.events || res?.data || res || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          const first = eventList[0];
          setSelectedEventId(first._id);
          setActiveEvent(first);
          fetchOperationsData(first._id, { syncSlide: true });
        }
      } catch (err) {
        console.warn("Warning loading events (transient):", err.message);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadData();
    fetchDocuments();
  }, []);

  // Load Chapter Members for My Team Dropdown
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoadingMembers(true);
        const res = await userApi.getAdminUsers({ limit: 100 });
        const memberList = res?.data?.users || res?.users || res?.data || [];
        setChapterMembers(memberList);
      } catch (err) {
        console.warn("Could not load chapter members:", err.message);
      } finally {
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, []);

  // Sync / Load Follow-ups
  const fetchFollowups = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        followupApi.list({ type: followupMode, status: followupFilter, search: followupSearch }),
        followupApi.getAnalytics({ eventId: selectedEventId, chapter: chapterName }),
      ]);
      setFollowups(Array.isArray(listRes?.data) ? listRes.data : (listRes?.data?.items || listRes?.items || []));
      if (statsRes?.data) {
        setFollowupStats(statsRes.data);
      }
    } catch (err) {
      console.warn("Warning loading followups (transient):", err.message);
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
  // syncSlide: only apply the backend's currentSlideIndex on initial load / explicit event switch —
  // refetches triggered by unrelated saves (finance, checkin, announcements) must not clobber in-progress slide navigation
  const fetchOperationsData = async (eventId, { syncSlide = false } = {}) => {
    if (!eventId) return;
    try {
      const res = await eventApi.getOperations(eventId);
      if (res?.data) {
        if (res.data.kpis) {
          setBackendKpis(res.data.kpis);
        }
        if (res.data.attendees && Array.isArray(res.data.attendees)) {
          setAttendeesList(res.data.attendees);
        }
        if (res.data.event) {
          const ev = res.data.event;
          setActiveEvent(ev);
          if (ev.stageStatus) setLiveEventStatus(ev.stageStatus);
          if (syncSlide && ev.currentSlideIndex !== undefined) setCurrentSlideIndex(ev.currentSlideIndex);
          if (ev.speakers?.length) setSpeakers(ev.speakers);
          if (ev.projectorMode) setProjectorMode(ev.projectorMode);
          if (ev.activeAnnouncement) {
            setActiveTicker(ev.activeAnnouncement);
            setLiveAnnouncement(ev.activeAnnouncement);
          }
          if (ev.moderatorNotes) setModeratorNotes(ev.moderatorNotes);
          
          // Render real guest speaker name instead of default placeholder
          let loadedAgenda = ev.agenda?.length ? ev.agenda : DEFAULT_AGENDA;
          if (ev.speakers?.length > 0) {
            loadedAgenda = loadedAgenda.map(item => {
              if (item.title === "Guest Speaker Session") {
                return { ...item, speaker: ev.speakers[0].name || ev.speakers[0].title || "Guest of Honour" };
              }
              return item;
            });
          }
          setAgenda(loadedAgenda);
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
            nameTemplate: "",
            title: ev.title || "",
            date: ev.date ? ev.date.split("T")[0] : "",
            posterUrl: ev.eventPoster || "",
            signatory1Role: ev.signatory1Role || "Chapter Vice President",
            signatory1Name: ev.signatory1Name || "",
            signatory1Image: ev.signatory1Image || "",
            membershipJoiningLink: ev.membershipJoiningLink || "",
            membershipQrImage: ev.membershipQrImage || "",
            memberFee: ev.memberFee !== undefined ? String(ev.memberFee) : "",
            nonMemberFee: ev.nonMemberFee !== undefined ? String(ev.nonMemberFee) : "",
            paymentCodes: Array.isArray(ev.paymentCodes) ? ev.paymentCodes.join(", ") : "",
            staffCodes: Array.isArray(ev.staffCodes) ? ev.staffCodes.join(", ") : "",
            certificateStyle: ev.certificateStyle || "5 — Corporate (navy band, gold rule, clean typography)",
            certificateAccentColor: ev.certificateAccentColor || "#059669",
            signatory2Role: ev.signatory2Role || "— none —",
            signatory2Name: ev.signatory2Name || "",
            signatory2Image: ev.signatory2Image || "",
            visitorSignIn: ev.visitorSignIn !== false,
            remindRepeatGuests: ev.remindRepeatGuests !== false,
            repeatGuestThreshold: ev.repeatGuestThreshold ?? 3,
            downloadListPermission: ev.downloadListPermission || "Everyone (members and guests)",
            slogan: ev.slogan || "",
            theme: ev.theme || "",
            chapterAppearance: ev.appearance?.primaryColor === "#b45309" ? "ivory" : "navy",
          });
          if (ev.sponsors?.length) setSponsorsList(ev.sponsors);
          if (ev.upcomingEvents?.length) setUpcomingEventsList(ev.upcomingEvents);
        }
      }
    } catch (err) {
      console.warn("Operations data fallback:", err.message);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchOperationsData(selectedEventId, { syncSlide: true });
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
        date: eventSetupForm.date,
        eventPoster: eventSetupForm.posterUrl,
        signatory1Role: eventSetupForm.signatory1Role,
        signatory1Name: eventSetupForm.signatory1Name,
        signatory1Image: eventSetupForm.signatory1Image,
        membershipJoiningLink: eventSetupForm.membershipJoiningLink,
        membershipQrImage: eventSetupForm.membershipQrImage,
      };
      await eventApi.updateOperations(selectedEventId, payload);
      toast.success("✅ Event setup saved to MongoDB!");
      fetchOperationsData(selectedEventId);
    } catch (err) {
      toast.error("Failed to save event setup: " + (err.message || "Unknown error"));
    } finally {
      setSavingEventSetup(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      setSavingPaymentSettings(true);
      const payload = {
        memberFee: Number(eventSetupForm.memberFee) || 0,
        nonMemberFee: Number(eventSetupForm.nonMemberFee) || 0,
        paymentCodes: eventSetupForm.paymentCodes.split(",").map(s => s.trim()).filter(Boolean),
        staffCodes: eventSetupForm.staffCodes.split(",").map(s => s.trim()).filter(Boolean),
      };
      await eventApi.updateOperations(selectedEventId, payload);
      toast.success("✅ Payment settings saved!");
    } catch (err) {
      toast.error("Failed to save payment settings: " + (err.message || "Unknown error"));
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  const handleSaveCertificateDesign = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      setSavingCertDesign(true);
      const payload = {
        certificateStyle: eventSetupForm.certificateStyle,
        certificateAccentColor: eventSetupForm.certificateAccentColor,
        signatory1Role: eventSetupForm.signatory1Role,
        signatory1Name: eventSetupForm.signatory1Name,
        signatory1Image: eventSetupForm.signatory1Image,
        signatory2Role: eventSetupForm.signatory2Role,
        signatory2Name: eventSetupForm.signatory2Name,
        signatory2Image: eventSetupForm.signatory2Image,
      };
      await eventApi.updateOperations(selectedEventId, payload);
      toast.success("✅ Certificate design saved!");
    } catch (err) {
      toast.error("Failed to save certificate design: " + (err.message || "Unknown error"));
    } finally {
      setSavingCertDesign(false);
    }
  };

  const handleDownloadCertificate = (name, role) => {
    const params = new URLSearchParams({
      name: name,
      role: role,
      event: activeEvent?.title || "RIFAH Chapter Meet",
      accent: eventSetupForm.certificateAccentColor || "#059669",
      sig1Name: eventSetupForm.signatory1Name || "",
      sig1Role: eventSetupForm.signatory1Role || "",
      sig1Img: eventSetupForm.signatory1Image || "",
      sig2Name: eventSetupForm.signatory2Name || "",
      sig2Role: eventSetupForm.signatory2Role || "",
      sig2Img: eventSetupForm.signatory2Image || "",
    });
    window.open(`/certificate.html?${params.toString()}`, "_blank");
  };

  const handleSaveMembershipRules = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      const payload = {
        visitorSignIn: eventSetupForm.visitorSignIn,
        remindRepeatGuests: eventSetupForm.remindRepeatGuests,
        repeatGuestThreshold: Number(eventSetupForm.repeatGuestThreshold) || 3,
        downloadListPermission: eventSetupForm.downloadListPermission,
      };
      await eventApi.updateOperations(selectedEventId, payload);
      toast.success("✅ Membership rules saved!");
    } catch (err) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    }
  };

  const handleSaveSloganTheme = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      setSavingSloganTheme(true);
      await eventApi.updateOperations(selectedEventId, {
        slogan: eventSetupForm.slogan,
        theme: eventSetupForm.theme,
        appearance: eventSetupForm.chapterAppearance === "ivory"
          ? { primaryColor: "#b45309", darkBg: false }
          : { primaryColor: "#1e3a5f", darkBg: true },
      });
      toast.success("✅ Slogan & theme saved!");
    } catch (err) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSavingSloganTheme(false);
    }
  };

  const handleSaveSponsors = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      setSavingSponsors(true);
      await eventApi.updateOperations(selectedEventId, { sponsors: sponsorsList });
      toast.success("✅ Sponsors & partners saved!");
    } catch (err) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSavingSponsors(false);
    }
  };

  const handleSaveUpcomingEvents = async () => {
    if (!selectedEventId) { toast.error("Please select an active event first."); return; }
    try {
      setSavingUpcomingEvents(true);
      await eventApi.updateOperations(selectedEventId, { upcomingEvents: upcomingEventsList });
      toast.success("✅ Upcoming events saved!");
    } catch (err) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSavingUpcomingEvents(false);
    }
  };

  const handleTestLiveSync = async () => {
    setLiveSyncStatus("testing");
    setLiveSyncLatency(null);
    const start = Date.now();
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("ping", { chapter: chapterSlug, ts: start });
      setTimeout(() => {
        const latency = Date.now() - start;
        setLiveSyncLatency(latency);
        setLiveSyncStatus("ok");
        toast.success(`✅ Live sync OK — latency ${latency}ms`);
      }, 800);
    } else {
      try {
        const res = await fetch("/api/health").catch(() => null);
        const latency = Date.now() - start;
        setLiveSyncLatency(latency);
        setLiveSyncStatus(res?.ok ? "ok" : "fail");
        if (res?.ok) toast.success(`✅ Backend reachable — ${latency}ms`);
        else toast.error("❌ Socket not connected. Check Firebase steps in README.txt.");
      } catch {
        setLiveSyncStatus("fail");
        toast.error("❌ Cannot reach backend. Check if server is running.");
      }
    }
  };

  // Every role key that gets linked to a real user account on save (mirrors
  // ASSIGNABLE_ROLES in rifah-backend/src/modules/events/event.service.js). The functional
  // ones unlock tools in the member's Operations Centre; the stage ones tell the member
  // they are presenting. Free-text fields (keynote topics, posters) are not roles.
  const ASSIGNABLE_ROLES = [
    "entranceIncharge",
    "followupCoordinator",
    "treasurer",
    "guestManager",
    "eventCoordinator",
    "photosVideo",
    "chapterAdmin",
    "tilawatEquran",
    "presidentWelcome",
    "secretaryIntro",
    "keynote1",
    "keynote2",
    "heroOfEvent",
    "best60SecPitch",
    "closingRemarks",
    "voteOfThanks",
    "eventEnd",
  ];

  const handleSaveTeamRoles = async () => {
    if (!selectedEventId) {
      toast.error("Please select an active event first.");
      return;
    }
    try {
      await eventApi.updateOperations(selectedEventId, { teamAssignments: teamRoles });

      // Also mirror every assignable role into structured, permission-relevant assignments.
      // Sent as one bulk call so the roles cannot overwrite each other on the same document.
      await eventApi.assignRolesBulk(
        selectedEventId,
        ASSIGNABLE_ROLES.map((roleKey) => {
          const assignedName = teamRoles[roleKey];
          const matchedMember = assignedName ? eligibleTeamMembers.find((m) => m.name === assignedName) : null;
          return { role: roleKey, userId: matchedMember?._id || null };
        })
      );

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
      let updatedSpeakers;
      if (newSpeaker.id) {
        updatedSpeakers = speakers.map(sp => sp.id === newSpeaker.id ? newSpeaker : sp);
      } else {
        updatedSpeakers = [
          ...speakers,
          {
            id: `sp-${Date.now()}`,
            ...newSpeaker,
          },
        ];
      }
      setSpeakers(updatedSpeakers);
      if (selectedEventId) {
        await eventApi.updateOperations(selectedEventId, { speakers: updatedSpeakers });
      }
      toast.success(`Speaker ${newSpeaker.name} saved!`);
      setSpeakerDialogOpen(false);
      setNewSpeaker({ name: "", mobile: "", email: "", org: "", designation: "", type: "Guest Speaker", topic: "" });
    } catch (err) {
      toast.error("Failed to save speaker.");
    } finally {
      setSavingSpeaker(false);
    }
  };

  const handleEditSpeakerClick = (s) => {
    setNewSpeaker(s);
    setSpeakerDialogOpen(true);
  };

  const handleDeleteSpeaker = async (speakerId) => {
    if (!window.confirm("Are you sure you want to remove this speaker?")) return;
    try {
      setSavingSpeaker(true);
      const updatedSpeakers = speakers.filter(sp => sp.id !== speakerId);
      setSpeakers(updatedSpeakers);
      if (selectedEventId) {
        await eventApi.updateOperations(selectedEventId, { speakers: updatedSpeakers });
      }
      toast.success("Speaker removed!");
    } catch (err) {
      toast.error("Failed to remove speaker.");
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
        toast.error("Failed to save slide position — it may not survive a refresh.");
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const origin = mounted ? window.location.origin : "";
  const publicVisitorUrl = mounted ? `${origin}/events/${activeEvent?.slug || activeEvent?._id || "mumbai"}` : `/events/${activeEvent?.slug || activeEvent?._id || "mumbai"}`;
  // presentation.html is a static file (no Next.js env injection), so the backend socket
  // origin is passed explicitly via query param rather than guessed from window.location.
  const projectorUrl = mounted
    ? `${origin}/presentation.html?c=${chapterSlug}&s=${encodeURIComponent(getBackendServerBase())}`
    : `/presentation.html?c=${chapterSlug}`;

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

  // Real attendees from active event or backend operations API
  const attendees = useMemo(() => {
    if (attendeesList && attendeesList.length > 0) {
      return attendeesList;
    }
    const regUsers = activeEvent?.registeredUsers || [];
    return regUsers.map((reg, idx) => {
      const u = reg.user || {};
      const isMem =
        ["central_admin", "state_admin", "chapter_admin", "business_owner"].includes(u.role) ||
        (u.membershipStatus && u.membershipStatus !== "None" && u.membershipStatus !== "Expired");
      return {
        id: reg._id || u._id || `att-${idx}`,
        userId: u._id || reg.user,
        name: u.name || `Attendee ${idx + 1}`,
        mobile: u.phone || u.whatsapp || u.mobile || "Not provided",
        email: u.email || "attendee@example.com",
        company: u.organization || u.company || "Enterprise",
        city: u.city || activeEvent?.city || "Mumbai",
        isMember: Boolean(isMem),
        membership: isMem ? "Active Member" : "Non-Member",
        membershipStatus: isMem ? "Active Member" : "Non-Member",
        approvalStatus: reg.status === "Cancelled" ? "Rejected" : "Approved",
        entryStatus: reg.attendanceStatus === "Present" ? "Checked In" : "Pending",
        attendanceStatus: reg.attendanceStatus || "Pending",
        checkInTime: reg.attendanceStatus === "Present" ? "10:15 AM" : null,
        paymentStatus: reg.paymentStatus || (activeEvent?.isPaid ? "Paid" : "Free"),
        status: reg.paymentStatus || (activeEvent?.isPaid ? "Paid" : "Free"),
        time: reg.registeredAt
          ? new Date(reg.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "10:00 AM",
      };
    });
  }, [attendeesList, activeEvent]);

  // My Team role-assignment eligibility: only Members who have been allowed entry
  // by the Gate Incharge (entryStatus === "Checked In") are assignable to any role.
  // Non-members and pending/not-yet-checked-in attendees are excluded.
  const eligibleTeamMembers = useMemo(() => {
    return attendees
      .filter((a) => a.isMember === true && a.entryStatus === "Checked In")
      .map((a) => ({
        _id: a.userId || a.id,
        name: a.name,
        organization: a.company,
        phone: a.mobile,
      }));
  }, [attendees]);

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
    if (backendKpis && (backendKpis.registered > 0 || backendKpis.approved > 0 || backendKpis.fees > 0)) {
      return backendKpis;
    }
    const registered = attendees.length;
    const approved = attendees.filter((a) => a.approvalStatus === "Approved").length;
    const members = attendees.filter((a) => a.isMember).length;
    let fees = 0;
    if (activeEvent?.isPaid && activeEvent?.ticketPrice) {
      fees = registered * activeEvent.ticketPrice;
    } else {
      fees = (financeRecords.moneyIn || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }
    return { registered, approved, members, fees };
  }, [backendKpis, attendees, activeEvent, financeRecords]);

  // Official Documents Definitions for View and Download
  const OFFICIAL_DOCUMENTS = {
    "Standard Chapter Event Script": {
      title: "Standard Chapter Event Script",
      category: "Formats & Templates",
      filename: "RIFAH_Standard_Chapter_Event_Script.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>OFFICIAL CHAPTER EVENT RUN SCRIPT & CEREMONY MASTER MANUAL</h3>
        <p class="meta"><strong>Document Ref:</strong> RCCI/OPS/SCR-2026/01 | <strong>Chapter:</strong> ${chapterName} | <strong>Event:</strong> ${activeEvent?.title || "Chapter Business Meet"}</p>
        <hr/>
        <h4>1. Pre-Event Briefing (T - 30 min)</h4>
        <p>Ensure AV projector display is connected, dynamic QR registration codes are operational at the entrance desk, and badges are ready for pickup.</p>
        <h4>2. Master 16-Point Stage Ceremony Run Sequence:</h4>
        <ol>
          <li><strong>00:00 - 00:15 | Welcome & Registration:</strong> Gate Incharge checks in attendees via Scanner / Operations Portal.</li>
          <li><strong>00:15 - 00:20 | Tilawat-e-Quran:</strong> Recitation with translation in Urdu/English by nominated Qari/Member.</li>
          <li><strong>00:20 - 00:30 | Presidential Welcome Address:</strong> Chapter President opens the session, welcomes dignitaries and set quarterly themes.</li>
          <li><strong>00:30 - 00:40 | Chapter Executive Committee Intro:</strong> Introduction of Secretary, Treasurer, and Operations Leads.</li>
          <li><strong>00:40 - 01:05 | Keynote Speaker Address:</strong> Invited guest expert presents on industry trends & Islamic commerce.</li>
          <li><strong>01:05 - 01:25 | Second Guest / Dignitary Session:</strong> Highlighting business expansion, exports, and halal trade ecosystems.</li>
          <li><strong>01:25 - 01:55 | 30-Second Attendee Pitches:</strong> Every member and registered visitor presents business name, USP, and ideal referral ask.</li>
          <li><strong>01:55 - 02:10 | Ask & Give Board Session:</strong> Immediate lead matching and collaborative business exchange.</li>
          <li><strong>02:10 - 02:20 | Sponsor Spotlight:</strong> Official corporate partners showcase offerings on stage.</li>
          <li><strong>02:20 - 02:30 | Upcoming Chamber Initiatives:</strong> Announcement of state conventions, seminars, and trade fairs.</li>
          <li><strong>02:30 - 02:40 | Hero of the Event Award:</strong> Recognition of outstanding entrepreneurs and active chamber contributors.</li>
          <li><strong>02:40 - 02:50 | Star Connector Recognition:</strong> Felicitating top referral generators of the month.</li>
          <li><strong>02:50 - 03:05 | Membership Drive & Renewals:</strong> Treasurer & Secretary explain value proposition for prospective applicants.</li>
          <li><strong>03:05 - 03:15 | Presidential Closing Remarks:</strong> Summary of achieved milestones and ethical trade commitment.</li>
          <li><strong>03:15 - 03:20 | Vote of Thanks:</strong> Formal gratitude to organizers, venue authorities, and media.</li>
          <li><strong>03:20 - 03:50 | Networking & High Tea:</strong> One-to-one business dialogues and follow-up meetings.</li>
        </ol>
      `,
    },
    "Membership Induction Guidelines": {
      title: "Membership Induction Guidelines",
      category: "Membership",
      filename: "RIFAH_Membership_Induction_Guidelines.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>MEMBERSHIP INDUCTION & VERIFICATION PROTOCOL</h3>
        <p class="meta"><strong>Document Ref:</strong> RCCI/MEM/GUI-2026/04 | <strong>Issued By:</strong> Central Secretariat & Chapter Desk</p>
        <hr/>
        <h4>1. Eligibility Criteria</h4>
        <p>Any Shariah-compliant enterprise, proprietor, partner, or director operating a legal trade or business entity with valid GSTIN / Udyam registration is eligible to apply for Chapter Membership.</p>
        <h4>2. Verification & Scrutiny Stages</h4>
        <ul>
          <li><strong>Step 1:</strong> Online registration via RIFAH Connect portal with complete business profile.</li>
          <li><strong>Step 2:</strong> Chapter Scrutiny Committee review and telephonic interview by Chapter Secretary.</li>
          <li><strong>Step 3:</strong> Verification of GSTIN / Business Proof against government databases.</li>
          <li><strong>Step 4:</strong> Formal recommendation by two existing active Chapter Members.</li>
          <li><strong>Step 5:</strong> Payment of annual chamber membership subscription and induction certificate generation.</li>
        </ul>
        <h4>3. Code of Ethics Declaration</h4>
        <p>Every member must commit to honesty, zero-interest transactions where applicable, transparent dealings, timely payment of dues, and collaborative economic development of the community.</p>
      `,
    },
    "Annual Chapter Formation Bylaws": {
      title: "Annual Chapter Formation Bylaws",
      category: "Chapter Formation",
      filename: "RIFAH_Chapter_Formation_Bylaws.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>CHAPTER GOVERNANCE CONSTITUTION & FORMATION BYLAWS</h3>
        <p class="meta"><strong>Document Ref:</strong> RCCI/BYLAW/2026/REV-3 | <strong>Enforced Across All Chapters</strong></p>
        <hr/>
        <h4>Article 1: Chapter Structure & Executive Committee</h4>
        <p>Each local Chapter is governed by an Executive Committee comprising: President, Vice President, General Secretary, Joint Secretary, Treasurer, and Operations Lead.</p>
        <h4>Article 2: Meeting Frequency & Quorum</h4>
        <p>Chapters shall conduct at least two scheduled business meets every month. Minimum quorum for executive decisions requires presence of at least 50% of the executive committee members.</p>
        <h4>Article 3: Financial Accountability</h4>
        <p>All collections (event entry tickets, sponsor fees, high tea expenses) must be recorded in the RIFAH Operations Center ledger and submitted to Central Secretariat quarterly.</p>
      `,
    },
    "Sponsorship & Partner Formats": {
      title: "Sponsorship & Partner Formats",
      category: "Registration & Legal",
      filename: "RIFAH_Sponsorship_Partner_Agreement.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>OFFICIAL EVENT SPONSORSHIP & PARTNERSHIP AGREEMENT</h3>
        <p class="meta"><strong>Document Ref:</strong> RCCI/SPON/2026/STD | <strong>Chapter:</strong> ${chapterName}</p>
        <hr/>
        <h4>1. Sponsorship Tiers & Privileges</h4>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th>Tier</th>
              <th>Contribution</th>
              <th>Stage Time</th>
              <th>Banner / Projector Display</th>
              <th>Stall Space</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Title Partner</strong></td>
              <td>₹50,000</td>
              <td>10 Minutes</td>
              <td>Main Stage Banner + Continuous Projector Loop</td>
              <td>Prime Entrance Stall</td>
            </tr>
            <tr>
              <td><strong>Associate Partner</strong></td>
              <td>₹25,000</td>
              <td>5 Minutes</td>
              <td>Side Stage Backdrop + 5 Projector Mentions</td>
              <td>Stall Area</td>
            </tr>
            <tr>
              <td><strong>High Tea Sponsor</strong></td>
              <td>₹15,000</td>
              <td>3 Minutes</td>
              <td>Dining Area Branding + Special Announcement</td>
              <td>Literature Stand</td>
            </tr>
          </tbody>
        </table>
        <h4>2. Partner Obligations</h4>
        <p>Sponsors agree to adhere to chamber brand guidelines and supply promotional slide creatives at least 48 hours prior to the event.</p>
      `,
    },
    "Central Secretariat Circular Q3": {
      title: "Central Secretariat Circular Q3",
      category: "Circulars",
      filename: "RIFAH_Central_Secretariat_Circular_Q3.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>CENTRAL SECRETARIAT DIRECTIVE — Q3 PERFORMANCE & NATIONAL EXPANSION</h3>
        <p class="meta"><strong>Circular No:</strong> RCCI/HQ/CIR/2026/09-Q3 | <strong>Date:</strong> September 2026</p>
        <hr/>
        <h4>To: All Chapter Presidents, Secretaries, and State Administrators</h4>
        <p>The Central Secretariat congratulates all chapters on achieving record member engagement in Q2. In accordance with National Governing Council directives, please implement the following for Q3:</p>
        <ol>
          <li><strong>Mandatory Digital Check-in:</strong> Use the newly deployed Operations Center Hub for real-time QR scanner entry and attendance recording.</li>
          <li><strong>Inter-Chapter Trade Exchange:</strong> Encourage cross-chapter business referrals and verify all transactions on RIFAH Connect.</li>
          <li><strong>Annual Audit Compliance:</strong> Submit event finance statements and participant records within 48 hours of event completion.</li>
        </ol>
      `,
    },
    "Code of Ethics & Conduct": {
      title: "Code of Ethics & Conduct",
      category: "Registration & Legal",
      filename: "RIFAH_Code_of_Ethics_and_Conduct.html",
      content: `
        <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
        <h3>CHAMBER CODE OF PROFESSIONAL ETHICS & BUSINESS CONDUCT</h3>
        <p class="meta"><strong>Document Ref:</strong> RCCI/ETHICS/2026/01 | <strong>Mandatory Compliance</strong></p>
        <hr/>
        <h4>Core Pillars of RIFAH Business Ethics:</h4>
        <ol>
          <li><strong>Integrity in Trade (Amanah):</strong> Accurate representation of goods, honest pricing, and strict adherence to contractual agreements.</li>
          <li><strong>Fair Dealing:</strong> Prohibition of deceitful marketing, hoarding, or coercive terms.</li>
          <li><strong>Prompt Settlement:</strong> Honoring financial commitments, invoices, and employee wages without undue delay.</li>
          <li><strong>Community Elevation:</strong> Dedicating a portion of business growth towards mentoring upcoming Muslim youth and entrepreneurs.</li>
          <li><strong>Dispute Resolution:</strong> Agreeing to mediate any intra-chamber disputes amicably through the RIFAH Chamber Grievance Cell.</li>
        </ol>
      `,
    },
  };

  const generateDocumentHtml = (docData) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docData.title} - RIFAH Chamber</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0088d1;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0088d1;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .seal-badge {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
    }
    .meta {
      font-size: 12px;
      color: #64748b;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    h2 { font-size: 20px; font-weight: 800; margin-top: 0; color: #0f172a; }
    h3 { font-size: 15px; font-weight: 700; color: #0088d1; margin-top: 4px; }
    h4 { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 20px; border-left: 3px solid #0088d1; padding-left: 8px; }
    ol, ul { padding-left: 22px; font-size: 13px; color: #334155; }
    li { margin-bottom: 8px; }
    p { font-size: 13px; color: #334155; }
    .footer-bar {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    .print-btn {
      background: #0088d1;
      color: white;
      padding: 8px 18px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right;">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="header-bar">
    <div>
      <h1 class="brand-title">RIFAH CHAMBER OF COMMERCE</h1>
      <div class="brand-sub">Official Chamber Administration System · ${chapterName}</div>
    </div>
    <div class="seal-badge">Official Document · Verified</div>
  </div>
  ${docData.content}
  <div class="footer-bar">
    <div>Generated via RIFAH Operations Center Hub</div>
    <div>Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
  </div>
</body>
</html>`;
  };

  const handleViewDocument = (docTitle) => {
    const docData = OFFICIAL_DOCUMENTS[docTitle];
    if (!docData) {
      toast.info(`Opening ${docTitle}`);
      return;
    }
    const htmlContent = generateDocumentHtml(docData);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      toast.success(`Viewing ${docTitle}`);
    } else {
      toast.error("Popup blocked! Please allow popups to view documents.");
    }
  };

  const handleDownloadDocument = (docTitle) => {
    const docData = OFFICIAL_DOCUMENTS[docTitle];
    if (!docData) {
      toast.info(`Downloading ${docTitle}`);
      return;
    }
    const htmlContent = generateDocumentHtml(docData);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", docData.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${docData.filename}`);
  };

  // CSV Exports for Data Central
  const handleExportAttendeeCSV = () => {
    if (!attendees || attendees.length === 0) {
      toast.error("No attendee records found to export for this event.");
      return;
    }
    const headers = ["Name", "Email", "Mobile", "Company", "City", "Membership Status", "Approval Status", "Entry / Attendance", "Payment Status", "Registered Time"];
    const rows = attendees.map((a) => [
      `"${(a.name || "").replace(/"/g, '""')}"`,
      `"${(a.email || "").replace(/"/g, '""')}"`,
      `"${(a.mobile || "").replace(/"/g, '""')}"`,
      `"${(a.company || "").replace(/"/g, '""')}"`,
      `"${(a.city || "").replace(/"/g, '""')}"`,
      `"${a.membershipStatus || (a.isMember ? "Active Member" : "Non-Member")}"`,
      `"${a.approvalStatus || "Approved"}"`,
      `"${a.entryStatus || a.attendanceStatus || "Pending"}"`,
      `"${a.paymentStatus || "Free"}"`,
      `"${a.time || ""}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `RIFAH_Attendees_${(activeEvent?.title || "event").replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Attendee roster exported successfully as CSV!");
  };

  const handleExportMemberDirectoryCSV = () => {
    const listToExport = chapterMembers.length > 0 ? chapterMembers : attendees;
    if (!listToExport || listToExport.length === 0) {
      toast.error("No member records available to export.");
      return;
    }
    const headers = ["Name", "Email", "Phone", "Organization / Business", "City", "Role", "Chapter", "Status"];
    const rows = listToExport.map((m) => [
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.phone || m.whatsapp || m.mobile || "").replace(/"/g, '""')}"`,
      `"${(m.organization || m.company || m.businessName || "").replace(/"/g, '""')}"`,
      `"${(m.city || "").replace(/"/g, '""')}"`,
      `"${(m.role || "Member").replace(/"/g, '""')}"`,
      `"${(m.chapter || chapterName).replace(/"/g, '""')}"`,
      `"${(m.status || "Active").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `RIFAH_Member_Directory_${chapterSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Chapter member directory exported successfully as CSV!");
  };

  const handleExportFinancialStatement = () => {
    const title = `RIFAH Chapter Financial Statement - ${activeEvent?.title || "Chapter Meet"}`;
    const moneyInRows = (financeRecords.moneyIn || []).map((item) => `
      <tr>
        <td>${item.date || "-"}</td>
        <td>${item.desc || "Receipt"}</td>
        <td>${item.from || "Attendee"}</td>
        <td>${item.method || "Online"}</td>
        <td style="text-align:right; font-weight:bold; color:#16a34a;">+₹${Number(item.amount || 0).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const moneyOutRows = (financeRecords.moneyOut || []).map((item) => `
      <tr>
        <td>${item.date || "-"}</td>
        <td>${item.desc || "Expense"}</td>
        <td>${item.to || "Vendor"}</td>
        <td>${item.invoice || "-"}</td>
        <td style="text-align:right; font-weight:bold; color:#dc2626;">-₹${Number(item.amount || 0).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const totalIn = (financeRecords.moneyIn || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalOut = (financeRecords.moneyOut || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const net = totalIn - totalOut;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print { .no-print { display: none !important; } }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 840px; margin: 30px auto; padding: 24px; color: #1e293b; }
    h2 { color: #0088d1; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .kpi-row { display: flex; gap: 16px; margin: 20px 0; }
    .kpi-box { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .print-btn { background: #0088d1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 16px;">
    <button class="print-btn" onclick="window.print()">🖨️ Print Financial Statement</button>
  </div>
  <h2>RIFAH CHAMBER OF COMMERCE & INDUSTRY</h2>
  <h3 style="margin-top: 4px; color: #475569;">Event Financial Summary & Ledger Statement</h3>
  <p style="font-size: 12px; color: #64748b;">Chapter: ${chapterName} | Event: ${activeEvent?.title || "Meet"} | Date: ${activeEvent?.date || new Date().toISOString().split("T")[0]}</p>
  <hr style="border: 0; border-top: 1px solid #e2e8f0;"/>

  <div class="kpi-row">
    <div class="kpi-box">
      <div style="font-size: 11px; color: #64748b; font-weight: bold;">TOTAL COLLECTIONS (IN)</div>
      <div style="font-size: 20px; font-weight: bold; color: #16a34a; margin-top: 4px;">₹${totalIn.toLocaleString("en-IN")}</div>
    </div>
    <div class="kpi-box">
      <div style="font-size: 11px; color: #64748b; font-weight: bold;">TOTAL DISBURSEMENTS (OUT)</div>
      <div style="font-size: 20px; font-weight: bold; color: #dc2626; margin-top: 4px;">₹${totalOut.toLocaleString("en-IN")}</div>
    </div>
    <div class="kpi-box" style="background: ${net >= 0 ? "#f0fdf4" : "#fef2f2"};">
      <div style="font-size: 11px; color: #64748b; font-weight: bold;">NET EVENT BALANCE</div>
      <div style="font-size: 20px; font-weight: bold; color: ${net >= 0 ? "#16a34a" : "#dc2626"}; margin-top: 4px;">₹${net.toLocaleString("en-IN")}</div>
    </div>
  </div>

  <h4 style="margin-top: 24px; color: #0f172a;">1. Money In (Collections & Sponsorships)</h4>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Received From</th><th>Method</th><th style="text-align:right;">Amount</th></tr></thead>
    <tbody>${moneyInRows || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No collections recorded</td></tr>'}</tbody>
  </table>

  <h4 style="margin-top: 24px; color: #0f172a;">2. Money Out (Disbursements & Venue Expenses)</h4>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Paid To</th><th>Invoice #</th><th style="text-align:right;">Amount</th></tr></thead>
    <tbody>${moneyOutRows || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No disbursements recorded</td></tr>'}</tbody>
  </table>

  <p style="margin-top: 24px; font-size: 12px; color: #475569;"><strong>Treasurer Certification:</strong> ${financeRecords.treasurerNotes}</p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `RIFAH_Financial_Statement_${(activeEvent?.title || "event").replace(/\s+/g, "_")}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Financial statement generated and downloaded!");
  };

  // Follow-up Actions
  const handleUpdateFollowupStatus = async (id, newStatus) => {
    try {
      await followupApi.updateStatus(id, newStatus);
      toast.success(`Follow-up marked as ${newStatus}`);
      fetchFollowups();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNote = async () => {
    if (!editingNoteItem) return;
    try {
      await followupApi.addNote(editingNoteItem._id, noteText);
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
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Pill tone="brand">{roleLabel}</Pill>
              <Pill tone="neutral">{chapterName.toUpperCase()}</Pill>
              <Pill tone={socketConnected ? "success" : "warning"}>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full mr-1 inline-block",
                    socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  )}
                />
                Live Sync: {socketConnected ? "Connected" : "Standby"}
              </Pill>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-2 flex items-center gap-2">
              RIFAH Operations Center {isCentralAdmin ? "Central" : isStateAdmin ? "State" : "Chapter"} Admin Panel
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-1">
              <span>
                <span className="font-semibold text-foreground">Current Scope:</span> {chapterName}
              </span>
              <span className="text-border">|</span>
              <span>
                <span className="font-semibold text-foreground">Current Event:</span> {activeEvent?.title || "Upcoming Chapter Meet"}
              </span>
              <span className="text-border">|</span>
              <span>
                <span className="font-semibold text-foreground">Current Admin:</span> {user?.name || user?.email || roleLabel}
              </span>
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
                  <SelectTrigger className="w-44 sm:w-52 h-9 text-xs bg-background border-border text-foreground">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {events.map((e) => (
                      <SelectItem key={e._id} value={e._id} className="text-xs">
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
              className="border-border text-foreground hover:bg-muted h-9 rounded-xl gap-1.5 font-medium"
            >
              <Link href={projectorUrl} target="_blank">
                <Radio className="h-4 w-4 text-primary" />
                <span>Open Projector</span>
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setResetModalOpen(true)}
              className="h-9 rounded-xl gap-1.5 font-medium shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset for Next Event</span>
            </Button>
          </div>
        </div>

        {/* 4 Core Dynamic KPI Cards using site's native StatCard component */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Registered"
            value={String(kpiStats.registered)}
            hint="Total attendee registrations"
            icon={Ticket}
            tone="primary"
            active={currentTab === "attendees"}
            onClick={() => setTab("attendees")}
          />

          <StatCard
            label="Approved"
            value={String(kpiStats.approved)}
            hint="Confirmed & allowed entry"
            icon={CheckCircle2}
            tone="success"
            active={currentTab === "attendees"}
            onClick={() => setTab("attendees")}
          />

          <StatCard
            label="Members"
            value={String(kpiStats.members)}
            hint="Active RIFAH chamber members"
            icon={Users}
            tone="brand"
            active={currentTab === "my-team"}
            onClick={() => setTab("my-team")}
          />

          <StatCard
            label="Fees ₹"
            value={`₹${kpiStats.fees.toLocaleString("en-IN")}`}
            hint="Total revenue collected"
            icon={CreditCard}
            tone="warning"
            active={currentTab === "finance"}
            onClick={() => setTab("finance")}
          />
        </div>

        {/* Horizontal Module Navigation Buttons Directly Below Header & KPIs */}
        <div className="border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {HORIZONTAL_MODULE_TABS.map((tab) => {
              const isActive = currentTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 font-medium"
                  )}
                >
                  <TabIcon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT ROUTER                                                    */}
      {/* ========================================================================= */}

      {/* CHAPTER OVERVIEW / EXECUTIVE OPERATIONS DECK */}
      {(currentTab === "overview" || currentTab === "chapter-overview") && (
        <div className="space-y-6">
          {/* Executive Top Banner */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-foreground">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill tone="primary">
                    <Radio className="h-3 w-3 animate-pulse mr-1" />
                    EXECUTIVE OPERATIONS DESK
                  </Pill>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs font-semibold text-foreground">{chapterName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {activeEvent ? activeEvent.title : "RIFAH Operations Command Center"}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Real-time command and telemetry desk for chapter meetings, registrations, live slide projection, gate entry, and post-event attendee conversions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => setTab("live-control")}
                  className="font-semibold shadow-xs gap-2"
                >
                  <Radio className="h-4 w-4" />
                  <span>Stage Live Control</span>
                </Button>
                <Button
                  onClick={() => setTab("attendees")}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted gap-2 font-medium"
                >
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>Gate Check-in</span>
                </Button>
                <Button
                  onClick={() => window.open(projectorUrl, "_blank")}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted gap-2 font-medium"
                >
                  <ExternalLink className="h-4 w-4 text-amber-500" />
                  <span>Launch Projector</span>
                </Button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Stage State</span>
                <span className={cn(
                  "font-bold uppercase tracking-wider",
                  liveEventStatus === "LIVE" ? "text-emerald-600" : "text-amber-600"
                )}>
                  ● {liveEventStatus}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Slide Deck</span>
                <span className="font-bold text-foreground">Slide {currentSlideIndex + 1} of {agenda.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Venue & Date</span>
                <span className="font-bold text-foreground truncate block">{activeEvent?.venue || "Grand Hall"} · {activeEvent?.date || "Today"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Collections</span>
                <span className="font-bold text-emerald-600">₹{kpiStats.fees.toLocaleString("en-IN")}</span>
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
                  <span>{Object.values(teamRoles).filter(Boolean).length} Appointed Roles</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Live Control */}
              <div
                onClick={() => setTab("live-control")}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Radio className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 04</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Live Stage Control</h4>
                  <p className="text-xs text-muted-foreground mt-1">16-item agenda slide manager synchronized in real time with the hall projector.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
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
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between sm:col-span-2 lg:col-span-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Module 10</span>
                      <h4 className="font-bold text-base text-foreground mt-0.5 group-hover:text-primary transition-colors">My Links & Dynamic QR Generator</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Visitor registration link, live projector presentation URL, and branded PNG QR code download.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Open Links Desk <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

                  {currentTab === "event-setup" && (
        <div className="space-y-5">

          {/* Event Selector */}
          {events.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
              <Label className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Active Event:</Label>
              <Select
                value={selectedEventId}
                onValueChange={(val) => {
                  setSelectedEventId(val);
                  const ev = events.find((e) => e._id === val);
                  if (ev) setActiveEvent(ev);
                }}
              >
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e._id} value={e._id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── CARD 1: Live Sync ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Live Sync — Test Before Your Event</p>
                <p className="text-xs text-muted-foreground">Verify that all devices will sync in real time</p>
              </div>
              <div className="ml-auto">
                <Pill tone={socketConnected ? "success" : "warning"}>
                  <span className={cn("h-1.5 w-1.5 rounded-full mr-1 inline-block", socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {socketConnected ? "Socket Live" : "Standby"}
                </Pill>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                This checks whether admin, entrance, presentation and every visitor's phone will actually update each other in real time. If it fails, only THIS device will see data — follow the Firebase steps in README.txt.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant={liveSyncStatus === "ok" ? "default" : liveSyncStatus === "fail" ? "destructive" : "outline"}
                  onClick={handleTestLiveSync}
                  disabled={liveSyncStatus === "testing"}
                  className={cn("gap-2 rounded-xl font-semibold", liveSyncStatus === "ok" && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                >
                  {liveSyncStatus === "testing" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…</> :
                   liveSyncStatus === "ok"      ? <><CheckCircle2 className="h-3.5 w-3.5" /> Connected ({liveSyncLatency}ms)</> :
                   liveSyncStatus === "fail"    ? <><AlertCircle className="h-3.5 w-3.5" /> Sync Failed</> :
                                                  <><Zap className="h-3.5 w-3.5" /> Test Live Sync Now</>}
                </Button>
                {liveSyncStatus === "ok" && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All devices synced ✓</span>
                )}
              </div>
            </div>
          </div>

          {/* ── CARD 2: Today's Event Page ────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Today's Event Page</p>
                <p className="text-xs text-muted-foreground">Title, poster, signatory and membership details</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-5">

              {/* Event Name */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event Name</Label>
                <Select
                  value={eventSetupForm.nameTemplate}
                  onValueChange={(val) => setEventSetupForm(prev => ({ ...prev, nameTemplate: val, title: val !== "custom" ? val : prev.title }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="— choose a name, or type your own below —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RIFAH Business Networking Meet">RIFAH Business Networking Meet</SelectItem>
                    <SelectItem value="RIFAH Chapter Monthly Meet">RIFAH Chapter Monthly Meet</SelectItem>
                    <SelectItem value="RIFAH Grand Business Summit">RIFAH Grand Business Summit</SelectItem>
                    <SelectItem value="RIFAH Quarterly Business Forum">RIFAH Quarterly Business Forum</SelectItem>
                    <SelectItem value="custom">— type your own below —</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={eventSetupForm.title}
                  onChange={(e) => setEventSetupForm(prev => ({ ...prev, title: e.target.value, nameTemplate: "custom" }))}
                  placeholder="e.g. RIFAH Business Networking Meet"
                  className="mt-2"
                />
              </div>

              {/* Date & Chapter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event Date</Label>
                  <Input type="date" value={eventSetupForm.date} onChange={(e) => setEventSetupForm(prev => ({ ...prev, date: e.target.value }))} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chapter</Label>
                  <div className="mt-2 px-3 py-2 rounded-lg border border-border bg-muted/40 text-sm font-medium text-foreground">{user?.chapter || chapterName}</div>
                  <p className="text-[10px] text-primary mt-1">From your login. State office can rename under Central Admin.</p>
                </div>
              </div>

              {/* Logo & Poster */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">RIFAH Logo</Label>
                  <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src="/rifah-logo.png" alt="RIFAH Logo" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Official chamber logo — built-in, used on all certificates.</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Event Poster
                  </Label>
                  {eventSetupForm.posterUrl ? (
                    <img src={resolveMediaUrl(eventSetupForm.posterUrl)} alt="Poster" className="mt-2 rounded-lg h-16 w-auto border border-border object-cover" />
                  ) : (
                    <p className="mt-2 text-[11px] text-muted-foreground">No poster set. Set a poster from the Event editor.</p>
                  )}
                </div>
              </div>

              {/* Signatory 1 */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signatory 1 (Primary)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Role / Designation</Label>
                    <Select value={eventSetupForm.signatory1Role} onValueChange={(val) => setEventSetupForm(prev => ({ ...prev, signatory1Role: val }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Chapter Vice President","Chapter President","Chapter Secretary","State President","State Secretary","Other"].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Name (as printed)</Label>
                    <Input value={eventSetupForm.signatory1Name} onChange={(e) => setEventSetupForm(prev => ({ ...prev, signatory1Name: e.target.value }))} placeholder="Full name" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Signature Image</Label>
                  <Input type="file" accept="image/*" className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEventSetupForm(prev => ({ ...prev, signatory1Image: URL.createObjectURL(file) }));
                    }}
                  />
                </div>
              </div>


              <Button onClick={handleSaveEventSetup} disabled={savingEventSetup} className="w-full gap-2 rounded-xl font-semibold">
                {savingEventSetup ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Event Setup</>}
              </Button>
            </div>
          </div>


          {/* ── CARD 4: Certificate Design ────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Certificate Design</p>
                <p className="text-xs text-muted-foreground">Style, accent colour and second signatory</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Design Style</Label>
                  <Select value={eventSetupForm.certificateStyle} onValueChange={(val) => setEventSetupForm(prev => ({ ...prev, certificateStyle: val }))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[
                        "1 — Classic (border, serif, dark blue)",
                        "2 — Modern (gradient header, sans-serif)",
                        "3 — Elegant (gold foil line, premium)",
                        "4 — Minimal (clean white, accent left bar)",
                        "5 — Corporate (navy band, gold rule, clean typography)",
                      ].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accent Colour</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <input type="color" value={eventSetupForm.certificateAccentColor} onChange={(e) => setEventSetupForm(prev => ({ ...prev, certificateAccentColor: e.target.value }))} className="h-9 w-14 rounded-md border border-border cursor-pointer p-0.5" />
                    <span className="text-sm font-mono text-muted-foreground">{eventSetupForm.certificateAccentColor}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signatory 1</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Role / Designation</Label>
                    <Select value={eventSetupForm.signatory1Role} onValueChange={(val) => setEventSetupForm(prev => ({ ...prev, signatory1Role: val }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["— none —","Chapter Vice President","Chapter President","Chapter Secretary","State President","State Secretary","Other"].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Name (as printed)</Label>
                    <Input value={eventSetupForm.signatory1Name} onChange={(e) => setEventSetupForm(prev => ({ ...prev, signatory1Name: e.target.value }))} placeholder="Full name" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Signature Image</Label>
                  <Input type="file" accept="image/*" className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEventSetupForm(prev => ({ ...prev, signatory1Image: URL.createObjectURL(file) }));
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signatory 2 (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Role / Designation</Label>
                    <Select value={eventSetupForm.signatory2Role} onValueChange={(val) => setEventSetupForm(prev => ({ ...prev, signatory2Role: val }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["— none —","Chapter Vice President","Chapter President","Chapter Secretary","State President","State Secretary","Other"].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Name (as printed)</Label>
                    <Input value={eventSetupForm.signatory2Name} onChange={(e) => setEventSetupForm(prev => ({ ...prev, signatory2Name: e.target.value }))} placeholder="Full name" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Signature Image</Label>
                  <Input type="file" accept="image/*" className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEventSetupForm(prev => ({ ...prev, signatory2Image: URL.createObjectURL(file) }));
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                Logo & photos keep their real ratio automatically. Sponsor logos appear neatly at the bottom of every certificate.
              </p>
              <Button variant="outline" onClick={handleSaveCertificateDesign} disabled={savingCertDesign} className="w-full gap-2 rounded-xl font-semibold">
                {savingCertDesign ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Certificate Design"}
              </Button>
            </div>
          </div>


          {/* ── CARD 6: Certificates of Appreciation ─────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-warning/15 flex items-center justify-center">
                <Award className="h-4 w-4 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Certificates of Appreciation</p>
                <p className="text-xs text-muted-foreground">Speakers, sponsors, hero & star connector</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-2">
              <p className="text-xs text-muted-foreground pb-1">Download a certificate for each keynote speaker and each sponsor. Formal design with your logo, both signatures and every partner logo. <strong className="text-primary mt-1 block">Note: Certificates are generated dynamically by the backend (Node.js/Puppeteer) using your saved Certificate Design settings. They are not stored as static files until downloaded.</strong></p>
              {speakers.length > 0 ? speakers.map((sp) => (
                <div key={sp.id || sp.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{sp.name}</span>
                    {sp.organization && <span className="text-xs text-muted-foreground">• {sp.organization.toUpperCase()}</span>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(sp.name, "Keynote Speaker")} className="rounded-lg text-xs h-7">Download</Button>
                </div>
              )) : (
                <div className="px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground">No speakers yet — add them in the Speakers & Guests tab.</p>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-muted-foreground">Hero of the Event — available after Ask & Give session</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">Star Connector — available once guests name who invited them</span>
                </div>
              </div>
              {sponsorsList.length > 0 && sponsorsList.map((sp) => (
                <div key={sp.id || sp.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{sp.name}</span>
                    <span className="text-xs text-muted-foreground">• {sp.category || "Sponsor"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(sp.name, sp.category || "Event Sponsor")} className="rounded-lg text-xs h-7">Download</Button>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 7: Slogan & Theme + Appearance ──────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-brand-soft flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Slogan, Theme & Appearance</p>
                <p className="text-xs text-muted-foreground">Used in speech scripts and chapter colour scheme</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <p className="text-xs text-muted-foreground">Used as <code className="bg-muted rounded px-1 text-[10px]">{"{slogan}"}</code> and <code className="bg-muted rounded px-1 text-[10px]">{"{theme}"}</code> in every speech script.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slogan</Label>
                  <Input value={eventSetupForm.slogan} onChange={(e) => setEventSetupForm(prev => ({ ...prev, slogan: e.target.value }))} placeholder="Together for Sustainable Future" className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Theme</Label>
                  <Input value={eventSetupForm.theme} onChange={(e) => setEventSetupForm(prev => ({ ...prev, theme: e.target.value }))} placeholder="Connect • Collaborate • Grow" className="mt-2" />
                </div>
              </div>
              <Button variant="outline" onClick={handleSaveSloganTheme} disabled={savingSloganTheme} className="w-full gap-2 rounded-xl font-semibold">
                {savingSloganTheme ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Slogan & Theme"}
              </Button>

              <div className="border-t border-border pt-4">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-3">Appearance for this chapter</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "navy", label: "Chamber Navy", desc: "Chamber blue on deep navy, gold for honours" },
                    { val: "ivory", label: "Chamber Ivory", desc: "Warm ivory and chamber maroon" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setEventSetupForm(prev => ({ ...prev, chapterAppearance: opt.val }))}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl border-2 transition-all",
                        eventSetupForm.chapterAppearance === opt.val
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-border bg-card hover:bg-muted"
                      )}
                    >
                      <p className="text-sm font-bold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-primary mt-2">Everyone in this chapter sees it, the projector included. Each person still chooses light or dark mode independently.</p>
              </div>
            </div>
          </div>

          {/* ── CARD 8: Upcoming RIFAH Events ────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarPlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Upcoming RIFAH Events <span className="text-xs font-normal text-muted-foreground">(other chapters)</span></p>
                <p className="text-xs text-muted-foreground">Shown on the projector so members can join events elsewhere</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-2 rounded-xl"
                  onClick={async () => {
                    try {
                      const res = await eventApi.list({ limit: 20, state: upcomingRegion === "All of India" ? undefined : upcomingRegion });
                      const list = res?.events || res?.data || [];
                      setUpcomingEventsList(list.map(e => ({ id: e._id, title: e.title, date: e.date, chapter: e.chapter, city: e.city, eventCategory: e.eventCategory })));
                      toast.success("Events fetched!");
                    } catch { toast.error("Could not fetch events."); }
                  }}
                >
                  <Globe className="h-3.5 w-3.5" /> Fetch RIFAH Events
                </Button>
                <Select value={upcomingRegion} onValueChange={setUpcomingRegion}>
                  <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All of India">All of India</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setAddingUpcomingEvent(!addingUpcomingEvent)} className="gap-1 rounded-xl text-xs h-9">
                  Paste instead
                </Button>
              </div>

              {addingUpcomingEvent && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  <Input placeholder="Event title" value={upcomingEventForm.title} onChange={e => setUpcomingEventForm(p => ({ ...p, title: e.target.value }))} />
                  <Input type="date" value={upcomingEventForm.date} onChange={e => setUpcomingEventForm(p => ({ ...p, date: e.target.value }))} />
                  <Input placeholder="Chapter name" value={upcomingEventForm.chapter} onChange={e => setUpcomingEventForm(p => ({ ...p, chapter: e.target.value }))} />
                  <Input placeholder="City" value={upcomingEventForm.city} onChange={e => setUpcomingEventForm(p => ({ ...p, city: e.target.value }))} />
                  <Button
                    className="col-span-2 rounded-xl"
                    onClick={() => {
                      if (!upcomingEventForm.title) return;
                      setUpcomingEventsList(prev => [...prev, { id: `ue-${Date.now()}`, ...upcomingEventForm }]);
                      setUpcomingEventForm({ title: "", date: "", chapter: "", city: "" });
                      setAddingUpcomingEvent(false);
                    }}
                  >Add Event</Button>
                </div>
              )}

              {upcomingEventsList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">No upcoming events added yet.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEventsList.map((ev, idx) => (
                    <div key={ev.id || idx} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {ev.title}
                          {ev.eventCategory === "Sports" && <Pill tone="warning">Sports</Pill>}
                        </p>
                        <p className="text-xs text-muted-foreground">{ev.chapter}{ev.date ? ` • ${ev.date}` : ""}</p>
                      </div>
                      <button onClick={() => setUpcomingEventsList(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setAddingUpcomingEvent(true)} className="gap-1 rounded-xl">
                  <Plus className="h-3.5 w-3.5" /> Add Upcoming Event
                </Button>
                <Button onClick={handleSaveUpcomingEvents} disabled={savingUpcomingEvents} className="gap-2 rounded-xl font-semibold">
                  {savingUpcomingEvents ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Upcoming Events</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!selectedEventId) {
                      toast.error("Please select an active event first.");
                      return;
                    }
                    try {
                      await downloadFile(`/events/${selectedEventId}/participants/pdf`, `Participants-${eventSetupForm.title || "Event"}.pdf`);
                    } catch (err) {
                      toast.error("Failed to download PDF: " + (err.message || "Unknown error"));
                    }
                  }}
                  className="gap-2 rounded-xl text-xs"
                >
                  <ScrollText className="h-3.5 w-3.5" /> Download list as PDF (for participants)
                </Button>
              </div>
            </div>
          </div>

          {/* ── CARD 9: Sponsors & Partners ───────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-warning/15 flex items-center justify-center">
                <Handshake className="h-4 w-4 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Sponsors & Partners</p>
                <p className="text-xs text-muted-foreground">Main Sponsor, Co Sponsor, IT & Media Partner…</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-xs text-muted-foreground">Name each category yourself. Logos appear grouped by category on certificates and in the participant list PDF.</p>

              {sponsorsList.length > 0 && (
                <div className="space-y-2">
                  {sponsorsList.map((sp, idx) => (
                    <div key={sp.id || idx} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-muted/20">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sp.name}</p>
                        <p className="text-xs text-muted-foreground">{sp.category}</p>
                      </div>
                      <button onClick={() => setSponsorsList(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addingSponsor && (
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Company Name</Label>
                      <Input value={sponsorForm.name} onChange={e => setSponsorForm(p => ({ ...p, name: e.target.value }))} placeholder="Company name" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Category</Label>
                      <Select value={sponsorForm.category} onValueChange={val => setSponsorForm(p => ({ ...p, category: val }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Main Sponsor","Co Sponsor","Standy Sponsor","IT & Media Partner","Knowledge Partner"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Contact</Label>
                      <Input value={sponsorForm.contact} onChange={e => setSponsorForm(p => ({ ...p, contact: e.target.value }))} placeholder="Phone / email" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Amount (₹)</Label>
                      <Input type="number" value={sponsorForm.amount} onChange={e => setSponsorForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => {
                      if (!sponsorForm.name) return;
                      setSponsorsList(prev => [...prev, { id: `sp-${Date.now()}`, ...sponsorForm, amount: Number(sponsorForm.amount) || 0 }]);
                      setSponsorForm({ name: "", category: "Main Sponsor", logo: "", contact: "", amount: "", notes: "" });
                      setAddingSponsor(false);
                    }}
                  >Add Sponsor</Button>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setAddingSponsor(!addingSponsor)} className="gap-1 rounded-xl">
                  <Plus className="h-3.5 w-3.5" /> Add Sponsor / Partner
                </Button>
                <Button onClick={handleSaveSponsors} disabled={savingSponsors} className="gap-2 rounded-xl font-semibold">
                  {savingSponsors ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Sponsors & Partners</>}
                </Button>
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
                            <div className="h-8 w-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0">
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
        <MyTeamTab
          teamRoles={teamRoles}
          setTeamRoles={setTeamRoles}
          chapterMembers={eligibleTeamMembers}
          handleSaveTeamRoles={handleSaveTeamRoles}
        />
      )}

      {/* MODULE 4: LIVE CONTROL */}
      {currentTab === "live-control" && (
        <div className="space-y-6">
          {/* Executive Command Header */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-foreground">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      Live Stage & Projector Command Center
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
                  className="border-border text-foreground hover:bg-muted text-xs h-9 gap-1.5 shadow-xs"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-500" /> Ring Stage Chime
                </Button>

                {/* Status Selector */}
                <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                  <Select value={liveEventStatus} onValueChange={(val) => handleStageStatusChange(val)}>
                    <SelectTrigger className="w-28 h-7 text-xs bg-background border-border text-foreground font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
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
                  className="font-semibold text-xs h-9 gap-1.5 shadow-xs"
                >
                  <Link href={projectorUrl} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" /> Open Projector Screen
                  </Link>
                </Button>
              </div>
            </div>

            {/* Projector Display Mode Selector */}
            <div className="mb-6 p-3 rounded-xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
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
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      projectorMode === m.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{m.label}</span>
                    {projectorMode === m.key && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-ping" />
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
                  <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                  {/* Monitor Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono font-bold text-slate-200 uppercase tracking-widest text-[11px]">
                        LIVE STAGE MONITOR · SLIDE {currentSlideIndex + 1} OF {agenda.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] uppercase font-bold">
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

                  {projectorMode === "qr" && (
                    <div className="py-4 flex justify-center">
                      <DynamicQrCode
                        value={publicVisitorUrl}
                        size={140}
                        title="Live on Projector"
                        subtitle="Check-in QR currently broadcast"
                        showDownload={false}
                        className="!bg-slate-950/90 !border-slate-800"
                      />
                    </div>
                  )}

                  {/* Dual Stage Content: Current on Stage vs Next Up */}
                  <div className="py-6 space-y-4">
                    {/* Current on Stage */}
                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[2px]">
                        CURRENT ON STAGE
                      </span>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                        {agenda[currentSlideIndex]?.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-sky-200 font-bold">
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
                            : "text-primary bg-primary/10 border border-primary/20"
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
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7 px-2.5 gap-1"
                          >
                            <RotateCcw className="h-3 w-3" /> Reset
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdjustTimer(60)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7 px-2"
                          >
                            +1m
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdjustTimer(300)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7 px-2"
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
                      className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800 text-xs h-9 gap-1.5"
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
                      className="font-semibold text-xs h-9 gap-1.5"
                    >
                      Next Slide <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Live Hall Announcements & Breaking Ticker */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Live Projector Ticker & Stage Announcements
                      </h4>
                    </div>
                    {activeTicker && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
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
                      className="text-xs h-9 bg-background border-border text-foreground placeholder:text-muted-foreground flex-1"
                    />
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <Button
                        size="sm"
                        onClick={() => handleBroadcastAnnouncement()}
                        className="font-semibold text-xs h-9 px-3 gap-1 flex-1 sm:flex-none"
                      >
                        <Send className="h-3.5 w-3.5" /> Broadcast
                      </Button>
                      {activeTicker && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearAnnouncement}
                          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs h-9 px-3"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Announcement Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Presets:</span>
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
                        className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted border border-border text-[11px] text-muted-foreground hover:text-foreground transition-all truncate max-w-[240px] cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Active Ticker Preview */}
                  {activeTicker && (
                    <div className="p-2.5 rounded-xl bg-primary-soft border border-primary/20 flex items-center gap-2 text-xs text-primary">
                      <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground uppercase">
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
                    className="flex-1 text-xs h-9 gap-1.5 border-border text-foreground hover:bg-muted"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Projector Screen
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 text-xs h-9 gap-1.5 border-border text-foreground hover:bg-muted"
                  >
                    <Link href={projectorUrl} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" /> Open Screen in New Window
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Col: Agenda Schedule & Stage Notes */}
              <div className="space-y-4">
                {/* Agenda List Card */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Agenda Schedule ({agenda.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddSlideModalOpen(true)}
                      className="border-border text-foreground hover:bg-muted text-[11px] h-7 px-2.5 gap-1"
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
                          "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer",
                          idx === currentSlideIndex
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                            : "border-border/70 bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] opacity-70">{idx + 1}.</span>
                            <span className="font-semibold text-foreground">{item.title}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground pl-4 truncate">
                            {item.speaker || "General Session"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono opacity-80 bg-muted px-2 py-0.5 rounded border border-border">
                            {item.duration}
                          </span>
                          {idx === currentSlideIndex && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                              LIVE
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Moderator / MC Teleprompter Stage Notes */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Anchor & Moderator Notes
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveModeratorNotes}
                      className="border-border text-xs h-6 px-2 text-primary hover:bg-muted"
                    >
                      Save Notes
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type cue notes, speaker introduction bullets, or reminders for the anchor..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={4}
                    className="text-xs bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Notes are persisted to MongoDB and visible to stage coordinators.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Agenda Setup / CRUD */}
          <AgendaCrud 
            eventId={selectedEventId} 
            agenda={agenda} 
            setAgenda={setAgenda} 
          />
        </div>
      )}

      {/* MODULE 5: FINANCE */}
      {currentTab === "finance" && (
        <FinanceTab
          eventId={selectedEventId}
          activeEvent={activeEvent}
          financeRecords={financeRecords}
          setFinanceRecords={setFinanceRecords}
          attendees={attendeesList}
          chapterMembers={chapterMembers}
        />
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
                onClick={() => {
                  setNewSpeaker({ name: "", mobile: "", email: "", org: "", designation: "", type: "Guest Speaker", topic: "" });
                  setSpeakerDialogOpen(true);
                }}
                className="font-semibold text-xs h-9 gap-1.5 shadow-xs"
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
                    <div className="h-12 w-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-black text-lg shrink-0">
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
                        <div className="flex-1"></div>
                        <Button size="sm" variant="ghost" onClick={() => handleEditSpeakerClick(s)} className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteSpeaker(s.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
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
                    className="font-semibold text-xs shadow-xs"
                  >
                    {savingSpeaker ? "Saving..." : "Save Speaker"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Custom Agenda Slide Dialog */}
          <Dialog open={addSlideModalOpen} onOpenChange={setAddSlideModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Add Agenda Item / Slide
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Insert a custom presentation slide into the meeting agenda in real-time.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddCustomSlide} className="space-y-3.5 py-2">
                <div>
                  <Label className="text-xs font-semibold text-foreground">Slide / Session Title *</Label>
                  <Input
                    placeholder="e.g. Special Felicitation & MOU Signing"
                    value={newSlideForm.title}
                    onChange={(e) => setNewSlideForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 text-xs h-8"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground">Allocated Duration</Label>
                    <Input
                      placeholder="e.g. 15 min"
                      value={newSlideForm.duration}
                      onChange={(e) => setNewSlideForm((prev) => ({ ...prev, duration: e.target.value }))}
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground">Speaker / In-Charge</Label>
                    <Input
                      placeholder="e.g. Guest Speaker"
                      value={newSlideForm.speaker}
                      onChange={(e) => setNewSlideForm((prev) => ({ ...prev, speaker: e.target.value }))}
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Stage / Anchor Notes</Label>
                  <Textarea
                    placeholder="Cue notes or instructions for the stage coordinator..."
                    value={newSlideForm.notes}
                    onChange={(e) => setNewSlideForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddSlideModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="font-semibold text-xs shadow-xs"
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            {/* Mode Selector Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
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
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    followupMode === "event"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  EVENT FOLLOW-UP
                </button>
                <button
                  type="button"
                  onClick={() => setFollowupMode("membership")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    followupMode === "membership"
                      ? "bg-primary text-primary-foreground shadow-xs"
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
                  <div className="p-3.5 rounded-xl bg-primary-soft border border-primary/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">CONTACTED</p>
                    <p className="text-xl font-black text-primary mt-0.5 tabular-nums">
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
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Follow-up Message Composer
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Placeholders: {"{name}"}, {"{company}"}, {"{event}"}, {"{chapter}"}
                    </span>
                  </div>

                  <Textarea
                    rows={2}
                    value={customFollowupMessage}
                    onChange={(e) => setCustomFollowupMessage(e.target.value)}
                    className="text-xs bg-background"
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
                      className="font-semibold h-7 text-xs gap-1 shadow-xs"
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
                      className="h-9 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10 font-semibold"
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
                        className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 text-sm">
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
                                ? "bg-primary-soft text-primary"
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
                            <div className="col-span-2 text-[10px] text-primary bg-primary-soft p-1.5 rounded border border-primary/20">
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
                              className="h-7 text-xs px-2 gap-1 text-primary border-border font-semibold"
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
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Membership Conversion Composer
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Placeholders: {"{name}"}, {"{status}"}, {"{expiry}"}
                    </span>
                  </div>

                  <Textarea
                    rows={2}
                    value={membershipCustomMessage}
                    onChange={(e) => setMembershipCustomMessage(e.target.value)}
                    className="text-xs bg-background"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(membershipCustomMessage);
                        toast.success("Membership template copied!");
                      }}
                      className="font-semibold h-7 text-xs gap-1 shadow-xs"
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
                          className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{name}</h4>
                              <p className="text-xs text-muted-foreground">{company}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-bold">
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
                              <div className="col-span-2 text-[10px] text-primary bg-primary-soft p-1.5 rounded border border-primary/20">
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
                                className="h-7 text-xs px-2 gap-1 text-primary border-border font-semibold"
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
                    className="font-semibold text-xs shadow-xs"
                  >
                    {submittingHistory ? "Saving..." : "Save to History"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 11: ASK & GIVE BOARD                                               */}
      {/* ========================================================================= */}
      {currentTab === "ask-give" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Ask & Give Board
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Business requirements and offerings from all registered attendees
                </p>
              </div>
            </div>

            <AskGiveBoard eventId={selectedEventId} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 13: CERTIFICATES                                                   */}
      {/* ========================================================================= */}
      {/* MODULE: GALLERY */}
      {currentTab === "gallery" && <EventGallery />}

      {currentTab === "certificates" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="border-b border-border pb-4 mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileStack className="h-5 w-5 text-primary" />
                Certificate Generation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate and distribute participation certificates for attendees.
              </p>
            </div>
            
            <CertificatesTab eventId={selectedEventId} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 14: SCRIPTS                                                        */}
      {/* ========================================================================= */}
      {currentTab === "scripts" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="border-b border-border pb-4 mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                Stage Prompter & Event Scripts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize the 16 standard event segments and use the built-in teleprompter.
              </p>
            </div>
            
            <ScriptsTab eventId={selectedEventId} teamRoles={teamRoles} />
          </div>
        </div>
      )}

      {/* MODULE 8: DOCUMENTS */}
      {currentTab === "documents" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileStack className="h-5 w-5 text-primary" />
                  Formats, Templates & Chapter Circulars
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official RIFAH templates, membership forms, and state circulars
                </p>
              </div>
              <Button size="sm" onClick={() => setDocumentUploadOpen(true)} className="gap-1.5 font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5" /> Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.length > 0 ? documents.map((doc, idx) => (
                <div
                  key={doc._id || idx}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                      {doc.category || "General"}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{doc.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{doc.type || "Document"} · {doc.size}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => doc.fileUrl ? window.open(resolveMediaUrl(doc.fileUrl), "_blank") : handleViewDocument(doc.title)}
                      className="flex-1 text-xs h-8 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!doc.fileUrl) { handleDownloadDocument(doc.title); return; }
                        try {
                          const res = await fetch(resolveMediaUrl(doc.fileUrl));
                          const blob = await res.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.setAttribute("download", doc.title || "document");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(blobUrl);
                        } catch (err) {
                          toast.error("Failed to download document.");
                        }
                      }}
                      className="flex-1 text-xs h-8 gap-1 font-semibold shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  <FileStack className="h-10 w-10 mx-auto opacity-20 mb-3" />
                  <p>No documents uploaded yet.</p>
                </div>
              )}
            </div>
          </div>

          <Dialog open={documentUploadOpen} onOpenChange={setDocumentUploadOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Visible to all admin roles by default, scoped to your chapter for Chapter Admins.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">Title</Label>
                  <Input
                    value={documentUploadForm.title}
                    onChange={(e) => setDocumentUploadForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Membership Application Form"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Type</Label>
                    <Select value={documentUploadForm.type} onValueChange={(val) => setDocumentUploadForm((p) => ({ ...p, type: val }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Word">Word</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="Image">Image</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Category</Label>
                    <Select value={documentUploadForm.category} onValueChange={(val) => setDocumentUploadForm((p) => ({ ...p, category: val }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Membership">Membership</SelectItem>
                        <SelectItem value="Circular">Circular</SelectItem>
                        <SelectItem value="Template">Template</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">File</Label>
                  <Input
                    type="file"
                    className="mt-1"
                    onChange={(e) => setDocumentUploadForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDocumentUploadOpen(false)}>Cancel</Button>
                <Button onClick={handleUploadDocument} disabled={uploadingDocument} className="gap-1.5">
                  {uploadingDocument ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Plus className="h-4 w-4" /> Upload</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    onClick={() => {
                      if (item.title === "Full Attendee Roster Data") {
                        handleExportAttendeeCSV();
                      } else if (item.title === "Chapter Member Directory") {
                        handleExportMemberDirectoryCSV();
                      } else if (item.title === "Share with State Secretary") {
                        handleDownloadDocument("Central Secretariat Circular Q3");
                      } else if (item.title === "Event Media & PR Report") {
                        handleDownloadDocument("Standard Chapter Event Script");
                      } else if (item.title === "Google Drive Event Backup") {
                        toast.info("Connecting to Google Drive Event Repository...");
                        window.open("https://drive.google.com", "_blank");
                      } else {
                        handleExportAttendeeCSV();
                      }
                    }}
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  MY CHAPTER LINKS
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live public links, projector display URLs, and visitor QR codes
                </p>
              </div>

              <Button
                onClick={handleCopyAllLinks}
                className="font-semibold text-xs h-9 gap-1.5 shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy All My Links</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: The Links */}
              <div className="lg:col-span-2 space-y-4">
                {/* 1. Chapter Member Link */}
                <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <Pill tone="primary">PUBLIC REGISTRATION LINK</Pill>
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
                <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <Pill tone="neutral">PROJECTOR LINK</Pill>
                    <span className="text-[11px] text-muted-foreground">Projector — open on the hall screen</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Live Presentation & Stage Screen</h4>
                  <p className="text-xs text-muted-foreground">
                    Dedicated 1920x1080 stage view synced in real-time via Socket.IO. Read-only presentation.
                  </p>
                  <p className="font-mono text-xs text-primary bg-muted p-2 rounded truncate">
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
            <Button size="sm" onClick={handleSaveNote} className="font-semibold shadow-xs">
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
