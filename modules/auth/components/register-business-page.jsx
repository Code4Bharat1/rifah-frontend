"use client";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Upload, Loader2, AlertCircle, RotateCcw, Shield, Mail, Sparkles, Building2, Zap, Check, Globe, FileText, X, Copy, Camera, Image as ImageIcon, Pencil } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import React from "react";

const Instagram = ({ className = "h-4 w-4", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ className = "h-4 w-4", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { useRouter, useSearchParams } from "next/navigation";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { parsePhoneNumber } from "@shared/lib/countries";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Textarea } from "@shared/components/ui/textarea";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";
import { cities, industries } from "@shared/lib/mock-data";
import { getMainCategories, getSubCategoriesFor } from "@shared/lib/categories-data";
import {
  ALL_INDIAN_STATES,
  getCitiesForState,
  getPincodeForCity,
  getStateForCity,
} from "@shared/lib/indian-states-cities";
import {
  ALL_INTERNATIONAL_COUNTRIES,
  getCitiesForInternationalCountry,
  getPincodeForInternationalCity,
  getCountryObjByName,
  getPostalCodeLabel,
  getPostalCodePlaceholder,
} from "@shared/lib/international-countries-cities";
import { useChapters, useMembershipPlans, useCategories } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi, paymentApi, businessApi, verificationApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";
import { ChamberMembershipTiers } from "@shared/components/rifah/chamber-membership-tiers";

const steps = ["Business", "Contact", "Account", "Membership"];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const FastInput = ({ value, onValueChange, onChange, onBlur, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  return (
    <Input
      {...props}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange?.(e);
      }}
      onBlur={(e) => {
        if (localValue !== value) {
          onValueChange?.(localValue);
        }
        onBlur?.(e);
      }}
    />
  );
};

const FastTextarea = ({ value, onValueChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  return (
    <Textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onValueChange(localValue);
        }
      }}
    />
  );
};

const DEFAULT_OWNER_PHOTO = "/images/default-avatar.svg";

const AdminRegisterWrapper = ({ children }) => (
  <div className="py-6 animate-in fade-in">{children}</div>
);

function RegisterBusiness({ isAdmin = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convertEmail = searchParams.get("convertEmail") || "";
  
  const { registerBusiness, user } = useAuth();
  const { data: chaptersData } = useChapters();
  const { data: plansData } = useMembershipPlans();

  const chapters = chaptersData || [];

  const states = React.useMemo(() => {
    const chapterStates = chapters.map((c) => (c.state || "").trim()).filter(Boolean);
    return Array.from(new Set([...ALL_INDIAN_STATES, ...chapterStates])).sort((a, b) => a.localeCompare(b));
  }, [chapters]);
  
  const plans = React.useMemo(() => {
    const source = Array.isArray(plansData)
      ? plansData.map((plan) => ({ id: plan.id || plan.planId, ...plan }))
      : Object.entries(plansData || {}).map(([id, plan]) => ({ id, ...plan }));
    const CANONICAL = { silver: 1, gold: 2, platinum: 3, diamond: 4 };
    return source
      .filter((plan) => plan.id && plan.isActive !== false)
      .sort((a, b) => {
        const idA = String(a.id || a.planId || a.name || "").toLowerCase();
        const idB = String(b.id || b.planId || b.name || "").toLowerCase();
        const orderA = a.displayOrder !== undefined && a.displayOrder !== null && Number(a.displayOrder) > 0 ? Number(a.displayOrder) : (CANONICAL[idA] ?? null);
        const orderB = b.displayOrder !== undefined && b.displayOrder !== null && Number(b.displayOrder) > 0 ? Number(b.displayOrder) : (CANONICAL[idB] ?? null);
        if (orderA !== null && orderB !== null && orderA !== orderB) return orderA - orderB;
        if (orderA !== null) return -1;
        if (orderB !== null) return 1;
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      });
  }, [plansData]);

  const { data: categoriesData } = useCategories();

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isEditingPreview, setIsEditingPreview] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Proprietorship",
    industry: "",
    subCategory: "",
    founded: "",
    employees: "",
    about: "",
    logo: "",
    avatar: "",
    contactPerson: "",
    roleInBusiness: "Founder / Owner",
    customRoleInBusiness: "",
    phone: "",
    businessEmail: "",
    website: "",
    instagram: "",
    linkedin: "",
    email: convertEmail || "",
    password: "",
    taxId: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    chapter: "",
    dob: "",
    joiningDate: new Date().toISOString().split("T")[0],
    timezone: typeof window !== "undefined" ? (Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata") : "Asia/Kolkata",
    region: "national",
  });

  useEffect(() => {
    if (plans.length > 0 && !plans.some((plan) => plan.id === tier)) {
      setTier((plans.find((plan) => plan.isRecommended) || plans[0]).id);
    }
  }, [plans, tier]);

  const previewPlanDetails = React.useMemo(() => {
    const isIntl = formData.region === "international";
    const activePlan = plans.find((p) => p.id === tier) || plans[0] || {};
    const basePrice = isIntl
      ? (activePlan?.priceUsd ?? (activePlan?.price === 0 ? 0 : Math.round((activePlan?.price || 0) / 80)))
      : (activePlan?.price || 0);
    const gstRate = Number(activePlan?.gstRate ?? 18);
    const gstAmt = !isIntl && basePrice > 0 ? Math.round((basePrice * gstRate) / 100) : 0;
    const totalPayable = isIntl ? basePrice : basePrice + gstAmt;
    const currency = isIntl ? "USD" : "INR";
    return {
      plan: activePlan,
      name: activePlan?.name || tier || "Standard Plan",
      isIntl,
      basePrice,
      gstRate,
      gstAmt,
      totalPayable,
      currency,
    };
  }, [plans, tier, formData.region]);

  // Admin Specific
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashCollectingState, setCashCollectingState] = useState("");
  const [cashCollectingChapter, setCashCollectingChapter] = useState("");

  useEffect(() => {
    if (isAdmin) {
      if (!cashCollectingState && (formData.state || user?.state)) {
        setCashCollectingState(formData.state || user?.state || "");
      }
      if (!cashCollectingChapter && (formData.chapter || user?.chapter)) {
        setCashCollectingChapter(formData.chapter || user?.chapter || "");
      }
    }
  }, [isAdmin, formData.state, formData.chapter, user?.state, user?.chapter, cashCollectingState, cashCollectingChapter]);

  const collectingChaptersList = React.useMemo(() => {
    if (!cashCollectingState) return chapters;
    const filtered = chapters.filter(
      (c) => (c.state || "").trim().toLowerCase() === cashCollectingState.trim().toLowerCase()
    );
    return filtered.length > 0 ? filtered : chapters;
  }, [chapters, cashCollectingState]);

  // Region Selection Modal Popup State
  const [showRegionModal, setShowRegionModal] = useState(true);

  // GST Verification States (Step 0 for National)
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstData, setGstData] = useState(null);
  const [gstSuccessMsg, setGstSuccessMsg] = useState("");
  const [gstErrorMsg, setGstErrorMsg] = useState("");

  // International Business Certificate Upload States (Step 0 for International)
  const [certFile, setCertFile] = useState(null);
  const [certDocType, setCertDocType] = useState("Certificate of Incorporation");
  const [certDocNumber, setCertDocNumber] = useState("");
  const [certPreview, setCertPreview] = useState(null);

  // 1. Business Logo Upload States
  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState(null);
  const [businessLogoUploading, setBusinessLogoUploading] = useState(false);
  const businessLogoInputRef = useRef(null);

  // 2. Businessman / Owner Profile Photo Upload States
  const [ownerPhotoFile, setOwnerPhotoFile] = useState(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState(null);
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);
  const ownerPhotoInputRef = useRef(null);
  // Mandatory photo validation flag — set true when user tries to proceed without uploading
  const [ownerPhotoRequired, setOwnerPhotoRequired] = useState(false);

  // OTP Verification States (Forgot Password theme)
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(150);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const otpInputRefs = useRef([]);

  // Email Duplicity / Availability Check States
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState(null);
  const [businessEmailChecking, setBusinessEmailChecking] = useState(false);
  const [businessEmailCheckResult, setBusinessEmailCheckResult] = useState(null);
  const emailDebounceTimerRef = useRef(null);
  const businessEmailDebounceTimerRef = useRef(null);

  const handleBusinessLogoUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (.jpg, .jpeg, .png, .webp, .svg).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Business logo size must be less than 10 MB.");
      return;
    }

    setBusinessLogoFile(file);
    const localUrl = URL.createObjectURL(file);
    setBusinessLogoPreview(localUrl);
    setError("");

    setBusinessLogoUploading(true);
    try {
      const res = await authApi.uploadPhoto(file);
      const serverUrl = res?.data?.url || res?.data?.fileUrl || res?.url || res?.fileUrl;
      if (serverUrl) {
        setFormData((prev) => ({ ...prev, logo: serverUrl }));
      }
    } catch (uploadErr) {
      console.warn("Logo upload warning (will retry on submit):", uploadErr);
    } finally {
      setBusinessLogoUploading(false);
    }
  };

  const handleRemoveBusinessLogo = () => {
    setBusinessLogoFile(null);
    setBusinessLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: "" }));
    if (businessLogoInputRef.current) {
      businessLogoInputRef.current.value = "";
    }
  };

  const handleOwnerPhotoUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (.jpg, .jpeg, .png, .webp).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Personal photo size must be less than 10 MB.");
      return;
    }

    setOwnerPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setOwnerPhotoPreview(localUrl);
    setError("");
    setOwnerPhotoRequired(false); // clear mandatory error once photo is selected

    setOwnerPhotoUploading(true);
    try {
      const res = await authApi.uploadPhoto(file);
      const serverUrl = res?.data?.url || res?.data?.fileUrl || res?.url || res?.fileUrl;
      if (serverUrl) {
        setFormData((prev) => ({ ...prev, avatar: serverUrl }));
      }
    } catch (uploadErr) {
      console.warn("Owner photo upload warning (will retry on submit):", uploadErr);
    } finally {
      setOwnerPhotoUploading(false);
    }
  };

  const handleRemoveOwnerPhoto = () => {
    setOwnerPhotoFile(null);
    setOwnerPhotoPreview(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (ownerPhotoInputRef.current) {
      ownerPhotoInputRef.current.value = "";
    }
  };

  const { availableMainCategories, availableSubCategories } = React.useMemo(() => {
    const cats = Array.isArray(categoriesData) ? categoriesData : [];
    const dbMain = cats.filter(c => !c.parent).map(c => c.name);
    const dbSubs = cats.filter(c => c.parent);

    // Merge DB main categories with static comprehensive taxonomy
    const staticMain = getMainCategories();
    const allMain = Array.from(new Set([...dbMain, ...staticMain]));

    // Strictly filter subcategories related to chosen category
    let matchedSubs = [];
    if (formData.industry) {
      const chosenCat = (formData.industry || "").trim();
      const dbMatchedSubs = dbSubs
        .filter(c => c.parent && c.parent.trim().toLowerCase() === chosenCat.toLowerCase())
        .map(c => c.name);
      const staticMatchedSubs = getSubCategoriesFor(chosenCat) || [];
      matchedSubs = Array.from(new Set([...dbMatchedSubs, ...staticMatchedSubs]));
    }

    return {
      availableMainCategories: allMain,
      availableSubCategories: matchedSubs
    };
  }, [categoriesData, formData.industry]);

  const chaptersForSelectedState = React.useMemo(() => {
    if (!formData.state) return chapters;
    return chapters.filter(
      (c) => (c.state || "").trim().toLowerCase() === formData.state.trim().toLowerCase()
    );
  }, [chapters, formData.state]);

  const availableCities = React.useMemo(() => {
    if (formData.region === "international") {
      const intlCities = getCitiesForInternationalCountry(formData.state);
      return intlCities;
    }
    const stateCities = getCitiesForState(formData.state);
    const chapterCities = chapters
      .filter((c) => !formData.state || (c.state || "").trim().toLowerCase() === (formData.state || "").trim().toLowerCase())
      .map((c) => (c.city || "").trim())
      .filter(Boolean);
    return Array.from(new Set([...stateCities, ...chapterCities])).sort((a, b) => a.localeCompare(b));
  }, [formData.state, formData.region, chapters]);

  const handleStateChange = (selectedStateOrCountry) => {
    if (formData.region === "international") {
      const newCities = getCitiesForInternationalCountry(selectedStateOrCountry);
      const currentCityStillValid = newCities.some((c) => c.toLowerCase() === (formData.city || "").trim().toLowerCase());
      
      const countryObj = getCountryObjByName(selectedStateOrCountry);
      
      setFormData((prev) => {
        let updatedPhone = prev.phone;
        if (countryObj && countryObj.dialCode) {
          const parsed = parsePhoneNumber(prev.phone || "");
          if (!parsed.nationalNumber) {
            updatedPhone = `${countryObj.dialCode} `;
          } else {
            updatedPhone = `${countryObj.dialCode} ${parsed.nationalNumber}`;
          }
        }
        return {
          ...prev,
          state: selectedStateOrCountry,
          city: currentCityStillValid ? prev.city : "",
          pincode: currentCityStillValid ? prev.pincode : "",
          phone: updatedPhone,
        };
      });
      setError("");
      return;
    }

    const chapterStillValid = chapters.some(
      (c) => c.name === formData.chapter && (c.state || "").trim().toLowerCase() === (selectedStateOrCountry || "").trim().toLowerCase()
    );
    const newCities = getCitiesForState(selectedStateOrCountry);
    const currentCityStillValid = newCities.some((c) => c.toLowerCase() === (formData.city || "").trim().toLowerCase());

    setFormData((prev) => ({
      ...prev,
      state: selectedStateOrCountry,
      city: currentCityStillValid ? prev.city : "",
      pincode: currentCityStillValid ? prev.pincode : "",
      chapter: chapterStillValid ? prev.chapter : "",
    }));
    setError("");
  };

  const handleCityChange = (selectedCity) => {
    let autoPin = "";
    if (formData.region === "international") {
      autoPin = getPincodeForInternationalCity(formData.state, selectedCity);
    } else {
      autoPin = getPincodeForCity(selectedCity);
    }

    const inferredState = (formData.region === "national" && !formData.state) ? getStateForCity(selectedCity) : "";

    // Auto-match chapter if one exists for this city
    let matchedChapter = formData.chapter;
    if (!matchedChapter) {
      const directChapter = chapters.find(
        (c) => (c.city || "").trim().toLowerCase() === (selectedCity || "").trim().toLowerCase() ||
               (c.name || "").trim().toLowerCase().includes((selectedCity || "").trim().toLowerCase())
      );
      if (directChapter) matchedChapter = directChapter.name;
    }

    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      state: prev.state || inferredState || prev.state,
      pincode: autoPin || prev.pincode,
      chapter: matchedChapter,
    }));
    setPincodeError("");
    setError("");
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    let interval;
    if (otpSent && !emailVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, emailVerified, otpTimer]);

  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) {
          newDigits[i] = cleaned[i];
        }
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEditEmail = () => {
    setEmailVerified(false);
    setOtpSent(false);
    setVerifiedToken(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpSuccess("");
    setEmailCheckResult(null);
    setError("");
    setTimeout(() => {
      const el = document.getElementById("reg-email");
      if (el) {
        el.focus();
        el.select();
      }
    }, 50);
  };

  const isFieldSpecificError = (msg) => {
    if (!msg) return false;
    const lower = String(msg).toLowerCase();
    return (
      lower.includes("email") ||
      lower.includes("duplicity") ||
      lower.includes("already registered") ||
      lower.includes("account with this email")
    );
  };

  const verifyEmailAvailability = async (emailToTest) => {
    const clean = (emailToTest || formData.email || "").trim().toLowerCase();
    if (!clean || !clean.includes("@") || !clean.includes(".")) {
      setEmailChecking(false);
      return { available: true };
    }
    // If admin converting an existing user
    if (isAdmin && convertEmail && clean === convertEmail.toLowerCase().trim()) {
      setEmailChecking(false);
      setEmailCheckResult({ available: true, message: "Email is available for this account." });
      return { available: true };
    }
    setEmailChecking(true);
    try {
      const res = await authApi.checkEmail(clean);
      const data = res?.data !== undefined ? res.data : res;
      if (data && data.available === false) {
        const msg = data.message || "Email validation failed: This email is already registered with an existing business. Email duplicity is not allowed.";
        setEmailCheckResult({ available: false, message: msg, email: clean });
        return { available: false, message: msg };
      }
      setEmailCheckResult({ available: true, message: "Email is available for registration.", email: clean });
      if (error && isFieldSpecificError(error)) {
        setError("");
      }
      return { available: true };
    } catch (err) {
      const errMsg = err?.message || "";
      const isConflict = err?.status === 409 ||
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("registered") ||
        errMsg.toLowerCase().includes("duplicity") ||
        errMsg.toLowerCase().includes("validation failed");

      if (isConflict) {
        const fullMsg = errMsg || "Email validation failed: This email is already registered with an existing business. Email duplicity is not allowed.";
        setEmailCheckResult({ available: false, message: fullMsg, email: clean });
        return { available: false, message: fullMsg };
      }
      console.warn("[CheckEmail] Warning:", err);
      return { available: true };
    } finally {
      setEmailChecking(false);
    }
  };

  const handleEmailChange = (newVal) => {
    const rawVal = newVal;
    const clean = (newVal || "").trim().toLowerCase();
    setFormData((prev) => ({ ...prev, email: rawVal }));
    setEmailCheckResult(null);
    if (error && isFieldSpecificError(error)) {
      setError("");
    }

    if (emailDebounceTimerRef.current) {
      clearTimeout(emailDebounceTimerRef.current);
    }

    // Only run debounced check if email has basic structure
    if (!clean || !clean.includes("@") || !clean.includes(".") || clean.length < 5) {
      return;
    }

    setEmailChecking(true);
    emailDebounceTimerRef.current = setTimeout(async () => {
      await verifyEmailAvailability(clean);
    }, 350);
  };

  const handleEmailBlur = async () => {
    if (emailDebounceTimerRef.current) {
      clearTimeout(emailDebounceTimerRef.current);
    }
    const clean = (formData.email || "").trim().toLowerCase();
    if (clean && clean.includes("@") && clean.includes(".")) {
      await verifyEmailAvailability(clean);
    }
  };

  const verifyBusinessEmailAvailability = async (emailToTest) => {
    const clean = (emailToTest || formData.businessEmail || "").trim().toLowerCase();
    if (!clean || !clean.includes("@") || !clean.includes(".")) {
      setBusinessEmailChecking(false);
      return { available: true };
    }

    setBusinessEmailChecking(true);
    try {
      const res = await authApi.checkEmail(clean);
      const data = res?.data !== undefined ? res.data : res;
      if (data && data.available === false) {
        const msg = data.message || "Email validation failed: This business email is already registered with an existing business. Email duplicity is not allowed.";
        setBusinessEmailCheckResult({ available: false, message: msg, email: clean });
        return { available: false, message: msg };
      }
      setBusinessEmailCheckResult({ available: true, message: "Business email is available.", email: clean });
      if (error && isFieldSpecificError(error)) {
        setError("");
      }
      return { available: true };
    } catch (err) {
      const errMsg = err?.message || "";
      const isConflict = err?.status === 409 ||
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("registered") ||
        errMsg.toLowerCase().includes("duplicity") ||
        errMsg.toLowerCase().includes("validation failed");

      if (isConflict) {
        const fullMsg = errMsg || "Email validation failed: This business email is already registered with an existing business. Email duplicity is not allowed.";
        setBusinessEmailCheckResult({ available: false, message: fullMsg, email: clean });
        return { available: false, message: fullMsg };
      }
      return { available: true };
    } finally {
      setBusinessEmailChecking(false);
    }
  };

  const handleBusinessEmailChange = (newVal) => {
    const rawVal = newVal;
    const clean = (newVal || "").trim().toLowerCase();
    setFormData((prev) => ({ ...prev, businessEmail: rawVal }));
    setBusinessEmailCheckResult(null);
    if (error && isFieldSpecificError(error)) {
      setError("");
    }

    if (businessEmailDebounceTimerRef.current) {
      clearTimeout(businessEmailDebounceTimerRef.current);
    }

    if (!clean || !clean.includes("@") || !clean.includes(".") || clean.length < 5) {
      return;
    }

    setBusinessEmailChecking(true);
    businessEmailDebounceTimerRef.current = setTimeout(async () => {
      await verifyBusinessEmailAvailability(clean);
    }, 350);
  };

  const handleBusinessEmailBlur = async () => {
    if (businessEmailDebounceTimerRef.current) {
      clearTimeout(businessEmailDebounceTimerRef.current);
    }
    const clean = (formData.businessEmail || "").trim().toLowerCase();
    if (clean && clean.includes("@") && clean.includes(".")) {
      await verifyBusinessEmailAvailability(clean);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    const check = await verifyEmailAvailability(formData.email);
    if (check && check.available === false) {
      return;
    }
    setError("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSending(true);
    try {
      const res = await authApi.sendRegisterOtp(formData.email.trim());
      setOtpSent(true);
      setOtpTimer(150);
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setDevOtp(returnedOtp);
        const digits = String(returnedOtp).split("").slice(0, 6);
        while (digits.length < 6) digits.push("");
        setOtpDigits(digits);
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
      }
      setOtpSuccess(res?.message || "Verification code sent to your email.");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      const errMsg = err.message || "Failed to send verification code. Please check your email.";
      if (errMsg.toLowerCase().includes("already exists") || errMsg.toLowerCase().includes("registered") || errMsg.toLowerCase().includes("duplicity")) {
        setEmailCheckResult({ available: false, message: errMsg });
      }
      setError(errMsg);
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    setOtpSending(true);
    try {
      const res = await authApi.sendRegisterOtp(formData.email.trim());
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setDevOtp(returnedOtp);
        const digits = String(returnedOtp).split("").slice(0, 6);
        while (digits.length < 6) digits.push("");
        setOtpDigits(digits);
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
      }
      setOtpSuccess(res?.message || "A fresh verification code has been sent.");
      setOtpTimer(150);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setOtpError(err.message || "Failed to resend code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setOtpError("");
    setOtpVerifying(true);
    try {
      const res = await authApi.verifyRegisterOtp(formData.email.trim(), code);
      const token = res.data?.verifiedToken || res?.verifiedToken;
      setVerifiedToken(token);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully! Now set your account password.");
    } catch (err) {
      setOtpError(err.message || "Invalid or expired verification code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const gstDebounceRef = useRef(null);

  const triggerGstVerification = (val) => {
    if (gstDebounceRef.current) {
      clearTimeout(gstDebounceRef.current);
    }
    gstDebounceRef.current = setTimeout(() => {
      handleVerifyGst(val);
    }, 400);
  };

  const handleVerifyGst = async (customGstin) => {
    const targetGst = (customGstin || formData.taxId || "").trim().toUpperCase();
    if (!targetGst) {
      setGstErrorMsg(formData.region === "international" ? "Please enter your Tax ID first." : "Please enter a 15-character GSTIN first.");
      return;
    }

    if (formData.region === "national" && targetGst.length !== 15) {
      setGstErrorMsg("GSTIN is usually 15 characters. You can still proceed by entering details manually below.");
      return;
    }

    setGstErrorMsg("");
    setGstSuccessMsg("");
    setGstVerifying(true);
    try {
      if (targetGst.length === 15) {
        let res;
        try {
          res = await businessApi.verifyGst(targetGst);
        } catch (apiErr) {
          console.warn("[GST Lookup Info]", apiErr.message);
          setGstVerified(false);
          setGstErrorMsg("Unable to auto-fetch GST records online. You can still proceed by entering details manually below.");
          setGstVerifying(false);
          return;
        }
        const data = res?.data || res;
        if (data && (data.isValid || data.valid || data.status === "Active" || data.taxpayerStatus === "Active")) {
          setGstVerified(true);
          setGstData(data);

          // Instantly populate form fields directly from verified GST records
          const fetchedName = data.businessName || data.tradeName || data.legalName || "";
          const contactPerson = data.contactPerson || data.authorizedSignatory || data.promoter || data.legalName || "";
          const phone = data.phone || data.mobile || "";
          const email = data.email || "";
          const address = data.address || "";
          const city = data.city || "";
          const pincode = data.pincode || "";
          const founded = data.founded ? String(data.founded) : "";

          // Auto-match chapter based on city or state
          let matchingChapter = "";
          if (city) {
            const directMatch = chapters.find((c) => c.name.toLowerCase().includes(city.toLowerCase()));
            if (directMatch) matchingChapter = directMatch.name;
          }
          if (!matchingChapter && data.state) {
            const stateMatch = chapters.find((c) => c.name.toLowerCase().includes(data.state.toLowerCase()));
            if (stateMatch) matchingChapter = stateMatch.name;
          }

          setFormData((prev) => ({
            ...prev,
            businessName: fetchedName || prev.businessName,
            businessType: data.businessType || prev.businessType,
            founded: founded || prev.founded,
            contactPerson: contactPerson || prev.contactPerson,
            phone: phone || prev.phone,
            businessEmail: email || prev.businessEmail,
            email: prev.email || email,
            address: address || prev.address,
            city: city || prev.city,
            pincode: pincode || prev.pincode,
            state: data.state || prev.state,
            chapter: matchingChapter || prev.chapter,
          }));

          setGstSuccessMsg(
            fetchedName
              ? `GSTIN Verified! Details auto-loaded for "${fetchedName}".`
              : "GSTIN Verified successfully (Active Taxpayer)."
          );
        } else {
          setGstVerified(false);
          setGstErrorMsg(data?.message || "Could not auto-fetch from this GSTIN. You can still proceed by entering details manually below.");
        }
      } else {
        setGstVerified(false);
        setGstErrorMsg("GSTIN is usually 15 characters. You can still proceed manually below.");
      }
    } catch (err) {
      setGstVerified(false);
      setGstErrorMsg(err.message || "Could not verify GSTIN online. You can still proceed manually below.");
    } finally {
      setGstVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const isInternational = formData.region === "international";
      const currency = isInternational ? "USD" : "INR";

      const selectedPlan = plans.find((p) => p.id === tier) || plans[0];
      if (!selectedPlan) {
        setError("Membership plans are currently unavailable. Please try again shortly.");
        setLoading(false);
        return;
      }

      const basePrice = isInternational
        ? (selectedPlan.priceUsd ?? (selectedPlan.price === 0 ? 0 : Math.round(selectedPlan.price / 80)))
        : selectedPlan.price;

      const gstRate = selectedPlan.gstRate || 18;
      const gstAmount = !isInternational && basePrice > 0 ? Math.round(basePrice * gstRate / 100) : 0;
      const planAmount = isInternational ? basePrice : (basePrice + gstAmount);

      const isPaid = planAmount > 0;

      // If Paid Plan selected, preload Razorpay script first
      if (isPaid) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Failed to load Razorpay payment gateway. Please check your internet connection.");
          setLoading(false);
          return;
        }
      }

      // Ensure Business Logo and Owner Personal Photo are uploaded if selected
      let finalLogoUrl = formData.logo || "";
      if (businessLogoFile && !finalLogoUrl) {
        try {
          const logoRes = await authApi.uploadPhoto(businessLogoFile);
          finalLogoUrl = logoRes?.data?.url || logoRes?.data?.fileUrl || logoRes?.url || logoRes?.fileUrl || "";
          if (finalLogoUrl) {
            setFormData((prev) => ({ ...prev, logo: finalLogoUrl }));
          }
        } catch (logoErr) {
          console.warn("Logo upload notice during final submit:", logoErr);
        }
      }

      let finalAvatarUrl = formData.avatar || "";
      if (ownerPhotoFile && !finalAvatarUrl) {
        try {
          const avatarRes = await authApi.uploadPhoto(ownerPhotoFile);
          finalAvatarUrl = avatarRes?.data?.url || avatarRes?.data?.fileUrl || avatarRes?.url || avatarRes?.fileUrl || "";
          if (finalAvatarUrl) {
            setFormData((prev) => ({ ...prev, avatar: finalAvatarUrl }));
          }
        } catch (avatarErr) {
          console.warn("Owner personal photo upload notice during final submit:", avatarErr);
        }
      }

      // If Admin registering and no photo provided, assign the clean default avatar
      if (isAdmin && !finalAvatarUrl) {
        finalAvatarUrl = DEFAULT_OWNER_PHOTO;
      }

      const finalRole = (
        formData.roleInBusiness === "Other" && formData.customRoleInBusiness
          ? formData.customRoleInBusiness
          : (formData.roleInBusiness || "Founder / Owner")
      ).trim();

      // If Admin Registration (Direct Cash, Online Gateway, or Free Plan)
      if (isAdmin) {
        const finalCollectingState = (cashCollectingState || formData.state || user?.state || "").trim();
        const finalCollectingChapter = (cashCollectingChapter || formData.chapter || user?.chapter || "").trim();

        if (paymentMethod === "cash") {
          if (!finalCollectingState || !finalCollectingChapter || finalCollectingChapter.toLowerCase() === "unassigned") {
            setError("If direct cash is selected, then respective state and chapter is required who is collecting cash.");
            setLoading(false);
            return;
          }
        }

        const activePlanObj = plans.find((p) => p.id === tier) || plans[0];
        const planDisplayName = activePlanObj?.name || tier || "Standard";

        await businessApi.createAdmin({
          businessName: formData.businessName,
          ownerName: formData.contactPerson || formData.businessName,
          contactPerson: formData.contactPerson || formData.businessName,
          roleInBusiness: finalRole,
          designation: finalRole,
          businessEmail: (formData.businessEmail || formData.email).toLowerCase().trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone,
          chapter: formData.chapter || finalCollectingChapter,
          industry: formData.industry,
          subCategory: formData.subCategory,
          businessType: formData.businessType,
          city: formData.city,
          state: isInternational ? (formData.state || "International") : (formData.state || finalCollectingState),
          address: formData.address,
          pincode: formData.pincode,
          founded: formData.founded,
          employees: formData.employees,
          taxId: isInternational ? (certDocNumber || "") : (formData.taxId || "").trim().toUpperCase(),
          region: formData.region || "national",
          membershipTier: tier,
          planName: planDisplayName,
          collectingState: finalCollectingState,
          collectingChapter: finalCollectingChapter,
          paymentMethod: paymentMethod || "cash",
          about: formData.about,
          website: (formData.website || "").trim(),
          instagram: (formData.instagram || "").trim(),
          linkedin: (formData.linkedin || "").trim(),
          logo: finalLogoUrl,
          avatar: finalAvatarUrl,
          ownerPhoto: finalAvatarUrl,
          amountCollected: planAmount
        });
        
        // Notify admin and redirect
        setLoading(false);
        alert("Business registered successfully! An email with login credentials has been sent to the owner.");
        const basePath = user?.role === "chapter_admin" ? "/chapter-admin" : user?.role === "state_admin" ? "/state-admin" : "/admin";
        router.push(`${basePath}/businesses`);
        return;
      }

      // Step 1: Pre-submission validation for public user account password
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters. Please set your account password.");
        setLoading(false);
        setStep(2);
        return;
      }

      // Step 1: Register the business & user account
      await registerBusiness({
        name: formData.contactPerson || formData.businessName,
        contactPerson: formData.contactPerson || formData.businessName,
        roleInBusiness: finalRole,
        designation: finalRole,
        businessEmail: (formData.businessEmail || formData.email).toLowerCase().trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName,
        industry: formData.industry,
        subCategory: formData.subCategory,
        businessType: formData.businessType,
        city: formData.city,
        state: isInternational ? (formData.state || "International") : (formData.state || ""),
        address: formData.address,
        pincode: formData.pincode,
        founded: formData.founded,
        chapter: formData.chapter,
        membership: tier,
        about: formData.about,
        website: (formData.website || "").trim(),
        instagram: (formData.instagram || "").trim(),
        linkedin: (formData.linkedin || "").trim(),
        logo: finalLogoUrl,
        avatar: finalAvatarUrl,
        ownerPhoto: finalAvatarUrl,
        taxId: isInternational ? (certDocNumber || "") : (formData.taxId || "").trim().toUpperCase(),
        dob: formData.dob || undefined,
        timezone: formData.timezone || (typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Asia/Kolkata"),
        region: formData.region || "national",
        currency,
        verifiedToken,
      });

      // Step 1.5: If International and certificate file was selected, upload and attach document to verification
      if (isInternational && certFile) {
        try {
          const docRes = await verificationApi.uploadDocument(certFile);
          const uploadedUrl = docRes?.data?.fileUrl || docRes?.fileUrl;
          if (uploadedUrl) {
            await verificationApi.submit({
              documents: [
                {
                  type: certDocType || "Certificate of Incorporation",
                  name: certFile.name,
                  number: certDocNumber || "",
                  fileUrl: uploadedUrl,
                  status: "pending",
                },
              ],
            });
          }
        } catch (uploadErr) {
          console.warn("Certificate post-registration upload notice:", uploadErr);
        }
      }

      // If Free Plan, finish directly
      if (!isPaid) {
        setSubmitted(true);
        return;
      }

      // Step 2: For Paid Plan, fetch newly registered business ID
      let bizId = null;
      try {
        const myBizRes = await businessApi.getMyBusiness();
        bizId = myBizRes?.data?._id || myBizRes?._id;
      } catch (err) { }

      // Step 3: Create Razorpay Order with currency
      const orderRes = await paymentApi.createOrder({
        amount: planAmount,
        currency,
        planId: tier,
        itemType: "Membership",
        description: `${selectedPlan.name} Membership Subscription (${currency})`,
      });

      const orderData = orderRes?.data || orderRes;
      if (!orderData?.orderId) {
        setSubmitted(true);
        return;
      }

      // Step 4: Open Razorpay Payment Gateway Modal
      const options = {
        key: orderData.keyId || "rzp_test_TTykh9OVkLKNHl",
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name: "RIFAH Chamber of Commerce",
        description: `${selectedPlan.name} Membership Subscription (${currency})`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.contactPerson || formData.businessName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#0F2942",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: tier,
              businessId: bizId,
              amount: planAmount,
              currency,
              itemType: "Membership",
              description: `${selectedPlan.name} Membership Subscription (${currency})`,
              billingEmail: formData.email,
              businessName: formData.businessName,
            });
            setPaidSuccess(true);
          } catch (err) {
            console.error("Payment verification error:", err);
          } finally {
            setLoading(false);
            setSubmitted(true);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setSubmitted(true);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      const errMsg = err?.message || "Failed to complete registration. Please check fields.";
      if (isFieldSpecificError(errMsg)) {
        if (errMsg.toLowerCase().includes("business email")) {
          setStep(1);
          setBusinessEmailCheckResult({ available: false, message: errMsg, email: formData.businessEmail });
          setTimeout(() => {
            const el = document.getElementById("bemail");
            if (el) {
              el.focus();
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 150);
        } else {
          setStep(2);
          setEmailCheckResult({ available: false, message: errMsg, email: formData.email });
          setTimeout(() => {
            const el = document.getElementById("reg-email");
            if (el) {
              el.focus();
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 150);
        }
      } else {
        setError(errMsg);
      }
      setLoading(false);
    }
  };

  if (submitted) {
    const selectedPlan = plans.find((p) => p.id === tier) || { name: tier };
    return (
      <PublicLayout>
        <div className="rifah-container flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center">
            <span className={cn(
              "mx-auto grid h-14 w-14 place-items-center rounded-full",
              paidSuccess ? "bg-emerald-100 text-emerald-600" : "bg-warning-soft text-warning"
            )}>
              {paidSuccess ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              {paidSuccess
                ? `Business Registered & ${selectedPlan.name} Membership Activated!`
                : "Business Registered Successfully"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {paidSuccess
                ? "Your membership payment was processed successfully. An official GST Tax invoice has been dispatched to your email."
                : "Your business profile has been created and submitted for RIFAH central admin verification. You can now access your workspace."}
            </p>
            <ol className="mt-5 space-y-2 text-left text-sm">
              {[
                paidSuccess ? "Membership payment confirmed" : "Application received",
                "Document review by central admin",
                "Verification decision",
                "Listing published on directory",
              ].map((s, i) => (
                <li key={s} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                      i === 0 ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid gap-2">
              <Button asChild>
                <Link href="/biz">Open business workspace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">Browse the directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const Wrapper = isAdmin ? AdminRegisterWrapper : PublicLayout;

  return (
    <Wrapper>
      {/* INITIAL JURISDICTION SELECTION MODAL POPUP */}
      <Dialog open={showRegionModal && !isAdmin} onOpenChange={setShowRegionModal}>
        <DialogContent className="w-[94vw] max-w-xl p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit">
              <Sparkles className="h-3.5 w-3.5" /> Select Business Jurisdiction
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Where is your business registered?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select your business jurisdiction to customize the verification and onboarding requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {/* OPTION 1: NATIONAL (INDIA) */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, region: "national" }));
                setShowRegionModal(false);
                setError("");
              }}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    INR (₹)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  National (India)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  For businesses operating within India. Auto-fetch via GSTIN or fill details manually.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ Optional GSTIN Auto-fill
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ Manual Entry Supported
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Select National</span>
                <span>→</span>
              </div>
            </button>

            {/* OPTION 2: INTERNATIONAL */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, region: "international" }));
                setShowRegionModal(false);
                setError("");
              }}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    USD ($)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  International
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  For overseas enterprises worldwide. Certificate upload is optional or fill details manually.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    ✓ Optional Certificate Upload
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    ✓ Manual Entry Supported
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Select International</span>
                <span>→</span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rifah-container pt-4 pb-32 sm:pt-10 sm:pb-16 max-w-full overflow-x-hidden">
        <div className={cn("mx-auto w-full min-w-0 transition-all duration-300", step === 3 ? "max-w-6xl" : "max-w-2xl")}>
          <SectionHeader
            title="List your business with RIFAH"
            description="Four short steps. Join the chamber network to receive verified buyer leads."
          />
          <div className="mt-4 sm:mt-5 w-full min-w-0">
            <Steps steps={steps} current={step} />
          </div>

          {error && !isFieldSpecificError(error) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");

              // Validation for Step 0 (Business details)
              if (step === 0) {
                // GSTIN is completely optional — no blocking validation on format or verification status

                // Owner Photo is mandatory for public self-registration, but OPTIONAL when central admin is registering
                if (!isAdmin && !ownerPhotoFile && !formData.avatar) {
                  setOwnerPhotoRequired(true);
                  setError("Business owner photo is mandatory. Please upload a clear photo of the business owner before proceeding.");
                  document.getElementById("owner-photo-upload")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                setOwnerPhotoRequired(false);

                if (!formData.businessName || formData.businessName.trim().length < 2) {
                  setError("Business name is required (at least 2 characters).");
                  return;
                }
                if (!formData.industry || !formData.industry.trim()) {
                  setCategoryError(true);
                  setError("Please select or enter a business category.");
                  document.getElementById("category-field-wrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                setCategoryError(false);

                // Year established is mandatory
                const foundedYear = String(formData.founded || "").trim();
                const currentYear = new Date().getFullYear();
                if (!foundedYear) {
                  setError("Year established is mandatory. Please enter the year your business was established.");
                  document.getElementById("byear")?.focus();
                  return;
                }
                if (!/^\d{4}$/.test(foundedYear) || Number(foundedYear) < 1800 || Number(foundedYear) > currentYear) {
                  setError(`Please enter a valid 4-digit Year established (between 1800 and ${currentYear}).`);
                  document.getElementById("byear")?.focus();
                  return;
                }

                // Team size is mandatory
                if (!formData.employees || !String(formData.employees).trim()) {
                  setError("Team size is mandatory. Please select your business team size.");
                  document.getElementById("bemp")?.focus();
                  return;
                }
              }

              // Strict Validation for Step 1 (Contact & Location)
              if (step === 1) {
                if (!formData.contactPerson || formData.contactPerson.trim().length < 2) {
                  setError("Authorised contact person name is mandatory. Please enter the contact person's name.");
                  return;
                }
                if (formData.roleInBusiness === "Other" && (!formData.customRoleInBusiness || formData.customRoleInBusiness.trim().length < 2)) {
                  setError("Please specify your role / designation in the business.");
                  return;
                }

                // Strict Phone / Mobile Number Validation
                const parsedPhone = parsePhoneNumber(formData.phone || "");
                const nationalDigits = (parsedPhone?.nationalNumber || "").replace(/\D/g, "");

                if (!formData.phone || !nationalDigits) {
                  setError("Mobile / Phone number is mandatory. Please enter a valid mobile number before proceeding.");
                  return;
                }

                if (parsedPhone?.country?.code === "IN" && nationalDigits.length !== 10) {
                  setError("Verification failed - Mobile number should be 10 digit");
                  return;
                }

                if (nationalDigits.length < 7 || nationalDigits.length > 15) {
                  setError("Verification failed - Please enter a valid mobile number");
                  return;
                }
                if (formData.businessEmail && (!formData.businessEmail.includes("@") || !formData.businessEmail.includes("."))) {
                  setBusinessEmailCheckResult({
                    available: false,
                    message: "Please provide a valid official business email or leave it empty.",
                    email: formData.businessEmail,
                  });
                  const el = document.getElementById("bemail");
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  return;
                }
                if (formData.businessEmail && formData.businessEmail.trim()) {
                  const beCheck = await verifyBusinessEmailAvailability(formData.businessEmail.trim());
                  if (beCheck && beCheck.available === false) {
                    setBusinessEmailCheckResult({
                      available: false,
                      message: beCheck.message || "Email validation failed: This business email is already registered with an existing business. Email duplicity is not allowed.",
                      email: formData.businessEmail.trim(),
                    });
                    const el = document.getElementById("bemail");
                    if (el) {
                      el.focus();
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    return;
                  }
                }
                // Location validation: State (National) or Country (International), then City
                if (formData.region === "national" && (!formData.state || !formData.state.trim())) {
                  setError("State is mandatory. Please select your business state.");
                  return;
                }
                if (formData.region === "international" && (!formData.state || !formData.state.trim())) {
                  setError("Country is mandatory. Please select or enter your business country.");
                  return;
                }
                if (!formData.city || formData.city.trim().length < 2) {
                  setError("City is mandatory. Please select or enter your business city.");
                  return;
                }

                // Pincode / Postal Code Validation (Field-specific error)
                const currentPostalLabel = getPostalCodeLabel(formData.state, formData.region);
                if (formData.region === "national") {
                  if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
                    setPincodeError("Please enter a valid 6-digit PIN code.");
                    const el = document.getElementById("bpincode");
                    if (el) {
                      el.focus();
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    return;
                  }
                } else {
                  const cleanPin = (formData.pincode || "").trim();
                  if (cleanPin && cleanPin.length > 12) {
                    setPincodeError(`Please enter a valid ${currentPostalLabel}.`);
                    const el = document.getElementById("bpincode");
                    if (el) {
                      el.focus();
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    return;
                  }
                }
                setPincodeError("");
                // RIFAH Chapter is optional (visitor feedback)
              }

              // Validation for Step 2 (Account)
              if (step === 2) {
                const targetEmail = (formData.email || "").trim().toLowerCase();
                if (!targetEmail || !targetEmail.includes("@") || !targetEmail.includes(".")) {
                  setEmailCheckResult({
                    available: false,
                    message: "Please provide a valid account email address.",
                    email: targetEmail,
                  });
                  const el = document.getElementById("reg-email");
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  return;
                }

                // Verify email availability against duplicity
                const emailCheck = await verifyEmailAvailability(targetEmail);
                if (emailCheck && emailCheck.available === false) {
                  setEmailCheckResult({
                    available: false,
                    message: emailCheck.message || "Email validation failed: This email is already registered with an existing business. Email duplicity is not allowed.",
                    email: targetEmail,
                  });
                  const el = document.getElementById("reg-email");
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  return; // CRITICAL: Stop here, DO NOT proceed to Step 3 (Membership)
                }

                if (!isAdmin) {
                  if (!formData.password || formData.password.length < 6) {
                    setError("Please enter an account password with at least 6 characters.");
                    return;
                  }
                  if (!emailVerified) {
                    if (!otpSent) {
                      await handleSendOtp();
                      return;
                    }
                    setError("Please enter the 6-digit verification code sent to your email.");
                    return;
                  }
                }
              }

              if (step < steps.length - 1) {
                setStep((s) => s + 1);
              } else {
                setIsEditingPreview(false);
                setShowPreviewModal(true);
              }
            }}
          >
            {step === 0 && (
              <Panel title="Business details">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Jurisdiction Selector Toggle Bar */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Business Jurisdiction & Currency *
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowRegionModal(true)}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer self-start sm:self-auto"
                      >
                        Change Registration Type
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, region: "national" }));
                          setError("");
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer w-full min-w-0",
                          formData.region === "national"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">National (India)</span>
                            {formData.region === "national" && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            GSTIN · PAN · INR (₹)
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, region: "international" }));
                          setError("");
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer w-full min-w-0",
                          formData.region === "international"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">International</span>
                            {formData.region === "international" && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            Certificate Upload · USD ($)
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* NATIONAL ONLY: 15-digit GSTIN Verification Box */}
                  {formData.region === "national" && (
                    <div className="space-y-2 sm:col-span-2 rounded-2xl border border-slate-200/90 bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-800 p-3.5 sm:p-4 animate-in fade-in duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Label htmlFor="bgst" className="font-bold text-sm text-slate-900 dark:text-white">
                            GSTIN / GST Number <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                          </Label>
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Optional (India)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground font-semibold shrink-0">
                          {(formData.taxId || "").length}/15
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <FastInput
                            id="bgst"
                            maxLength={15}
                            value={formData.taxId}
                            onValueChange={(val) => {
                              const upperVal = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                              setFormData((prev) => ({ ...prev, taxId: upperVal }));
                              setGstVerified(false);
                              setGstData(null);
                              setGstSuccessMsg("");
                              setGstErrorMsg("");
                              setError("");
                            }}
                            placeholder="e.g. 27AAACT2727Q1ZW"
                            className="font-mono uppercase tracking-wider text-sm h-11 pr-8 bg-white dark:bg-slate-900"
                          />
                          {gstVerified && (
                            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                          )}
                        </div>

                        {gstVerified ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 gap-1.5 h-11 px-4"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Verified
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleVerifyGst()}
                            disabled={gstVerifying || !(formData.taxId || "").trim()}
                            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 h-11 px-5 shadow-sm transition-all"
                          >
                            {gstVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                Verify GSTIN
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Optional: Enter 15-character GSTIN to auto-fetch business details, or leave empty to enter details manually below.
                      </p>

                      {/* Error message */}
                      {gstErrorMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{gstErrorMsg}</span>
                        </div>
                      )}

                      {/* Verified Status Note */}
                      {gstVerified && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in-50">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {gstSuccessMsg || "GST Number Verified — details automatically filled into form fields."}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* INTERNATIONAL ONLY: Business Certificate Upload Section (NO GST/TAX FIELD) */}
                  {formData.region === "international" && (
                    <div className="space-y-3 sm:col-span-2 rounded-2xl border border-slate-200/90 bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-800 p-3.5 sm:p-4 animate-in fade-in duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Label className="font-bold text-sm text-slate-900 dark:text-white">
                            Official Business Certificate / License <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                          </Label>
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Optional (USD)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Optional: Upload your official Trade License, Certificate of Incorporation, Commercial Register, or Chamber Certificate, or enter details manually below.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Document Type
                          </Label>
                          <Select
                            value={certDocType}
                            onValueChange={setCertDocType}
                          >
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Certificate of Incorporation">Certificate of Incorporation / Registration</SelectItem>
                              <SelectItem value="Trade License">Trade License / Commercial License</SelectItem>
                              <SelectItem value="Commercial Register">Commercial Register Extract (CR)</SelectItem>
                              <SelectItem value="Chamber Certificate">Chamber of Commerce Certificate</SelectItem>
                              <SelectItem value="Tax Residency Certificate">Tax Residency / VAT Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="cert-num" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            License / Registration No. (Optional)
                          </Label>
                          <Input
                            id="cert-num"
                            value={certDocNumber}
                            onChange={(e) => setCertDocNumber(e.target.value)}
                            placeholder="e.g. CR-8839210 / LIC-994"
                            className="h-11 rounded-xl bg-white dark:bg-slate-900 font-mono uppercase"
                          />
                        </div>
                      </div>

                      {/* File Upload Box */}
                      <div className="pt-2">
                        {certFile ? (
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-white dark:bg-slate-900 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {certFile.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {(certFile.size / (1024 * 1024)).toFixed(2)} MB · {certDocType}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCertFile(null);
                                setCertPreview(null);
                              }}
                              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-200 dark:border-blue-900/60 rounded-2xl cursor-pointer bg-white/70 dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center px-4">
                              <Upload className="h-6 w-6 text-blue-500 mb-1" />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Click to upload Business Certificate / Trade License (Optional)
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                PDF, PNG, JPG up to 15MB
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCertFile(file);
                                  setError("");
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1. Business Owner / Profile Photo Upload (MANDATORY for user, OPTIONAL for admin) */}
                  <div
                    id="owner-photo-upload"
                    className={cn(
                      "sm:col-span-2 space-y-2 rounded-2xl border p-3.5 sm:p-4 transition-colors",
                      !isAdmin && ownerPhotoRequired && !ownerPhotoPreview
                        ? "border-red-400 bg-red-50/40 dark:border-red-800 dark:bg-red-950/20"
                        : "border-slate-200/90 bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-800"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <Label className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Camera className="h-4 w-4 text-primary shrink-0" />
                          <span>Business Owner / Personal Photo</span>
                          {isAdmin ? (
                            <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span>
                          ) : (
                            <span className="text-red-500 font-bold">*</span>
                          )}
                          {!isAdmin && ownerPhotoRequired && !ownerPhotoPreview && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 ml-1">
                              <AlertCircle className="h-3 w-3" /> Required
                            </span>
                          )}
                        </Label>
                      </div>
                      {ownerPhotoPreview && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Photo Attached
                        </span>
                      )}
                    </div>

                    <div className="w-full min-w-0">
                      {ownerPhotoPreview ? (
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 w-full bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                          <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-primary/30 bg-muted grid place-items-center">
                            <img
                              src={ownerPhotoPreview}
                              alt="Owner Profile Photo Preview"
                              className="h-full w-full object-cover"
                            />
                            {ownerPhotoUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {ownerPhotoFile?.name || "Owner Profile Photo"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {ownerPhotoUploading
                                ? "Uploading personal photo..."
                                : ownerPhotoFile?.size
                                ? `${(ownerPhotoFile.size / 1024).toFixed(1)} KB · Ready`
                                : "Ready"}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => ownerPhotoInputRef.current?.click()}
                                disabled={ownerPhotoUploading}
                                className="h-7 text-xs px-2.5 font-medium border-border"
                              >
                                Change Photo
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveOwnerPhoto}
                                disabled={ownerPhotoUploading}
                                className="h-7 text-xs px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => ownerPhotoInputRef.current?.click()}
                          className={cn(
                            "w-full flex items-center gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer group",
                            !isAdmin && ownerPhotoRequired
                              ? "border-red-400 dark:border-red-700 bg-red-50/60 dark:bg-red-950/20 hover:border-red-500 hover:bg-red-50"
                              : "border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-primary hover:bg-primary/5"
                          )}
                        >
                          <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                            {ownerPhotoUploading ? (
                              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                            ) : (
                              <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors leading-snug">
                              Click to upload Business Owner / Personal Photo {isAdmin ? <span className="text-muted-foreground font-normal">(Optional)</span> : <span className="text-red-500 font-bold">*</span>}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {isAdmin
                                ? "PNG, JPG, WEBP up to 10 MB (Optional — default photo used if omitted)"
                                : "PNG, JPG, WEBP up to 10 MB (Displayed on your profile, directory & member badge)"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="hidden sm:inline-flex h-8 text-xs px-3 shrink-0 pointer-events-none group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1" />
                            Browse
                          </Button>
                        </div>
                      )}

                      <input
                        ref={ownerPhotoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleOwnerPhotoUpload(file);
                          }
                        }}
                      />
                    </div>
                    {/* Inline error hint below the upload zone */}
                    {ownerPhotoRequired && !ownerPhotoPreview && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        A clear photo of the business owner is required to proceed.
                      </p>
                    )}
                  </div>


                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bname">Business name *</Label>
                    <FastInput
                      id="bname"
                      required
                      value={formData.businessName}
                      onValueChange={(val) => {
                        setFormData({ ...formData, businessName: val });
                        setError("");
                      }}
                      placeholder="Registered enterprise name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="btype">Business type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(v) => setFormData({ ...formData, businessType: v })}
                    >
                      <SelectTrigger id="btype">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div id="category-field-wrapper" className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bind" className={cn("text-xs font-semibold", categoryError && "text-red-600 dark:text-red-400 font-bold")}>
                        Category <span className="text-red-500 font-bold">*</span>
                      </Label>
                      {categoryError && (
                        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Required
                        </span>
                      )}
                    </div>
                    <CreatableCombobox
                      id="bind"
                      value={formData.industry}
                      onValueChange={(v) => {
                        setFormData(prev => ({ ...prev, industry: v, subCategory: "" }));
                        setCategoryError(false);
                        setError("");
                      }}
                      options={availableMainCategories}
                      placeholder="Select or type a category"
                      emptyText="No category found. Type to add a new one."
                      className={cn(
                        "bg-white dark:bg-slate-900 transition-colors",
                        categoryError && "border-red-500 ring-2 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      )}
                    />
                    {categoryError ? (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1 animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Please select or enter a business category.
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        Pick an existing category or type a new one — it will be added for everyone.
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bsubcat">Sub category</Label>
                    <CreatableCombobox
                      id="bsubcat"
                      value={formData.subCategory}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, subCategory: v }))}
                      options={availableSubCategories}
                      placeholder={formData.industry ? "Select or type a sub category" : "First select a Category above"}
                      emptyText={formData.industry ? "No sub category found. Type to add a custom one." : "Please select a Category first."}
                      disabled={!formData.industry}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {formData.industry
                        ? `Showing ${availableSubCategories.length} sub-categories for ${formData.industry}`
                        : "Select a category above to view its related sub-categories."}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="byear" className="flex items-center gap-1 font-medium">
                      <span>Year established</span>
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <FastInput
                      id="byear"
                      inputMode="numeric"
                      maxLength={4}
                      value={formData.founded}
                      onValueChange={(val) => setFormData({ ...formData, founded: val.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="e.g. 2014"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bemp" className="flex items-center gap-1 font-medium">
                      <span>Team size</span>
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Select
                      value={formData.employees}
                      onValueChange={(v) => setFormData({ ...formData, employees: v })}
                      required
                    >
                      <SelectTrigger id="bemp">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1–10", "11–50", "51–200", "200+"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="babout">About the business</Label>
                    <FastTextarea
                      id="babout"
                      rows={3}
                      value={formData.about}
                      onValueChange={(val) => setFormData({ ...formData, about: val })}
                      placeholder="Capabilities, products manufactured, sectors served."
                    />
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Contact & location">
                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="space-y-1.5">
                    <Label htmlFor="cperson">Contact person *</Label>
                    <FastInput
                      id="cperson"
                      required
                      value={formData.contactPerson}
                      onValueChange={(val) => setFormData({ ...formData, contactPerson: val })}
                      placeholder="Authorised representative"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="roleInBusiness">Your Role in Business *</Label>
                    <Select
                      value={formData.roleInBusiness || "Founder / Owner"}
                      onValueChange={(val) => setFormData({ ...formData, roleInBusiness: val })}
                    >
                      <SelectTrigger id="roleInBusiness" className="h-10">
                        <SelectValue placeholder="Select your role in business" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Founder / Owner">Founder / Owner</SelectItem>
                        <SelectItem value="Proprietor">Proprietor</SelectItem>
                        <SelectItem value="Managing Director (MD)">Managing Director (MD)</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
                        <SelectItem value="Director / CEO">Director / CEO</SelectItem>
                        <SelectItem value="General Manager / COO">General Manager / COO</SelectItem>
                        <SelectItem value="Authorized Representative">Authorized Representative</SelectItem>
                        <SelectItem value="Other">Other (Specify below)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.roleInBusiness === "Other" && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="customRole">Specify Your Role / Designation *</Label>
                      <FastInput
                        id="customRole"
                        value={formData.customRoleInBusiness || ""}
                        onValueChange={(val) => setFormData({ ...formData, customRoleInBusiness: val })}
                        placeholder="e.g. Chief Marketing Officer, Co-Founder, Operations Head"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bphone">Mobile / Phone Number *</Label>
                    <PhoneInput
                      id="bphone"
                      required
                      value={formData.phone}
                      onValueChange={(val) => {
                        setFormData((prev) => ({ ...prev, phone: val }));
                        setError("");
                      }}
                      placeholder="10-digit mobile number"
                    />
                    <p className="text-[10px] text-muted-foreground">Direct mobile contact is mandatory for lead notifications.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bdob">Date of Birth (Owner / Member)</Label>
                    <FastInput
                      id="bdob"
                      type="date"
                      value={formData.dob}
                      onValueChange={(val) => setFormData({ ...formData, dob: val })}
                      className="h-11"
                    />
                    <p className="text-[10px] text-muted-foreground">Used for chapter birthday greetings & networking wishes (Birth year is kept strictly private).</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bjoiningDate">Date of Joining (RIFAH Member Since)</Label>
                    <FastInput
                      id="bjoiningDate"
                      type="date"
                      value={formData.joiningDate}
                      readOnly
                      disabled
                      className="h-11 bg-muted/60 text-muted-foreground cursor-not-allowed select-none"
                    />
                    <p className="text-[10px] text-muted-foreground">Automatically locked to registration date. Used for annual RIFAH membership anniversary milestones & chapter recognition.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <Label htmlFor="bemail" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>Official Business Email</span>
                        {businessEmailChecking && (
                          <span className="flex items-center gap-1 text-[11px] font-normal text-blue-600 dark:text-blue-400">
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                            Checking...
                          </span>
                        )}
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Public & Buyer Facing (Optional)
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="bemail"
                        type="email"
                        value={formData.businessEmail || ""}
                        onChange={(e) => handleBusinessEmailChange(e.target.value)}
                        onBlur={handleBusinessEmailBlur}
                        placeholder="e.g. contact@yourbusiness.com or sales@company.in"
                        className={cn(
                          "h-11 transition-all duration-200",
                          businessEmailCheckResult && !businessEmailCheckResult.available
                            ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/30 text-rose-900 pr-10"
                            : businessEmailCheckResult && businessEmailCheckResult.available
                              ? "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/20 pr-10"
                              : ""
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                        {businessEmailChecking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : businessEmailCheckResult && !businessEmailCheckResult.available ? (
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                        ) : businessEmailCheckResult && businessEmailCheckResult.available ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : null}
                      </div>
                    </div>

                    {businessEmailChecking && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 animate-in fade-in">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-blue-600" />
                        <span>Verifying business email availability...</span>
                      </div>
                    )}

                    {businessEmailCheckResult && !businessEmailCheckResult.available && (
                      <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-300 dark:border-rose-900/60 mt-1.5 shadow-xs animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-900 dark:text-rose-200">
                            Email Validation Failed
                          </p>
                          <p className="text-[11.5px] font-normal leading-relaxed text-rose-700 dark:text-rose-300">
                            {businessEmailCheckResult.message || "This email is already registered with an existing business. Email duplicity is not allowed."}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessEmailCheckResult && businessEmailCheckResult.available && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 animate-in fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Business email is available.</span>
                      </div>
                    )}

                    <p className="text-[11px] text-muted-foreground">
                      Public email displayed on your business directory card & catalogue for buyer RFQs and customer enquiries. (If left blank, your owner login email will be used).
                    </p>
                  </div>
                  {/* 1. State (for National/INR) or Country / Region (for International/USD) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    {formData.region === "national" ? (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bstate" className="font-semibold text-slate-800 dark:text-slate-200">
                            State *
                          </Label>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Select first
                          </span>
                        </div>
                        <CreatableCombobox
                          id="bstate"
                          value={formData.state}
                          onValueChange={handleStateChange}
                          options={states}
                          placeholder="Select your business state"
                          emptyText="No matching state. Type to enter a custom state."
                          className="h-11"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bstate" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                            <span>Country / Region *</span>
                          </Label>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Select country
                          </span>
                        </div>
                        <CreatableCombobox
                          id="bstate"
                          value={formData.state}
                          onValueChange={handleStateChange}
                          options={ALL_INTERNATIONAL_COUNTRIES}
                          placeholder="Select or search country (e.g. United Arab Emirates, Saudi Arabia, USA, UK)"
                          emptyText="No matching country found. Type to enter a custom country."
                          className="h-11"
                        />
                      </>
                    )}
                  </div>

                  {/* 2. City (Searchable Dropdown, Cascaded from State / Country) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bcity" className="font-semibold text-slate-800 dark:text-slate-200">
                      City *
                    </Label>
                    <CreatableCombobox
                      id="bcity"
                      value={formData.city}
                      onValueChange={handleCityChange}
                      options={availableCities}
                      placeholder={
                        !formData.state
                          ? (formData.region === "international" ? "Select country first (or search city)" : "Select state first (or search city)")
                          : (formData.region === "international" ? `Select or search city in ${formData.state}` : "Select or search city")
                      }
                      emptyText={
                        formData.state
                          ? `No preset city found for ${formData.state}. Type to enter a custom city.`
                          : "Please select a country/state first."
                      }
                      className="h-11"
                    />
                    {formData.region === "international" && formData.state && availableCities.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Showing major commercial cities for {formData.state} (or type custom city).
                      </p>
                    )}
                  </div>

                  {/* 3. Pincode / Postal code (Auto-captured based on City, Editable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="bpincode"
                        className={cn(
                          "font-semibold text-slate-800 dark:text-slate-200",
                          pincodeError && "text-red-600 dark:text-red-400 font-bold"
                        )}
                      >
                        {getPostalCodeLabel(formData.state, formData.region)}
                      </Label>
                      {formData.pincode && !pincodeError && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Auto-captured
                        </span>
                      )}
                    </div>
                    <FastInput
                      id="bpincode"
                      value={formData.pincode}
                      onValueChange={(val) => {
                        setFormData({ ...formData, pincode: val });
                        setPincodeError("");
                        setError("");
                      }}
                      placeholder={getPostalCodePlaceholder(formData.state, formData.region)}
                      className={cn(
                        "h-11 transition-all duration-200",
                        pincodeError && "border-red-500 ring-2 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-200"
                      )}
                    />
                    {pincodeError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {pincodeError}
                      </p>
                    )}
                  </div>

                  {/* 4. Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="baddress" className="font-semibold text-slate-800 dark:text-slate-200">
                      Address <span className="text-muted-foreground font-normal text-xs">(Street, area, premises)</span>
                    </Label>
                    <FastInput
                      id="baddress"
                      value={formData.address}
                      onValueChange={(val) => setFormData({ ...formData, address: val })}
                      placeholder="Street, area, premises"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="bchapter">
                      RIFAH Chapter <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                    </Label>
                    <Select
                      value={formData.chapter}
                      onValueChange={(v) => {
                        setFormData({ ...formData, chapter: v });
                        setError("");
                      }}
                    >
                      <SelectTrigger id="bchapter" className="h-11">
                        <SelectValue placeholder={formData.region === "national" && !formData.state ? "Select a state first (Optional)" : "Select chapter (Optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.region === "national" ? chaptersForSelectedState : chapters).map((c) => (
                          <SelectItem key={c._id || c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Optional: Select your local RIFAH chamber chapter for regional networking and chapter governance.</p>
                  </div>

                  {/* Online & Social Presence (Optional) */}
                  <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        Online & Social Presence <span className="text-muted-foreground font-normal text-xs lowercase">(optional)</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Add your official handles to help buyers and chamber members discover your brand.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="binstagram" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Instagram className="h-3.5 w-3.5 text-pink-600" />
                          Instagram Profile / Handle
                        </Label>
                        <FastInput
                          id="binstagram"
                          value={formData.instagram}
                          onValueChange={(val) => setFormData({ ...formData, instagram: val })}
                          placeholder="e.g. @yourbusiness or instagram.com/brand"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="blinkedin" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                          LinkedIn Profile / Page
                        </Label>
                        <FastInput
                          id="blinkedin"
                          value={formData.linkedin}
                          onValueChange={(val) => setFormData({ ...formData, linkedin: val })}
                          placeholder="e.g. linkedin.com/company/yourbusiness"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {step === 2 && (
              <Panel title="Owner Login Account">
                <div className="space-y-5">
                  {/* Account Information Helper Callout */}
                  <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300">
                    <Shield className="h-4 w-4 text-[#0060df] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        Business Owner Login Credentials
                      </strong>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                        This email is your personal account username. Official chamber notices, OTP verification, security alerts, and administrative correspondence will be delivered here.
                      </p>
                    </div>
                  </div>

                  {/* Account Email Field */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <Label htmlFor="reg-email" className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Owner Personal Email *</span>
                        {emailChecking && (
                          <span className="flex items-center gap-1 text-[11px] font-normal text-blue-600 dark:text-blue-400">
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                            Checking...
                          </span>
                        )}
                      </Label>
                      <div className="flex items-center gap-2">
                        {formData.businessEmail && formData.email !== formData.businessEmail && !emailVerified && !otpSent && (
                          <button
                            type="button"
                            onClick={() => {
                              const be = (formData.businessEmail || "").trim();
                              handleEmailChange(be);
                            }}
                            className="text-xs font-semibold text-[#0060df] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Same as official business email</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="e.g. owner.name@gmail.com"
                        className={cn(
                          "h-11 transition-all duration-200",
                          emailCheckResult && !emailCheckResult.available
                            ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/30 text-rose-900 pr-10"
                            : emailCheckResult && emailCheckResult.available && !emailVerified
                              ? "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/20 pr-10"
                              : (!isAdmin && emailVerified)
                                ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 pr-36 focus-visible:ring-emerald-500"
                                : (!isAdmin && otpSent) || (isAdmin && convertEmail)
                                  ? "bg-slate-50 text-slate-600 pr-24"
                                  : ""
                        )}
                        disabled={(!isAdmin && (emailVerified || otpSent)) || (isAdmin && !!convertEmail)}
                      />

                      {/* Status indicator inside input for Admin or before OTP is sent */}
                      {((isAdmin || !otpSent) && !emailVerified) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                          {emailChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : emailCheckResult && !emailCheckResult.available ? (
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                          ) : emailCheckResult && emailCheckResult.available ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : null}
                        </div>
                      )}

                      {(!isAdmin && emailVerified) ? (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleEditEmail}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      ) : (!isAdmin && otpSent && !emailVerified) ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleEditEmail}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs text-[#0060df] hover:text-[#0051bd] border-slate-200 hover:bg-slate-100 bg-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      ) : (
                        !isAdmin && !otpSent && (
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpSending || !formData.email || !formData.email.includes("@") || (emailCheckResult && !emailCheckResult.available)}
                            size="sm"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs bg-[#0060df] hover:bg-[#0051bd] text-white rounded-lg font-semibold flex items-center gap-1.5"
                          >
                            {otpSending ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-3.5 w-3.5" />
                                <span>Send OTP</span>
                              </>
                            )}
                          </Button>
                        )
                      )}
                    </div>

                    {/* Email Verification / Duplicity Status Indicators */}
                    {emailChecking && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium mt-1.5 animate-in fade-in">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-blue-600" />
                        <span>Verifying email availability...</span>
                      </div>
                    )}

                    {emailCheckResult && !emailCheckResult.available && (
                      <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/50 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/60 mt-2 shadow-xs animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-900 dark:text-rose-200">
                            Email Already Registered
                          </p>
                          <p className="text-[11.5px] font-normal leading-relaxed text-rose-700 dark:text-rose-300">
                            {emailCheckResult.message || "This email is already registered with an existing business. Email duplicity is not allowed."}
                          </p>
                          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pt-0.5">
                            Please enter a different personal email address to proceed.
                          </p>
                        </div>
                      </div>
                    )}

                    {emailCheckResult && emailCheckResult.available && !emailVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 animate-in fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Email is available for registration.</span>
                      </div>
                    )}

                    {!isAdmin && !emailVerified && !otpSent && !emailCheckResult && (
                      <p className="text-xs text-muted-foreground">
                        We will send a 6-digit verification code to confirm this email.
                      </p>
                    )}
                    {isAdmin && (!emailCheckResult || emailCheckResult.available) && (
                      <p className="text-xs text-muted-foreground">
                        An auto-generated secure password will be sent to this email.
                      </p>
                    )}
                  </div>

                  {/* Step 2: 6-Digit Verification Code Box (Matching Forgot Password Theme) */}
                  {!isAdmin && otpSent && !emailVerified && (
                    <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-bold text-[#0f172a]">
                            6-Digit Verification Code
                          </Label>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={otpSending}
                            className="text-xs font-semibold text-[#0060df] hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <span>Resend code</span>
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          Enter the code sent to <strong className="text-slate-800">{formData.email}</strong>
                        </p>

                        {/* 6 Individual Digit Input Boxes */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-3 w-full max-w-full">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              autoComplete="off"
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
                                if (pasteData) {
                                  handleOtpDigitChange(idx, pasteData);
                                }
                              }}
                              className={`h-12 w-9 sm:h-16 sm:w-14 rounded-xl sm:rounded-2xl border text-center text-xl sm:text-2xl font-bold transition-all outline-none bg-white ${digit
                                  ? "border-slate-300 text-slate-900 shadow-sm"
                                  : "border-slate-200 text-slate-900"
                                } focus:border-[#0060df] focus:ring-4 focus:ring-blue-100/70`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Timer Notice matching reference design */}
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 my-2">
                        <Shield className="h-3.5 w-3.5 text-[#0060df]" />
                        <span>
                          Enter the code within{" "}
                          <span className="font-bold text-[#C90000]">{formatTimer(otpTimer)}</span> minutes
                        </span>
                      </div>

                      {otpError && (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      {otpSuccess && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{otpSuccess}</span>
                        </div>
                      )}

                      {devOtp && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#0060df] shrink-0" />
                            <span>Verification Code: <strong className="font-mono text-sm tracking-widest font-extrabold text-[#0060df]">{devOtp}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const digits = String(devOtp).split("").slice(0, 6);
                              while (digits.length < 6) digits.push("");
                              setOtpDigits(digits);
                              setOtpError("");
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0060df] hover:bg-[#0051bd] rounded-lg cursor-pointer transition-all"
                          >
                            Auto-fill Code
                          </button>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otpDigits.join("").length !== 6}
                        className="w-full h-11 rounded-xl bg-[#0060df] hover:bg-[#0051bd] text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        {otpVerifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Verifying Code...
                          </>
                        ) : (
                          "Verify Code"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Password Field - Rendered for non-admin users so user always has access to set password */}
                  {!isAdmin && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      <Label htmlFor="reg-pass" className="font-bold text-sm text-slate-900 dark:text-white">
                        Account Password *
                      </Label>
                      <FastInput
                        id="reg-pass"
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onValueChange={(val) => {
                          setFormData({ ...formData, password: val });
                          setError("");
                        }}
                        placeholder="Minimum 6 characters"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Create a secure password with at least 6 characters. You will use this password to log in.
                      </p>
                    </div>
                  )}
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Choose a membership tier" className="overflow-visible">
                {/* Region & Currency Selector Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/70 mb-3.5">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Billing Currency & Region
                    </span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      {formData.region === "international" ? (
                        <>
                          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                            <Globe className="h-3.5 w-3.5 shrink-0" /> International Business
                          </span>
                          <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 text-[11px]">
                            USD ($)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="h-3.5 w-3.5 shrink-0" /> National (India)
                          </span>
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 text-[11px]">
                            INR (₹)
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-muted/80 p-1 text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, region: "national" }))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer",
                        formData.region === "national"
                          ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>₹ INR (India)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, region: "international" }))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer",
                        formData.region === "international"
                          ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>$ USD (Global)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6">
                  <ChamberMembershipTiers
                    plansData={plansData}
                    currentTier={tier}
                    currency={formData.region === "international" ? "USD" : "INR"}
                    onSelectPlan={(p) => setTier(p.id)}
                    showHeader={false}
                  />
                </div>

                {(() => {
                  const isIntl = formData.region === "international";
                  const activePlan = plans.find((p) => p.id === tier) || plans[0];
                  if (!activePlan) {
                    return <p className="mt-4 text-xs text-muted-foreground">Membership plans are being updated. Please check back shortly.</p>;
                  }
                  const basePrice = isIntl
                    ? (activePlan.priceUsd ?? (activePlan.price === 0 ? 0 : Math.round(activePlan.price / 80)))
                    : activePlan.price;
                  const gstRate = Number(activePlan.gstRate ?? 0);
                  const gstAmt = !isIntl && basePrice > 0 ? Math.round(basePrice * gstRate / 100) : 0;
                  const totalPayable = isIntl ? basePrice : (basePrice + gstAmt);
                  const durationYears = Number(activePlan.durationYears) || 1;

                  if (totalPayable > 0) {
                    return (
                      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/40 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-blue-200/70 dark:border-blue-900/50">
                          <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selected Membership Tier</span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                              {activePlan.name} Plan
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                                {durationYears}-Year Term
                              </span>
                            </h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Total Payable ({isIntl ? "USD" : "INR"})
                            </span>
                            <h4 className="text-lg sm:text-xl font-extrabold text-primary">
                              {isIntl ? `$ ${totalPayable.toLocaleString("en-US")} USD` : `₹ ${totalPayable.toLocaleString("en-IN")}`}
                            </h4>
                          </div>
                        </div>

                        {/* Line Item Breakdown for GST (INR) */}
                        {!isIntl && basePrice > 0 && (
                          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 text-xs space-y-1.5 border border-blue-100 dark:border-blue-900/40">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Base Membership Fee ({durationYears} Year)</span>
                              <span className="font-semibold text-slate-900 dark:text-white">₹ {basePrice.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Applicable GST ({gstRate}%)</span>
                              <span className="font-semibold text-slate-900 dark:text-white">₹ {gstAmt.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs">
                              <span>Total Amount (incl. {gstRate}% GST)</span>
                              <span className="text-primary font-extrabold text-sm">₹ {totalPayable.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            {isIntl
                              ? "Razorpay Global Gateway (International Credit / Debit Cards in USD)"
                              : "Razorpay Instant Payment Gateway (UPI / QR / Cards / NetBanking in INR)"}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="mt-3 flex flex-col space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Method (Admin Override)</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={cn(
                                  "flex-1 rounded-lg border py-2 px-3 text-sm font-semibold transition-all text-center",
                                  paymentMethod === "cash" ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-xs" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                )}
                              >
                                Direct Cash
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("online")}
                                className={cn(
                                  "flex-1 rounded-lg border py-2 px-3 text-sm font-semibold transition-all text-center",
                                  paymentMethod === "online" ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                )}
                              >
                                Online Gateway
                              </button>
                            </div>

                            {paymentMethod === "cash" && (
                              <div className="mt-1 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900/40 space-y-2.5 animate-in fade-in-50 duration-200">
                                <div className="flex items-start gap-2">
                                  <Building2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                                      Cash Collecting Chapter & State <span className="text-red-500">*</span>
                                    </p>
                                    <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
                                      Respective state and chapter is required who is collecting cash.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div className="space-y-1">
                                    <Label htmlFor="cashCollectingState" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                      Collecting State <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                      value={cashCollectingState}
                                      onValueChange={(val) => {
                                        setCashCollectingState(val);
                                        const stillValid = chapters.some(
                                          (c) => c.name === cashCollectingChapter && (c.state || "").trim().toLowerCase() === val.trim().toLowerCase()
                                        );
                                        if (!stillValid) {
                                          setCashCollectingChapter("");
                                        }
                                        setError("");
                                      }}
                                    >
                                      <SelectTrigger id="cashCollectingState" className="h-9 text-xs bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Select collecting state" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {states.map((st) => (
                                          <SelectItem key={st} value={st} className="text-xs">
                                            {st}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label htmlFor="cashCollectingChapter" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                      Collecting Chapter <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                      value={cashCollectingChapter}
                                      onValueChange={(val) => {
                                        setCashCollectingChapter(val);
                                        setError("");
                                      }}
                                    >
                                      <SelectTrigger id="cashCollectingChapter" className="h-9 text-xs bg-white dark:bg-slate-900">
                                        <SelectValue placeholder={cashCollectingState ? "Select collecting chapter" : "Select state first"} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {collectingChaptersList.map((ch) => (
                                          <SelectItem key={ch._id || ch.name} value={ch.name} className="text-xs">
                                            {ch.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {isIntl ? (
                            <>
                              Official international subscription receipt will be dispatched to <strong>{formData.email}</strong> upon payment confirmation.
                            </>
                          ) : (
                            <>
                              Official GST Tax Invoice with attached PDF will be dispatched to <strong>{formData.email}</strong> upon payment confirmation.
                            </>
                          )}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p className="mt-4 text-xs text-muted-foreground">
                      The listing is activated in the directory upon central admin review.
                    </p>
                  );
                })()}
              </Panel>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              {step === 0 ? (
                <Button asChild type="button" variant="ghost">
                  <Link href="/">Cancel</Link>
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              <Button
                type="submit"
                size="lg"
                className="sm:min-w-52"
                disabled={
                  loading ||
                  emailChecking ||
                  businessEmailChecking ||
                  (step === 2 && emailCheckResult && emailCheckResult.available === false) ||
                  (step === 1 && businessEmailCheckResult && businessEmailCheckResult.available === false)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (emailChecking || businessEmailChecking) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Email...
                  </>
                ) : step === 2 && emailCheckResult && emailCheckResult.available === false ? (
                  "Fix Duplicate Email to Continue"
                ) : step === 1 && businessEmailCheckResult && businessEmailCheckResult.available === false ? (
                  "Fix Duplicate Email to Continue"
                ) : step === steps.length - 1 ? (
                  (() => {
                    const isIntl = formData.region === "international";
                    const activePlan = plans.find((p) => p.id === tier) || plans[0];
                    const basePrice = isIntl
                      ? (activePlan?.priceUsd ?? (activePlan?.price === 0 ? 0 : Math.round((activePlan?.price || 0) / 80)))
                      : (activePlan?.price || 0);
                    const gstRate = Number(activePlan?.gstRate ?? 0);
                    const gstAmt = !isIntl && basePrice > 0 ? Math.round(basePrice * gstRate / 100) : 0;
                    const totalPayable = isIntl ? basePrice : (basePrice + gstAmt);

                    if (totalPayable > 0) {
                      if (isAdmin && paymentMethod === "cash") {
                        return isIntl ? `Preview & Register ($${totalPayable} Cash)` : `Preview & Register (₹${totalPayable.toLocaleString("en-IN")} Cash)`;
                      }
                      return isIntl
                        ? `👁️ Preview & Pay ($${totalPayable} USD)`
                        : `👁️ Preview & Pay (₹${totalPayable.toLocaleString("en-IN")})`;
                    }
                    return "👁️ Preview & Complete Registration";
                  })()
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= REGISTRATION PREVIEW & CONFIRMATION DIALOG ================= */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="w-[96vw] max-w-3xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl font-sans max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5 text-left border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" /> Registration Preview
              </div>
              {isEditingPreview ? (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Edit Mode Active
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Step 4 of 4 · Ready for Payment
                </span>
              )}
            </div>
            <DialogTitle className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isEditingPreview ? "Edit Your Registration Details" : "Review & Confirm Registration"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isEditingPreview
                ? "You can modify your details below. Changes are saved directly to your registration."
                : "Please review your business information before proceeding to the payment gateway."}
            </DialogDescription>
          </DialogHeader>

          {/* Plan & Payable Summary Box */}
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Selected Membership Plan
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {previewPlanDetails.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    {previewPlanDetails.isIntl ? "International" : "National"}
                  </span>
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Payable</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {previewPlanDetails.totalPayable > 0 ? (
                    previewPlanDetails.isIntl
                      ? `$${previewPlanDetails.totalPayable} USD`
                      : `₹${previewPlanDetails.totalPayable.toLocaleString("en-IN")}`
                  ) : (
                    "Free (₹0)"
                  )}
                </span>
                {previewPlanDetails.gstAmt > 0 && (
                  <span className="block text-[10px] text-slate-500">
                    Base: ₹{previewPlanDetails.basePrice.toLocaleString("en-IN")} + GST ({previewPlanDetails.gstRate}%): ₹{previewPlanDetails.gstAmt.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body: View Mode vs Edit Mode */}
          {!isEditingPreview ? (
            /* ================= VIEW / SUMMARY MODE ================= */
            <div className="mt-4 space-y-4">
              {/* Business Profile Card */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Business Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Business Name:</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{formData.businessName || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Legal Entity Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.businessType || "Proprietorship"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Industry / Category:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.industry || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Sub-Category:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.subCategory || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">GSTIN / Tax ID:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formData.taxId || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Registered Chapter:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formData.chapter || "RIFAH Chamber"}</span>
                  </div>
                  {formData.website && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Website:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{formData.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Location Card */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  Owner, Contact & Location
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Contact Person:</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{formData.contactPerson || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Designation / Role:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formData.roleInBusiness === "Other" && formData.customRoleInBusiness
                        ? formData.customRoleInBusiness
                        : (formData.roleInBusiness || "Founder / Owner")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Phone / WhatsApp:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Account / Login Email:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block">{formData.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Business Email:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block">{formData.businessEmail || formData.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">City & State:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formData.city || "—"}, {formData.state || "—"} {formData.pincode ? `(${formData.pincode})` : ""}
                    </span>
                  </div>
                  {formData.address && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Street Address:</span>
                      <span className="text-slate-700 dark:text-slate-300 block">{formData.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= EDIT MODE IN DIALOG ================= */
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-800 dark:text-amber-300">
                  ✏️ You can edit any details below. They will be saved immediately to your registration.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPreview(false)}
                  className="shrink-0 text-xs font-semibold h-7 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                >
                  <Check className="mr-1 h-3 w-3" /> Done
                </Button>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Business Name *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter business name"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Legal Entity Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, businessType: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proprietorship" className="text-xs">Proprietorship</SelectItem>
                      <SelectItem value="Partnership" className="text-xs">Partnership</SelectItem>
                      <SelectItem value="Private Limited" className="text-xs">Private Limited</SelectItem>
                      <SelectItem value="LLP" className="text-xs">LLP</SelectItem>
                      <SelectItem value="Public Limited" className="text-xs">Public Limited</SelectItem>
                      <SelectItem value="Trust / NGO" className="text-xs">Trust / NGO</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Industry / Category</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g. Information Technology"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Sub-Category</Label>
                  <Input
                    value={formData.subCategory}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
                    placeholder="e.g. Software & Web Development"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Contact Person *</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Owner / Representative name"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Designation / Role</Label>
                  <Input
                    value={formData.roleInBusiness}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roleInBusiness: e.target.value }))}
                    placeholder="e.g. Founder / Managing Director"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone / WhatsApp *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Business Email</Label>
                  <Input
                    value={formData.businessEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, businessEmail: e.target.value }))}
                    placeholder="contact@yourbusiness.com"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Pune"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. Maharashtra"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Pincode</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                    placeholder="e.g. 411001"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">GSTIN / Tax ID</Label>
                  <Input
                    value={formData.taxId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value.toUpperCase() }))}
                    placeholder="15-digit GSTIN"
                    className="h-9 text-xs sm:text-sm uppercase font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-medium">Registered Chapter</Label>
                  <Select
                    value={formData.chapter}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, chapter: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((c) => (
                        <SelectItem key={c._id || c.name} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-medium">Street Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Office / Shop / Factory street address"
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Jump to Form steps for media or password */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Want to change uploaded logos, photos, or password?</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setStep(0);
                    }}
                    className="h-7 text-xs text-primary hover:underline"
                  >
                    Step 1 (Media)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setStep(1);
                    }}
                    className="h-7 text-xs text-primary hover:underline"
                  >
                    Step 2 (Contact)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setStep(2);
                    }}
                    className="h-7 text-xs text-primary hover:underline"
                  >
                    Step 3 (Password)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ================= DIALOG FOOTER: 2 BUTTONS (EDIT & SUBMIT) ================= */}
          <DialogFooter className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between items-center">
            {/* BUTTON 1: EDIT BUTTON */}
            {isEditingPreview ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingPreview(false)}
                className="w-full sm:w-auto text-xs font-semibold border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Done Editing (View Summary)
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingPreview(true)}
                className="w-full sm:w-auto text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                Edit Details
              </Button>
            )}

            {/* BUTTON 2: SUBMIT BUTTON */}
            <Button
              type="button"
              disabled={loading}
              onClick={async () => {
                setShowPreviewModal(false);
                await handleFinalSubmit();
              }}
              className="w-full sm:w-auto text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md sm:min-w-48"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : previewPlanDetails.totalPayable > 0 ? (
                previewPlanDetails.isIntl
                  ? `Submit & Pay $${previewPlanDetails.totalPayable} USD →`
                  : `Submit & Pay ₹${previewPlanDetails.totalPayable.toLocaleString("en-IN")} →`
              ) : (
                "Submit Registration →"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Wrapper>
  );
}

export { RegisterBusiness as RegisterBusinessPage };
export default RegisterBusiness;
