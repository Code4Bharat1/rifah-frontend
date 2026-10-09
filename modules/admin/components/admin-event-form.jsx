"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
<<<<<<< Updated upstream
import { Loader2, ArrowLeft, Image as ImageIcon, X, Check, ChevronsUpDown, Video, Sparkles, Copy, ExternalLink, Lock } from "lucide-react";
=======
import { Loader2, ArrowLeft, Image as ImageIcon, X, Check, ChevronsUpDown, Video, Sparkles, Copy, ExternalLink, Plane, Plus, Trash2, Calendar, CreditCard, ShieldCheck, AlertCircle, Percent } from "lucide-react";
>>>>>>> Stashed changes
import Link from "next/link";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@shared/components/rifah/location-picker").then((mod) => mod.LocationPicker),
  { ssr: false }
);
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import { cn } from "@shared/lib/utils";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { eventApi } from "@shared/lib/api-services";
import { useStates, useChapters } from "@shared/hooks/use-rifah-api";

import { useAuth } from "@shared/providers/auth-provider";

function MultiSelectDropdown({ options, selected, toggleOption, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-md justify-between h-auto min-h-[40px] px-3 py-2 font-normal"
        >
          <div className="flex flex-wrap gap-1 text-left">
            {(!selected || selected.length === 0) ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map(item => (
                <div key={item} className="bg-primary/10 text-primary text-xs rounded-full px-2.5 py-0.5 font-medium border border-primary/20">
                  {item}
                </div>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={`${option}-${index}`}
                  value={option}
                  onSelect={() => toggleOption(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (selected || []).includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const EVENT_CATEGORIES = [
  "Meet",
  "Workshop",
  "Seminar",
  "Delegation Tour",
  "Sports",
  "Other Activity",
];

const INDUSTRY_SECTORS = [
  "Networking",
  "Business Growth",
  "IT & Digital Services",
  "Finance & Taxation",
  "Import & Export",
  "Women Empowerment",
  "Entrepreneurship Development Program",
  "Start-Up",
  "Skill Development",
  "Delegation Tour/Visit",
  "Government Scheme & Supports",
  "Other",
];

export function AdminEventForm({ initialData = null, isEditMode = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
<<<<<<< Updated upstream
  const isChapterAdmin = pathname?.startsWith("/chapter-admin") || user?.role === "chapter_admin";
  const isStateAdmin = pathname?.startsWith("/state-admin") || user?.role === "state_admin";
  const isCentralAdmin = !isChapterAdmin && !isStateAdmin && (pathname?.startsWith("/admin") || user?.role === "central_admin");
  const basePath = isChapterAdmin ? "/chapter-admin/events" : isStateAdmin ? "/state-admin/events" : "/admin/events";
  const role = isChapterAdmin ? "chapter_admin" : isStateAdmin ? "state_admin" : (user?.role || "admin");
=======
  const isCentralAdmin =
    ["central_admin", "super_admin", "admin"].includes(user?.role) ||
    user?.activeWorkspace?.panelType === "central-admin" ||
    user?.activeWorkspace?.workspaceId === "admin";
  const basePath = user?.role === "chapter_admin" ? "/chapter-admin/events" : user?.role === "state_admin" ? "/state-admin/events" : "/admin/events";
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: statesData } = useStates();
  const { data: chaptersData } = useChapters();

  const stateOptions = Array.from(new Set(["All", ...(statesData || []).map(s => s.state || s.name || s)]));
  
  let chapterOptions = ["All"];
  if (user?.role === "state_admin" && user?.state) {
    const userState = user.state.toLowerCase();
    chapterOptions = Array.from(new Set(["All", ...(chaptersData || []).filter(c => c.state?.toLowerCase() === userState).map(c => c.name || c.city || c)]));
  } else {
    chapterOptions = Array.from(new Set(["All", ...(chaptersData || []).map(c => c.name || c.city || c)]));
  }

  let chapterSelectionList = [];
  if (isStateAdmin && user?.state) {
    const userState = user.state.toLowerCase();
    chapterSelectionList = Array.from(
      new Set(
        (chaptersData || [])
          .filter(c => c.state?.toLowerCase() === userState)
          .map((c) => c.name || c.city || c)
          .filter(Boolean)
      )
    );
  } else {
    chapterSelectionList = Array.from(
      new Set(
        (chaptersData || [])
          .map((c) => c.name || c.city || c)
          .filter(Boolean)
      )
    );
  }

  const handleChapterChange = (selectedChapter) => {
    const matched = (chaptersData || []).find(
      (c) =>
        (c.name && c.name.toLowerCase() === selectedChapter.toLowerCase()) ||
        (c.city && c.city.toLowerCase() === selectedChapter.toLowerCase())
    );
    const autoCity = matched?.city || selectedChapter.replace(/\s*[Cc]hapter\s*/gi, "").trim();

    setFormData((prev) => ({
      ...prev,
      chapter: selectedChapter,
      city: autoCity || prev.city,
      targetChapters: selectedChapter === "All" ? ["All"] : [selectedChapter],
    }));
  };

  // Helper to ensure 4-digit year input
  const sanitizeDateInput = (val) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts[0] && parts[0].length > 4) {
      parts[0] = parts[0].slice(0, 4);
      return parts.join("-");
    }
    return val;
  };

  // Helper to parse "10:00 AM - 01:00 PM" into { start: "10:00", end: "13:00" }
  const parseTimeString = (timeStr) => {
    if (!timeStr) return { startTime: "10:00", endTime: "13:00" };
    try {
      const parts = timeStr.split("-").map(s => s.trim());
      if (parts.length !== 2) return { startTime: "10:00", endTime: "13:00" };
      
      const to24Hour = (timeStr12h) => {
        const [time, modifier] = timeStr12h.split(" ");
        if (!time || !modifier) return "10:00";
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = "00";
        }
        if (modifier.toUpperCase() === "PM") {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      };

      return {
        startTime: to24Hour(parts[0]),
        endTime: to24Hour(parts[1])
      };
    } catch (e) {
      return { startTime: "10:00", endTime: "13:00" };
    }
  };

  const initialFormState = {
    title: "",
    description: "",
    date: "",
    startTime: "10:00",
    endTime: "13:00",
    mode: "Offline",
    meetingLink: "",
    eventCategory: "Meet",
    industrySector: "Networking",
    sportName: "",
    sportVenue: "",
    teamsAllowed: "",
<<<<<<< Updated upstream
    location: "",
    city: "",
    chapter: "",
=======
    delegationDestination: "",
    delegationCountry: "",
    delegationTravelDates: "",
    delegationInclusions: "",
    delegationVisaGuidelines: "",
    delegationInstallments: [
      {
        installmentNumber: 1,
        title: "Registration & Advance Booking",
        dueDate: "",
        memberAmount: "",
        nonMemberAmount: "",
        notes: "Seat reservation token for delegation",
      },
    ],
    location: "Chamber Conference Hall",
    city: "Mumbai",
    chapter: "Mumbai Chapter",
>>>>>>> Stashed changes
    targetAudience: ["All"],
    targetStates: ["All"],
    targetChapters: ["All"],
    registrationAccess: "All",
    cover: null,
    scheduledDate: "",
    scheduledTime: "08:00",
    isPaid: false,
    ticketPrice: "",
    memberPrice: "",
    totalSeats: "",
    isRegistrationClosed: false,
    seatsFull: false,
    registrationClosingDate: "",
    registrationClosingTime: "23:59",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      const parsedTime = parseTimeString(initialData.time);
      
      let initialSchDate = "";
      let initialSchTime = "08:00";
      if (initialData.scheduledAt) {
        const d = new Date(initialData.scheduledAt);
        initialSchDate = d.toISOString().split("T")[0];
        initialSchTime = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      }

      let initialRegCloseDate = "";
      let initialRegCloseTime = "23:59";
      if (initialData.registrationClosingDate) {
        const rc = new Date(initialData.registrationClosingDate);
        if (!isNaN(rc.getTime())) {
          initialRegCloseDate = rc.toISOString().split("T")[0];
          initialRegCloseTime = `${rc.getHours().toString().padStart(2, "0")}:${rc.getMinutes().toString().padStart(2, "0")}`;
        }
      }

      setFormData({
        ...initialFormState,
        ...initialData,
        chapter: initialData.chapter || "",
        city: initialData.city || "",
        isPaid: Boolean(initialData.isPaid),
        ticketPrice: initialData.isPaid ? (initialData.ticketPrice ?? "") : "",
        memberPrice: initialData.memberPrice || "",
        location: initialData.venue || initialData.location || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : "",
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        totalSeats: initialData.totalSeats || "",
        scheduledDate: initialSchDate,
        scheduledTime: initialSchTime,
<<<<<<< Updated upstream
        eventCategory: initialData.eventCategory || "Meet",
        industrySector: initialData.industrySector || "Networking",
        isRegistrationClosed: Boolean(initialData.isRegistrationClosed || initialData.seatsFull),
        seatsFull: Boolean(initialData.isRegistrationClosed || initialData.seatsFull),
        registrationClosingDate: initialRegCloseDate,
        registrationClosingTime: initialRegCloseTime,
=======
        eventCategory: initialData.eventCategory || (initialData.isDelegation ? "Delegation" : "Meet"),
>>>>>>> Stashed changes
        sportName: initialData.sportDetails?.sportName || "",
        sportVenue: initialData.sportDetails?.venue || "",
        teamsAllowed: initialData.sportDetails?.teamsAllowed || "",
        delegationDestination: initialData.delegationDetails?.destination || "",
        delegationCountry: initialData.delegationDetails?.country || "",
        delegationTravelDates: initialData.delegationDetails?.travelDates || "",
        delegationInclusions: initialData.delegationDetails?.inclusions || "",
        delegationVisaGuidelines: initialData.delegationDetails?.visaGuidelines || "",
        delegationInstallments: Array.isArray(initialData.delegationInstallments) && initialData.delegationInstallments.length > 0
          ? initialData.delegationInstallments.map((i, idx) => ({
              installmentNumber: i.installmentNumber || idx + 1,
              title: i.title || `Installment #${idx + 1}`,
              dueDate: i.dueDate ? new Date(i.dueDate).toISOString().split("T")[0] : "",
              memberAmount: i.memberAmount ?? "",
              nonMemberAmount: i.nonMemberAmount ?? "",
              notes: i.notes || "",
            }))
          : [
              {
                installmentNumber: 1,
                title: "Registration & Advance Booking",
                dueDate: "",
                memberAmount: "",
                nonMemberAmount: "",
                notes: "Seat reservation token for delegation",
              },
            ],
        cover: null, // Keep cover null to allow new upload
        poster: null,
      });
    } else if (!initialData && user) {
      const userChapter = user?.chapter || "";
      const matchedChapter = (chaptersData || []).find(
        (c) =>
          (c.name && userChapter && c.name.toLowerCase() === userChapter.toLowerCase()) ||
          (c.city && userChapter && c.city.toLowerCase() === userChapter.toLowerCase())
      );

      const resolvedChapter = userChapter || matchedChapter?.name || "";
      const cleanChapterCity = userChapter.replace(/\s*[Cc]hapter\s*/gi, "").trim();
      const resolvedCity = user?.city || matchedChapter?.city || cleanChapterCity || "";
      const resolvedState = user?.state || matchedChapter?.state || "";

      if (isChapterAdmin || user.role === "chapter_admin") {
        setFormData((prev) => ({
          ...prev,
          chapter: resolvedChapter || prev.chapter,
          city: prev.city || resolvedCity,
          targetChapters: resolvedChapter ? [resolvedChapter] : prev.targetChapters,
          state: resolvedState || prev.state,
          targetStates: resolvedState ? [resolvedState] : prev.targetStates,
        }));
      } else if (isStateAdmin || user.role === "state_admin") {
        setFormData((prev) => ({
          ...prev,
          chapter: prev.chapter || resolvedChapter,
          city: prev.city || resolvedCity,
          state: resolvedState || prev.state,
          targetStates: resolvedState ? [resolvedState] : prev.targetStates,
        }));
      } else {
        // Central Admin
        setFormData((prev) => ({
          ...prev,
          chapter: prev.chapter || resolvedChapter,
          city: prev.city || resolvedCity,
        }));
      }
    }
  }, [initialData, user, chaptersData, isChapterAdmin, isStateAdmin]);

  const addDelegationInstallment = () => {
    setFormData((prev) => {
      const current = prev.delegationInstallments || [];
      const nextNum = current.length + 1;
      return {
        ...prev,
        delegationInstallments: [
          ...current,
          {
            installmentNumber: nextNum,
            title: `Installment #${nextNum}`,
            dueDate: "",
            memberAmount: "",
            nonMemberAmount: "",
            notes: "",
          },
        ],
      };
    });
  };

  const removeDelegationInstallment = (index) => {
    setFormData((prev) => {
      const current = prev.delegationInstallments || [];
      if (current.length <= 1) {
        toast.error("At least one installment is required for a Delegation event.");
        return prev;
      }
      const updated = current
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, installmentNumber: i + 1 }));
      return { ...prev, delegationInstallments: updated };
    });
  };

  const updateDelegationInstallment = (index, field, value) => {
    setFormData((prev) => {
      const current = [...(prev.delegationInstallments || [])];
      current[index] = { ...current[index], [field]: value };
      return { ...prev, delegationInstallments: current };
    });
  };

  const toggleAudience = (audience) => {
    setFormData((prev) => {
      const current = prev.targetAudience || [];
      if (audience === "All") {
        return { ...prev, targetAudience: current.includes("All") ? [] : ["All"] };
      }
      const withoutAll = current.filter(a => a !== "All");
      if (withoutAll.includes(audience)) {
        return { ...prev, targetAudience: withoutAll.filter((a) => a !== audience) };
      }
      return { ...prev, targetAudience: [...withoutAll, audience] };
    });
  };

  const toggleChapter = (chapter) => {
    setFormData((prev) => {
      const current = prev.targetChapters || [];
      if (chapter === "All") {
        return { ...prev, targetChapters: current.includes("All") ? [] : ["All"] };
      }
      const withoutAll = current.filter(a => a !== "All");
      if (withoutAll.includes(chapter)) {
        return { ...prev, targetChapters: withoutAll.filter((a) => a !== chapter) };
      }
      return { ...prev, targetChapters: [...withoutAll, chapter] };
    });
  };

  const toggleState = (state) => {
    setFormData((prev) => {
      const current = prev.targetStates || [];
      if (state === "All") {
        return { ...prev, targetStates: current.includes("All") ? [] : ["All"] };
      }
      const withoutAll = current.filter(a => a !== "All");
      if (withoutAll.includes(state)) {
        return { ...prev, targetStates: withoutAll.filter((a) => a !== state) };
      }
      return { ...prev, targetStates: [...withoutAll, state] };
    });
  };

  const autoGenerateMeet = async () => {
    setGeneratingMeet(true);
    try {
      const res = await eventApi.generateMeetLink({
        title: formData.title || "RIFAH Event Meeting",
        description: formData.description || "",
        date: formData.date || "",
        startTime: formData.startTime || "10:00",
        endTime: formData.endTime || "13:00",
      });

      const link = res?.data?.meetingLink || res?.meetingLink;
      if (link) {
        setFormData((prev) => ({ ...prev, meetingLink: link }));
        toast.success("Google Meet link generated!");
      }
    } catch (err) {
      console.error("Failed to generate Google Meet link:", err);
      toast.error("Could not auto-generate link. You can enter one manually.");
    } finally {
      setGeneratingMeet(false);
    }
  };

  const handleModeChange = async (val) => {
    setFormData((prev) => ({ ...prev, mode: val }));
    if ((val === "Online" || val === "Hybrid") && !formData.meetingLink) {
      setGeneratingMeet(true);
      try {
        const res = await eventApi.generateMeetLink({
          title: formData.title || "RIFAH Event Meeting",
          description: formData.description || "",
          date: formData.date || "",
          startTime: formData.startTime || "10:00",
          endTime: formData.endTime || "13:00",
        });

        const link = res?.data?.meetingLink || res?.meetingLink;
        if (link) {
          setFormData((prev) => ({ ...prev, mode: val, meetingLink: link }));
          toast.success("Google Meet link auto-generated!");
        }
      } catch (err) {
        console.error("Auto meet error:", err);
      } finally {
        setGeneratingMeet(false);
      }
    }
  };

  const formatTimeStr = (start, end) => {
    const to12h = (time24h) => {
      if (!time24h) return "10:00 AM";
      let [h, m] = time24h.split(":");
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
    };
    return `${to12h(start)} - ${to12h(end)}`;
  };

  const handleSave = async (targetStatus) => {
    let newErrors = {};

    if (!formData.title) newErrors.title = "Event Title is required";
<<<<<<< Updated upstream

    const currentChapter = (formData.chapter || user?.chapter || (isChapterAdmin ? "Bengaluru Chapter" : (isCentralAdmin ? "Global" : ""))).trim();
    if (!currentChapter && !isCentralAdmin) {
      newErrors.chapter = "Chapter Name is required";
    }

    const currentCity = (formData.city || (currentChapter && currentChapter !== "Global" ? currentChapter.replace(/\s*[Cc]hapter\s*/gi, "").trim() : (isCentralAdmin ? "Global" : ""))).trim();
    if (!currentCity && !isCentralAdmin) {
      newErrors.city = "City is required";
    }

    if (!formData.date) {
      newErrors.date = "Event Date is required";
    } else {
      const y = formData.date.split("-")[0];
      if (!y || y.length !== 4) {
        newErrors.date = "Year must be exactly 4 digits (e.g. 2026)";
      }
    }
    if (!formData.startTime) newErrors.startTime = "Start Time is required";
    if (!formData.endTime) newErrors.endTime = "End Time is required";

    if (formData.isPaid === undefined || formData.isPaid === null) {
      newErrors.isPaid = "Event Fee selection is required";
=======
    if (!formData.date) newErrors.date = "Event Date is required";

    const isDelegation = formData.eventCategory === "Delegation";

    if (!isDelegation) {
      if (!formData.startTime) newErrors.startTime = "Start Time is required";
      if (!formData.endTime) newErrors.endTime = "End Time is required";
>>>>>>> Stashed changes
    }
    
    if (!isEditMode && formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "You cannot create an event in the past. Please select today's date or a future date.";
      }
    }

    if (formData.registrationClosingDate) {
      const regYear = formData.registrationClosingDate.split("-")[0];
      if (!regYear || regYear.length !== 4) {
        newErrors.registrationClosingDate = "Year must be exactly 4 digits (e.g. 2026)";
      }
      if (formData.date && formData.registrationClosingDate > formData.date) {
        newErrors.registrationClosingDate = "Registration closing date cannot be after the event date.";
      }
    }

    if (targetStatus === "Scheduled") {
      if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled Date is required";
      if (!formData.scheduledTime) newErrors.scheduledTime = "Scheduled Time is required";

      if (formData.scheduledDate && formData.scheduledTime) {
        const scheduleDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);
        if (scheduleDateTime < new Date()) {
          newErrors.scheduledTime = "Cannot schedule in the past. Please select a future time.";
        }
      }
      if (formData.date && formData.scheduledDate > formData.date) {
        newErrors.scheduledDate = "Scheduled (publication) date cannot be after the event date.";
      }
    }

    if (isDelegation) {
      if (!isCentralAdmin) {
        toast.error("Only Central Admin has permission to create or manage a Delegation event.");
        return;
      }

      const totalMemberTarget = Number(formData.memberPrice) || 0;
      const totalNonMemberTarget = Number(formData.ticketPrice) || 0;

      if (!formData.memberPrice || totalMemberTarget <= 0) {
        newErrors.memberPrice = "Total Member Base Fee is required (> 0)";
      }
      if (!formData.ticketPrice || totalNonMemberTarget <= 0) {
        newErrors.ticketPrice = "Total Non-Member Base Fee is required (> 0)";
      }

      if (!Array.isArray(formData.delegationInstallments) || formData.delegationInstallments.length === 0) {
        newErrors.delegationInstallments = "At least one installment milestone is required for delegation events.";
      } else {
        let sumMemberEMI = 0;
        let sumNonMemberEMI = 0;

        formData.delegationInstallments.forEach((inst, idx) => {
          if (!inst.title?.trim()) {
            newErrors[`inst_${idx}_title`] = `Title is required for Installment #${idx + 1}`;
          }
          if (!inst.dueDate) {
            newErrors[`inst_${idx}_dueDate`] = `Due date is required for Installment #${idx + 1}`;
          }
          const mAmt = Number(inst.memberAmount) || 0;
          const nmAmt = Number(inst.nonMemberAmount) || 0;
          if (!inst.memberAmount || mAmt <= 0) {
            newErrors[`inst_${idx}_memberAmount`] = `Valid Member amount (> 0) is required for Installment #${idx + 1}`;
          }
          if (!inst.nonMemberAmount || nmAmt <= 0) {
            newErrors[`inst_${idx}_nonMemberAmount`] = `Valid Non-Member amount (> 0) is required for Installment #${idx + 1}`;
          }
          sumMemberEMI += mAmt;
          sumNonMemberEMI += nmAmt;
        });

        if (totalMemberTarget > 0 && sumMemberEMI > totalMemberTarget) {
          newErrors.delegationMemberExceeded = `Total Member EMIs (₹${sumMemberEMI.toLocaleString("en-IN")}) exceed Total Member Fee (₹${totalMemberTarget.toLocaleString("en-IN")}). Installments must not exceed Total Fee.`;
        }
        if (totalNonMemberTarget > 0 && sumNonMemberEMI > totalNonMemberTarget) {
          newErrors.delegationNonMemberExceeded = `Total Non-Member EMIs (₹${sumNonMemberEMI.toLocaleString("en-IN")}) exceed Total Non-Member Fee (₹${totalNonMemberTarget.toLocaleString("en-IN")}). Installments must not exceed Total Fee.`;
        }
      }
    } else if (formData.isPaid) {
      const priceNum = Number(formData.ticketPrice);
      if (!formData.ticketPrice || isNaN(priceNum) || priceNum <= 0) {
        newErrors.ticketPrice = "Please enter a valid base ticket price greater than 0 for paid events";
      }
      if (formData.memberPrice !== "") {
        const memPriceNum = Number(formData.memberPrice);
        if (isNaN(memPriceNum) || memPriceNum < 0) {
          newErrors.memberPrice = "Please enter a valid Member Price (must be 0 or greater)";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.delegationMemberExceeded || newErrors.delegationNonMemberExceeded) {
        toast.error("Installment EMIs exceed the Total Package Fees. Please adjust amounts.");
      } else {
        toast.error("Please fix the highlighted errors before saving.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setErrors({});

    if (targetStatus === "Upcoming") setLoading(true);
    else setSavingDraft(true);

    try {
      let scheduledAt = null;
      if (targetStatus === "Scheduled") {
        scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);
      }

<<<<<<< Updated upstream
      let registrationClosingDate = null;
      if (formData.registrationClosingDate) {
        registrationClosingDate = new Date(`${formData.registrationClosingDate}T${formData.registrationClosingTime || "23:59"}:00`);
      }

      const isPaid = Boolean(formData.isPaid);
      const ticketPrice = isPaid ? Number(formData.ticketPrice) : 0;
=======
      const totalMemberBase = isDelegation
        ? (Number(formData.memberPrice) || 0)
        : (Number(formData.memberPrice) || 0);
      const totalNonMemberBase = isDelegation
        ? (Number(formData.ticketPrice) || 0)
        : (Number(formData.ticketPrice) || 0);

      const isPaid = isDelegation ? true : Boolean(formData.isPaid);
      const ticketPrice = isPaid ? totalNonMemberBase : 0;
      const memberPrice = isPaid ? totalMemberBase : 0;
>>>>>>> Stashed changes
      const fee = isPaid ? `₹${ticketPrice}` : "Free";

      const chapterVal = currentChapter;
      const cityVal = currentCity;

      const payload = {
        ...formData,
        chapter: chapterVal,
        city: cityVal,
        targetStates: isCentralAdmin ? formData.targetStates : (user?.state ? [user.state] : ["All"]),
        targetChapters: isChapterAdmin ? [chapterVal] : formData.targetChapters,
        isPaid,
        ticketPrice,
<<<<<<< Updated upstream
        memberPrice: isPaid ? (Number(formData.memberPrice) || 0) : 0,
        gstRate: isPaid ? 18 : 0,
=======
        memberPrice,
>>>>>>> Stashed changes
        fee,
        isDelegation,
        time: isDelegation ? (formData.delegationTravelDates || "Multi-Day Delegation") : formatTimeStr(formData.startTime, formData.endTime),
        mode: isDelegation ? "In-person" : formData.mode,
        venue: formData.location,
        status: targetStatus,
        scheduledAt,
<<<<<<< Updated upstream
        industrySector: formData.industrySector || "Networking",
        isRegistrationClosed: Boolean(formData.isRegistrationClosed),
        seatsFull: Boolean(formData.seatsFull),
        registrationClosingDate,
=======
        delegationDetails: isDelegation ? {
          destination: formData.delegationDestination,
          country: formData.delegationCountry,
          travelDates: formData.delegationTravelDates,
          inclusions: formData.delegationInclusions,
          visaGuidelines: formData.delegationVisaGuidelines,
        } : undefined,
        delegationInstallments: isDelegation ? formData.delegationInstallments.map((inst, idx) => ({
          installmentNumber: idx + 1,
          title: inst.title,
          dueDate: inst.dueDate,
          memberAmount: Number(inst.memberAmount) || 0,
          nonMemberAmount: Number(inst.nonMemberAmount) || 0,
          notes: inst.notes || "",
        })) : undefined,
>>>>>>> Stashed changes
        sportDetails: formData.eventCategory === "Sports" ? {
          sportName: formData.sportName,
          venue: formData.sportVenue,
          teamsAllowed: Number(formData.teamsAllowed) || 0,
        } : undefined,
      };
      delete payload.startTime;
      delete payload.endTime;
      delete payload.scheduledDate;
      delete payload.scheduledTime;
      delete payload.registrationClosingTime;
      delete payload.cover;
      delete payload.poster;
      delete payload.sportName;
      delete payload.sportVenue;
      delete payload.teamsAllowed;
      delete payload.delegationDestination;
      delete payload.delegationCountry;
      delete payload.delegationTravelDates;
      delete payload.delegationInclusions;
      delete payload.delegationVisaGuidelines;

      let eventId = isEditMode ? initialData._id : null;

      if (isEditMode) {
        await eventApi.update(eventId, payload);
        toast.success(`Event ${targetStatus.toLowerCase()} successfully`);
      } else {
        const created = await eventApi.create(payload);
        eventId = created?.data?._id || created?._id;
        toast.success(`Event ${targetStatus.toLowerCase()} successfully`);
      }

      if (formData.cover && eventId) {
        toast.info("Uploading banner image...");
        await eventApi.uploadCover(eventId, formData.cover);
        toast.success("Banner image uploaded");
      }
      
      if (formData.poster && eventId) {
        toast.info("Uploading poster image...");
        await eventApi.uploadPoster(eventId, formData.poster);
        toast.success("Poster image uploaded");
      }

      router.push(basePath);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save event");
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  return (
    <AppShell
      role={role}
      title={isEditMode ? "Edit Event" : "Create New Event"}
      subtitle={isEditMode ? "Update event details and manage publishing." : "Draft a new chamber event or workshop."}
      actions={
        <Button variant="outline" asChild>
          <Link href={basePath}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Panel title="Event Details" className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual Export Growth Conclave 2026"
                className={`text-lg font-medium ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  required
                  min="2020-01-01"
                  max="2099-12-31"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: sanitizeDateInput(e.target.value) })}
                  className={errors.date ? 'border-destructive' : ''}
                />
                {errors.date && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time <span className="text-destructive">*</span></Label>
                <Input
                  id="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={errors.startTime ? 'border-destructive' : ''}
                />
                {errors.startTime && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.startTime}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time <span className="text-destructive">*</span></Label>
                <Input
                  id="endTime"
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={errors.endTime ? 'border-destructive' : ''}
                />
                {errors.endTime && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.endTime}</p>}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${(formData.mode === "Online" || formData.mode === "Hybrid") ? "md:grid-cols-2" : "md:grid-cols-2"} gap-6`}>
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select value={formData.mode} onValueChange={handleModeChange}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.mode === "Online" || formData.mode === "Hybrid") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="meetingLink" className="flex items-center gap-2 font-medium text-sm text-foreground whitespace-nowrap">
                      <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Video className="h-3.5 w-3.5" />
                      </div>
                      <span>Meeting Link</span>
                    </Label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground rounded-md font-normal"
                        title="Create a new Google Meet room in a new tab"
                      >
                        <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          <span>New Meet</span>
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={autoGenerateMeet}
                        disabled={generatingMeet}
                        className="h-7 text-xs px-2.5 gap-1.5 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-md font-medium transition-colors"
                      >
                        {generatingMeet ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{formData.meetingLink ? "Re-generate" : "Generate"}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      id="meetingLink"
                      placeholder="https://meet.google.com/..."
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className={`font-mono text-sm h-10 ${formData.meetingLink ? "pr-20" : ""} ${generatingMeet ? "opacity-60" : ""}`}
                    />
                    {formData.meetingLink && (
                      <div className="absolute right-1.5 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
                          title="Copy meeting link"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.meetingLink);
                            toast.success("Meeting link copied to clipboard!");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <div className="h-3.5 w-px bg-border my-auto" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded text-muted-foreground hover:text-emerald-600"
                          title="Open link in new tab"
                          asChild
                        >
                          <a href={formData.meetingLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isCentralAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chapter">
                      Chapter Name <span className="text-destructive">*</span>
                    </Label>
                    {isChapterAdmin && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        Auto-filled
                      </span>
                    )}
                  </div>
                  {isChapterAdmin ? (
                    <div className="relative flex items-center">
                      <Input
                        id="chapter"
                        value={formData.chapter || user?.chapter || ""}
                        readOnly
                        disabled
                        className="bg-muted/50 cursor-not-allowed font-medium text-foreground pr-24 border-emerald-500/30"
                      />
                      <div className="absolute right-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Locked</span>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={formData.chapter || ""}
                      onValueChange={handleChapterChange}
                    >
                      <SelectTrigger id="chapter" className={errors.chapter ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Chapter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {chapterSelectionList.map((chap) => (
                          <SelectItem key={chap} value={chap}>
                            {chap}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-[12px] text-muted-foreground">
                    {isChapterAdmin
                      ? `Auto-assigned to your chapter (${mounted ? (formData.chapter || user?.chapter || "Bengaluru Chapter") : "..."}).`
                      : "Select the chapter creating or hosting this event."}
                  </p>
                  {errors.chapter && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.chapter}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input
                    id="city"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  <p className="text-[12px] text-muted-foreground">
                    Auto-filled based on chapter. You can edit if the venue is in another city.
                  </p>
                  {errors.city && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.city}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
<<<<<<< Updated upstream
                <Label htmlFor="eventCategory">Event Category <span className="text-destructive">*</span></Label>
                <Select value={formData.eventCategory} onValueChange={(val) => setFormData({ ...formData, eventCategory: val })}>
=======
                <Label htmlFor="eventCategory">Event Category</Label>
                <Select
                  value={formData.eventCategory}
                  onValueChange={(val) => {
                    setFormData({
                      ...formData,
                      eventCategory: val,
                      isPaid: val === "Delegation" ? true : formData.isPaid,
                    });
                  }}
                >
>>>>>>> Stashed changes
                  <SelectTrigger id="eventCategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
<<<<<<< Updated upstream
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industrySector">Industry Sector <span className="text-destructive">*</span></Label>
                <Select value={formData.industrySector} onValueChange={(val) => setFormData({ ...formData, industrySector: val })}>
                  <SelectTrigger id="industrySector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        {sec}
                      </SelectItem>
                    ))}
=======
                    <SelectItem value="Meet">Meet</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    {isCentralAdmin && (
                      <SelectItem value="Delegation">Delegation (Central Only)</SelectItem>
                    )}
>>>>>>> Stashed changes
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.eventCategory === "Delegation" && (() => {
              const installments = formData.delegationInstallments || [];
              const totMemBase = installments.reduce((acc, i) => acc + (Number(i.memberAmount) || 0), 0);
              const totMemGst = Math.round(totMemBase * 0.05 * 100) / 100;
              const totMemTcs = Math.round(totMemBase * 0.02 * 100) / 100;
              const totMemTotal = Math.round((totMemBase + totMemGst + totMemTcs) * 100) / 100;

              const totNonMemBase = installments.reduce((acc, i) => acc + (Number(i.nonMemberAmount) || 0), 0);
              const totNonMemGst = Math.round(totNonMemBase * 0.05 * 100) / 100;
              const totNonMemTcs = Math.round(totNonMemBase * 0.02 * 100) / 100;
              const totNonMemTotal = Math.round((totNonMemBase + totNonMemGst + totNonMemTcs) * 100) / 100;

              return (
                <div className="space-y-6 border border-sky-500/30 rounded-2xl p-6 bg-gradient-to-b from-sky-500/5 via-background to-muted/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          Overseas Business Delegation Setup
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 tracking-wider">
                            Central Admin Only
                          </span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Installment milestones automatically include 5% GST and 2% TCS (Sec 206C) on payment & invoice generation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logistics & Inclusions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="delDest" className="text-xs font-semibold">Destination City / Region</Label>
                      <Input
                        id="delDest"
                        placeholder="e.g. Dubai & Sharjah"
                        value={formData.delegationDestination}
                        onChange={(e) => setFormData({ ...formData, delegationDestination: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delCountry" className="text-xs font-semibold">Country</Label>
                      <Input
                        id="delCountry"
                        placeholder="e.g. United Arab Emirates"
                        value={formData.delegationCountry}
                        onChange={(e) => setFormData({ ...formData, delegationCountry: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delDates" className="text-xs font-semibold">Travel Dates</Label>
                      <Input
                        id="delDates"
                        placeholder="e.g. 15 Nov – 21 Nov 2026"
                        value={formData.delegationTravelDates}
                        onChange={(e) => setFormData({ ...formData, delegationTravelDates: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="delInclusions" className="text-xs font-semibold">Key Inclusions (Itinerary)</Label>
                      <Input
                        id="delInclusions"
                        placeholder="e.g. Return flights, 5-Star Hotel, B2B Chamber meetings, Factory visits, Gala dinner"
                        value={formData.delegationInclusions}
                        onChange={(e) => setFormData({ ...formData, delegationInclusions: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delVisa" className="text-xs font-semibold">Visa & Passport Guidelines</Label>
                      <Input
                        id="delVisa"
                        placeholder="e.g. Passport validity 6+ months, business invitation provided"
                        value={formData.delegationVisaGuidelines}
                        onChange={(e) => setFormData({ ...formData, delegationVisaGuidelines: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Installments Table / Cards */}
                  <div className="space-y-3 pt-3 border-t border-border/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Installment Milestone Schedule</h4>
                        <p className="text-[11px] text-muted-foreground">Define staggered payment amounts and due dates for Members and Non-Members.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDelegationInstallment}
                        className="h-8 text-xs font-medium gap-1.5 border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Installment</span>
                      </Button>
                    </div>

                    {errors.delegationInstallments && (
                      <p className="text-xs font-semibold text-destructive">{errors.delegationInstallments}</p>
                    )}

                    <div className="space-y-3">
                      {installments.map((inst, idx) => {
                        const mBase = Number(inst.memberAmount) || 0;
                        const mGst = Math.round(mBase * 0.05 * 100) / 100;
                        const mTcs = Math.round(mBase * 0.02 * 100) / 100;
                        const mTotal = Math.round((mBase + mGst + mTcs) * 100) / 100;

                        const nmBase = Number(inst.nonMemberAmount) || 0;
                        const nmGst = Math.round(nmBase * 0.05 * 100) / 100;
                        const nmTcs = Math.round(nmBase * 0.02 * 100) / 100;
                        const nmTotal = Math.round((nmBase + nmGst + nmTcs) * 100) / 100;

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-3 shadow-2xs hover:border-sky-500/30 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-bold">
                                  #{idx + 1}
                                </span>
                                <span className="text-xs font-semibold text-muted-foreground">Milestone {idx + 1}</span>
                              </div>
                              {installments.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDelegationInstallment(idx)}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                  title="Remove Installment"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Title / Milestone Name *</Label>
                                <Input
                                  placeholder="e.g. Booking Advance"
                                  value={inst.title}
                                  onChange={(e) => updateDelegationInstallment(idx, "title", e.target.value)}
                                  className={`h-8 text-xs ${errors[`inst_${idx}_title`] ? 'border-destructive' : ''}`}
                                />
                                {errors[`inst_${idx}_title`] && (
                                  <p className="text-[10px] text-destructive">{errors[`inst_${idx}_title`]}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Due Date *</Label>
                                <Input
                                  type="date"
                                  value={inst.dueDate}
                                  onChange={(e) => updateDelegationInstallment(idx, "dueDate", e.target.value)}
                                  className={`h-8 text-xs ${errors[`inst_${idx}_dueDate`] ? 'border-destructive' : ''}`}
                                />
                                {errors[`inst_${idx}_dueDate`] && (
                                  <p className="text-[10px] text-destructive">{errors[`inst_${idx}_dueDate`]}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Member Base Fee (₹) *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="e.g. 50000"
                                  value={inst.memberAmount}
                                  onChange={(e) => updateDelegationInstallment(idx, "memberAmount", e.target.value)}
                                  className={`h-8 text-xs ${errors[`inst_${idx}_memberAmount`] ? 'border-destructive' : ''}`}
                                />
                                {errors[`inst_${idx}_memberAmount`] && (
                                  <p className="text-[10px] text-destructive">{errors[`inst_${idx}_memberAmount`]}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Non-Member Base Fee (₹) *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="e.g. 65000"
                                  value={inst.nonMemberAmount}
                                  onChange={(e) => updateDelegationInstallment(idx, "nonMemberAmount", e.target.value)}
                                  className={`h-8 text-xs ${errors[`inst_${idx}_nonMemberAmount`] ? 'border-destructive' : ''}`}
                                />
                                {errors[`inst_${idx}_nonMemberAmount`] && (
                                  <p className="text-[10px] text-destructive">{errors[`inst_${idx}_nonMemberAmount`]}</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-muted-foreground">Notes / Scope for this Installment</Label>
                              <Input
                                placeholder="e.g. Seat confirmation, flight bookings and visa filing"
                                value={inst.notes}
                                onChange={(e) => updateDelegationInstallment(idx, "notes", e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>

                            {/* Per-installment mini calculation pill */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px]">
                              <div className="text-muted-foreground">
                                Member Payable: <span className="font-bold text-foreground">₹{mTotal.toLocaleString("en-IN")}</span>{" "}
                                <span className="text-[10px] text-muted-foreground/80">(₹{mBase} + 5% GST ₹{mGst} + 2% TCS ₹{mTcs})</span>
                              </div>
                              <div className="text-muted-foreground">
                                Non-Member Payable: <span className="font-bold text-foreground">₹{nmTotal.toLocaleString("en-IN")}</span>{" "}
                                <span className="text-[10px] text-muted-foreground/80">(₹{nmBase} + 5% GST ₹{nmGst} + 2% TCS ₹{nmTcs})</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aggregate Grand Total & Tax Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/80">
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Total Member Package (All Installments)
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-500/20 px-2 py-0.5 rounded">
                          5% GST + 2% TCS Included
                        </span>
                      </div>
                      <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                        ₹{totMemTotal.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-emerald-800/80 dark:text-emerald-300/80 space-y-0.5">
                        <div>Base: ₹{totMemBase.toLocaleString("en-IN")}</div>
                        <div>5% GST: ₹{totMemGst.toLocaleString("en-IN")} · 2% TCS (u/s 206C): ₹{totMemTcs.toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                          Total Non-Member Package (All Installments)
                        </span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-500/20 px-2 py-0.5 rounded">
                          5% GST + 2% TCS Included
                        </span>
                      </div>
                      <div className="text-2xl font-black text-blue-900 dark:text-blue-200">
                        ₹{totNonMemTotal.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-blue-800/80 dark:text-blue-300/80 space-y-0.5">
                        <div>Base: ₹{totNonMemBase.toLocaleString("en-IN")}</div>
                        <div>5% GST: ₹{totNonMemGst.toLocaleString("en-IN")} · 2% TCS (u/s 206C): ₹{totNonMemTcs.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-900 dark:text-sky-200 text-xs leading-relaxed">
                    <AlertCircle className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                    <div>
                      <strong>Automated Installment Invoices & Reminders:</strong> When a delegate registers, each milestone will have an invoice generated upon payment. RIFAH will automatically send reminders and emails <strong>1 day prior</strong> to installment due date, <strong>immediately on due date</strong>, and <strong>daily until paid</strong>.
                    </div>
                  </div>
                </div>
              );
            })()}

            {formData.eventCategory === "Sports" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-border rounded-xl p-5 bg-muted/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                <div className="space-y-2">
                  <Label htmlFor="sportName">Sport Name</Label>
                  <Input
                    id="sportName"
                    placeholder="e.g. Cricket, Badminton"
                    value={formData.sportName}
                    onChange={(e) => setFormData({ ...formData, sportName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sportVenue">Ground / Court</Label>
                  <Input
                    id="sportVenue"
                    placeholder="Sports venue name"
                    value={formData.sportVenue}
                    onChange={(e) => setFormData({ ...formData, sportVenue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamsAllowed">Teams Allowed</Label>
                  <Input
                    id="teamsAllowed"
                    type="number"
                    min="0"
                    value={formData.teamsAllowed}
                    onChange={(e) => setFormData({ ...formData, teamsAllowed: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<<<<<<< Updated upstream
              <div className="space-y-2">
                <Label htmlFor="isPaid">Event Fee <span className="text-destructive">*</span></Label>
                <Select value={formData.isPaid ? "Paid" : "Free"} onValueChange={(val) => setFormData({ ...formData, isPaid: val === "Paid", ticketPrice: val === "Free" ? "" : formData.ticketPrice })}>
                  <SelectTrigger id="isPaid" className={errors.isPaid ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free / Complimentary</SelectItem>
                    <SelectItem value="Paid">Paid Event</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isPaid && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.isPaid}</p>}
              </div>
=======
              {formData.eventCategory !== "Delegation" && (
                <div className="space-y-2">
                  <Label htmlFor="isPaid">Event Type</Label>
                  <Select value={formData.isPaid ? "Paid" : "Free"} onValueChange={(val) => setFormData({ ...formData, isPaid: val === "Paid", ticketPrice: val === "Free" ? "" : formData.ticketPrice })}>
                    <SelectTrigger id="isPaid">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free / Complimentary</SelectItem>
                      <SelectItem value="Paid">Paid Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
>>>>>>> Stashed changes
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Capacity / Max Registration Allowed</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min="0"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value ? Number(e.target.value) : "" })}
                  placeholder="e.g. 100 (0 for unlimited)"
                />
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Leave 0 if seats are unlimited.</p>
              </div>
              {formData.isPaid && (() => {
                const nonMemberBase = Number(formData.ticketPrice) || 0;
                const nonMemberGst = Math.round(nonMemberBase * 0.18);
                const nonMemberTotal = nonMemberBase + nonMemberGst;

                const memberBase = Number(formData.memberPrice) || 0;
                const memberGst = Math.round(memberBase * 0.18);
                const memberTotal = memberBase + memberGst;

                return (
                  <div className="col-span-full border border-border rounded-xl p-5 bg-muted/10 shadow-sm relative overflow-hidden space-y-4">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="ticketPrice">Non-Member Price (₹) <span className="text-destructive">*</span></Label>
                        <Input
                          id="ticketPrice"
                          type="number"
                          min="0"
                          required
                          value={formData.ticketPrice}
                          onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value ? Number(e.target.value) : "" })}
                          placeholder="e.g. 500"
                          className={errors.ticketPrice ? 'border-destructive' : ''}
                        />
                        {errors.ticketPrice && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.ticketPrice}</p>}
                        <div className="flex flex-wrap items-center justify-between text-[11px] gap-1 pt-0.5">
                          <span className="text-muted-foreground">Standard price for Guests.</span>
                          {nonMemberBase > 0 && (
                            <span className="text-primary font-medium">
                              + 18% GST (₹{nonMemberGst}) = <strong className="text-foreground">₹{nonMemberTotal}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memberPrice">Member Price (₹)</Label>
                        <Input
                          id="memberPrice"
                          type="number"
                          min="0"
                          value={formData.memberPrice}
                          onChange={(e) => setFormData({ ...formData, memberPrice: e.target.value ? Number(e.target.value) : "" })}
                          placeholder="e.g. 200"
                          className={errors.memberPrice ? 'border-destructive' : ''}
                        />
                        {errors.memberPrice && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.memberPrice}</p>}
                        <div className="flex flex-wrap items-center justify-between text-[11px] gap-1 pt-0.5">
                          <span className="text-muted-foreground">Special price for verified Members.</span>
                          {memberBase > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              + 18% GST (₹{memberGst}) = <strong className="text-foreground">₹{memberTotal}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* GST Charges Breakdown Box */}
                    <div className="p-3.5 rounded-lg bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          %
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">GST Charges: 18% Applicable</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium border border-emerald-500/20">
                              Auto-added on payment
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            When users register, 18% GST is added to the base price and charged via payment gateway.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <div className="bg-muted px-2.5 py-1 rounded border">
                          Guest Total: <span className="font-bold text-foreground">₹{nonMemberTotal}</span> <span className="text-[10px] text-muted-foreground">(₹{nonMemberBase} + ₹{nonMemberGst})</span>
                        </div>
                        {memberBase > 0 && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/20">
                            Member Total: <span className="font-bold">₹{memberTotal}</span> <span className="text-[10px] text-emerald-600/80">(₹{memberBase} + ₹{memberGst})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="registrationAccess">Limit Registrations</Label>
                <Select value={formData.registrationAccess} onValueChange={(val) => setFormData({ ...formData, registrationAccess: val })}>
                  <SelectTrigger id="registrationAccess">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All (Everyone)</SelectItem>
                    <SelectItem value="Registered Businesses Only">Registered Businesses Only</SelectItem>
                    <SelectItem value="Paid Members Only">Paid Members Only</SelectItem>
                    {!isChapterAdmin && <SelectItem value="Chapter Admins Only">Chapter Admins Only</SelectItem>}
                    {isCentralAdmin && <SelectItem value="State Secretaries Only">State Secretaries Only</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Select who can register for this event.</p>
              </div>
            </div>

            {/* Registration Controls & Scheduling */}
            <div className="border border-border rounded-xl p-5 bg-muted/10 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Registration Controls & Scheduling</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage seat availability and schedule automated cutoff for event registration.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-card shadow-2xs">
                  <div className="space-y-0.5 pr-4">
                    <Label htmlFor="isRegistrationClosed" className="text-sm font-semibold cursor-pointer">
                      Registration Closed / Seats Full
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Manually close new registrations or mark event seats as full.
                    </p>
                  </div>
                  <Checkbox
                    id="isRegistrationClosed"
                    checked={formData.isRegistrationClosed}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isRegistrationClosed: Boolean(checked),
                        seatsFull: Boolean(checked),
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
                  <Label htmlFor="registrationClosingDate" className="text-sm font-semibold">
                    Schedule Registration Closing Date
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically close registrations at this date and time prior to the event.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Input
                      id="registrationClosingDate"
                      type="date"
                      min="2020-01-01"
                      max="2099-12-31"
                      value={formData.registrationClosingDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationClosingDate: sanitizeDateInput(e.target.value),
                        }))
                      }
                      className={`flex-1 min-w-[130px] ${errors.registrationClosingDate ? "border-destructive" : ""}`}
                    />
                    <Input
                      id="registrationClosingTime"
                      type="time"
                      value={formData.registrationClosingTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationClosingTime: e.target.value,
                        }))
                      }
                      className="w-28"
                    />
                  </div>
                  {errors.registrationClosingDate && (
                    <p className="text-[13px] text-destructive mt-1 font-medium">
                      {errors.registrationClosingDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="venue">Venue / Address</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const el = document.getElementById("location-picker-container");
                      if (el) el.classList.toggle("hidden");
                    }}
                    className="h-6 text-[10px] uppercase tracking-wider text-primary"
                  >
                    Select on Map
                  </Button>
                </div>
                <Input
                  id="venue"
                  placeholder="e.g. Bombay Exhibition Centre, Mumbai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              {/* Interactive Location Picker */}
              <div id="location-picker-container" className={formData.location ? "hidden" : "block"}>
                <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Pinpoint Location on Map</p>
                  <MapComponent 
                    onLocationSelect={(addr) => {
                      setFormData({ ...formData, location: addr });
                      toast.success("Location set from map!");
                      document.getElementById("location-picker-container").classList.add("hidden");
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Full Description & Agenda</Label>
              <Textarea
                id="desc"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write the full event details here. This will be shown on the event landing page."
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="cover">Banner Image (Optional)</Label>
              <div className="flex items-center gap-4">
                {formData.cover ? (
                  <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-border shadow-sm group">
                    <img
                      src={URL.createObjectURL(formData.cover)}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, cover: null });
                        const fileInput = document.getElementById('cover');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-0.5 truncate">
                      {formData.cover.name}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-40 bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px]">No banner selected</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("File size is greater than 5MB. Please upload a smaller image.");
                          e.target.value = "";
                          return;
                        }
                        setFormData({ ...formData, cover: file });
                      }
                    }}
                    className="max-w-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">Recommended: 1900×301px, max 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="poster">Poster Image (Optional)</Label>
              <div className="flex items-center gap-4">
                {formData.poster ? (
                  <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border shadow-sm group">
                    <img
                      src={URL.createObjectURL(formData.poster)}
                      alt="Poster preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, poster: null });
                        const fileInput = document.getElementById('poster');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-0.5 truncate">
                      {formData.poster.name}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-32 bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px]">No poster selected</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    id="poster"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("File size is greater than 5MB. Please upload a smaller image.");
                          e.target.value = "";
                          return;
                        }
                        setFormData({ ...formData, poster: file });
                      }
                    }}
                    className="max-w-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">Recommended: 1080×1080px (1:1) or 1080×1350px (4:5)</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Publishing & Notifications" className="p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <Label className="text-base">Target Audience</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select which user segments should receive email invitations and in-app alerts when you publish this event. 
                  (No notifications are sent if you save as a draft).
                </p>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <MultiSelectDropdown 
                  options={
                    isCentralAdmin 
                      ? ["All", "Registered Businesses Only", "Paid Members Only", "Chapter Admins Only", "State Secretaries Only"] 
                      : (isStateAdmin 
                          ? ["All", "Registered Businesses Only", "Paid Members Only", "Chapter Admins Only"] 
                          : ["All", "Registered Businesses Only", "Paid Members Only"])
                  } 
                  selected={formData.targetAudience || []} 
                  toggleOption={toggleAudience} 
                  placeholder="Select Target Audience..." 
                />
              </div>
            </div>



            {mounted && isCentralAdmin && (
              <div className="space-y-3 pt-6 border-t">
                <div>
                  <Label className="text-base">Target States</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select which states this event should be visible to.
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 mt-4">
                  <MultiSelectDropdown 
                    options={stateOptions} 
                    selected={formData.targetStates || []} 
                    toggleOption={toggleState} 
                    placeholder="Select Target States..." 
                  />
                </div>
              </div>
            )}

            {mounted && !isChapterAdmin && (
              <div className="space-y-3 pt-6 border-t">
                <div>
                  <Label className="text-base">Target Chapters</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select which chapters this event should be visible to.
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 mt-4">
                  <MultiSelectDropdown 
                    options={chapterOptions} 
                    selected={formData.targetChapters || []} 
                    toggleOption={toggleChapter} 
                    placeholder="Select Target Chapters..." 
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t bg-muted/30 -mx-6 px-6 pb-6 rounded-b-xl">
              <div>
                <Label className="text-base">Schedule Publication</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Instead of publishing immediately, you can schedule this event to be automatically published at a later date and time.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    min="2020-01-01"
                    max="2099-12-31"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: sanitizeDateInput(e.target.value) })}
                    className={`w-40 ${errors.scheduledDate ? 'border-destructive' : ''}`}
                  />
                  {errors.scheduledDate && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.scheduledDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className={`w-32 ${errors.scheduledTime ? 'border-destructive' : ''}`}
                  />
                  {errors.scheduledTime && <p className="text-[13px] text-destructive mt-1 font-medium">{errors.scheduledTime}</p>}
                </div>
              </div>

              <div className="pt-6 mt-2 border-t flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSave("Scheduled")} 
                  disabled={loading || savingDraft}
                  className="w-40 border-primary text-primary hover:bg-primary/5"
                >
                  {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Event"}
                </Button>
                <Button 
                  onClick={() => handleSave("Upcoming")} 
                  disabled={loading || savingDraft}
                  className="w-48 bg-primary"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Event"}
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
