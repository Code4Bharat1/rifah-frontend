"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCcw,
  Shield,
  Sparkles,
  Globe,
  Briefcase,
  Layers,
  Check,
  Zap,
  Star,
  Crown,
  ChevronDown,
  Search,
  Users,
} from "lucide-react";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@shared/providers/auth-provider";
import { authApi, businessApi } from "@shared/lib/api-services";
import { COUNTRIES } from "@shared/lib/countries";
import { CATEGORIES_DATA } from "@shared/lib/categories-data";
import { INDIAN_STATES_AND_CITIES } from "@shared/lib/indian-states-cities";
import { INTERNATIONAL_COUNTRIES_AND_CITIES } from "@shared/lib/international-countries-cities";
import { SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";
import { useCountries, useStates, useChapters } from "@shared/hooks/use-rifah-api";
import { toast } from "sonner";

export function RegisterUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");
  const { register } = useAuth();
  const { countries: dbCountries = [] } = useCountries({ status: "Active" });

  // Multi-step: 1 = Contact & Security, 2 = Business & Location, 3 = Membership Tier
  const [step, setStep] = useState(1);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    // Step 2: Location & Business
    regionType: "national", // "national" or "international"
    country: "India",
    state: "",
    city: "",
    businessName: "",
    category: "",
    subCategory: "",
    // Multi-member membership linking (Tier IV enterprise roster)
    membershipId: "",
    // Step 3: Tier selection
    selectedTier: "tier_1", // Default to Tier I (Free)
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(150);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [emailConflictError, setEmailConflictError] = useState("");
  const otpInputRefs = useRef([]);

  // Registration Path Selection: "individual" (default) or "business"
  const [registrationPath, setRegistrationPath] = useState("individual");

  // Existing Business selection state
  const [selectedState, setSelectedState] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [businessSearchQuery, setBusinessSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [linkableBusinesses, setLinkableBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  // Filter only eligible businesses for team member registration
  const displayedBusinesses = useMemo(() => {
    return (linkableBusinesses || []).filter((b) => b && b.isEligibleForMemberLink);
  }, [linkableBusinesses]);

  // Business OTP state
  const [bizOtpSent, setBizOtpSent] = useState(false);
  const [bizOtpSending, setBizOtpSending] = useState(false);
  const [bizOtpVerifying, setBizOtpVerifying] = useState(false);
  const [bizOtpDigits, setBizOtpDigits] = useState(["", "", "", "", "", ""]);
  const [bizOtpTimer, setBizOtpTimer] = useState(150);
  const [bizOtpError, setBizOtpError] = useState("");
  const [bizOtpSuccess, setBizOtpSuccess] = useState("");
  const [bizMaskedEmail, setBizMaskedEmail] = useState("");
  const [bizVerified, setBizVerified] = useState(false);
  const [businessLinkToken, setBusinessLinkToken] = useState(null);
  const bizOtpInputRefs = useRef([]);

  const { data: chaptersData = [] } = useChapters();
  const { data: statesData = [] } = useStates();

  const filteredChapters = useMemo(() => {
    const all = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.chapters || []);
    if (!selectedState) return all;
    return all.filter((c) => {
      const cState = String(c.state || "").toLowerCase().trim();
      return cState === selectedState.toLowerCase().trim();
    });
  }, [chaptersData, selectedState]);

  // Load linkable businesses when in business path or filters change
  useEffect(() => {
    if (registrationPath !== "business") return;
    let isMounted = true;
    const fetchLinkable = async () => {
      setLoadingBusinesses(true);
      try {
        const res = await businessApi.getLinkableBusinesses({
          state: selectedState || undefined,
          chapter: selectedChapter || undefined,
          search: businessSearchQuery || undefined,
        });
        if (isMounted) {
          setLinkableBusinesses(res?.data || res || []);
        }
      } catch (err) {
        if (isMounted) setLinkableBusinesses([]);
      } finally {
        if (isMounted) setLoadingBusinesses(false);
      }
    };
    fetchLinkable();
    return () => {
      isMounted = false;
    };
  }, [registrationPath, selectedState, selectedChapter, businessSearchQuery]);

  // Business OTP Timer countdown
  useEffect(() => {
    let interval = null;
    if (bizOtpSent && !bizVerified && bizOtpTimer > 0) {
      interval = setInterval(() => {
        setBizOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bizOtpSent, bizVerified, bizOtpTimer]);

  const handleSendBusinessOtp = async () => {
    if (!selectedBusiness) {
      setBizOtpError("Please select a business first.");
      return;
    }
    if (!selectedBusiness.isEligibleForMemberLink) {
      setBizOtpError(
        selectedBusiness.ineligibleReason ||
          "This business is not eligible to add team members."
      );
      return;
    }

    setBizOtpSending(true);
    setBizOtpError("");
    setBizOtpSuccess("");

    try {
      const res = await businessApi.sendMemberOtp(selectedBusiness._id);
      setBizOtpSent(true);
      setBizOtpTimer(150);
      setBizMaskedEmail(res?.data?.maskedEmail || res?.maskedEmail || selectedBusiness.maskedEmail || "");
      setBizOtpSuccess(res?.message || "A 6-digit verification code has been sent to the business contact email.");
      setTimeout(() => bizOtpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setBizOtpError(err?.message || "Failed to send verification code to the business email.");
    } finally {
      setBizOtpSending(false);
    }
  };

  const handleVerifyBusinessOtp = async () => {
    const otpCode = bizOtpDigits.join("");
    if (otpCode.length !== 6) {
      setBizOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setBizOtpVerifying(true);
    setBizOtpError("");

    try {
      const res = await businessApi.verifyMemberOtp(selectedBusiness._id, otpCode);
      const token = res?.data?.businessLinkToken || res?.businessLinkToken;
      setBusinessLinkToken(token);
      setBizVerified(true);
      setBizOtpSuccess("Business authorization verified successfully! Please enter your personal details below.");
      toast.success("Business authorization verified!");
    } catch (err) {
      setBizOtpError(err?.message || "Invalid verification code. Please check and try again.");
    } finally {
      setBizOtpVerifying(false);
    }
  };

  const handleBizOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...bizOtpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) newDigits[i] = cleaned[i];
      }
      setBizOtpDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      bizOtpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...bizOtpDigits];
    newDigits[index] = cleaned.slice(-1);
    setBizOtpDigits(newDigits);
    if (cleaned && index < 5) {
      bizOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleBizOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !bizOtpDigits[index] && index > 0) {
      bizOtpInputRefs.current[index - 1]?.focus();
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (otpSent && !emailVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, emailVerified, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleEmailChange = (value) => {
    setForm((prev) => ({ ...prev, email: value }));
    if (emailConflictError) setEmailConflictError("");
    if (otpError) setOtpError("");
    if (error) setError("");
    if (emailVerified) {
      setEmailVerified(false);
      setVerifiedToken(null);
      setOtpSent(false);
    }
  };

  const handleEditEmail = () => {
    setEmailVerified(false);
    setVerifiedToken(null);
    setOtpSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpSuccess("");
    setDevOtp("");
    setEmailConflictError("");
  };

  const handleSendOtp = async () => {
    const cleanEmail = form.email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      const msg = "Please enter a valid email address first.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setOtpSending(true);
    setOtpError("");
    setOtpSuccess("");
    setEmailConflictError("");
    setError("");

    try {
      const res = await authApi.sendRegisterOtp(cleanEmail, "customer");
      setOtpSent(true);
      setOtpTimer(150);
      setOtpSuccess(res?.message || `A 6-digit verification code has been sent to ${cleanEmail}`);
      const fallbackOtp = res?.devOtp || res?.otp || res?.data?.otp;
      if (fallbackOtp) setDevOtp(fallbackOtp);
      toast.success(res?.message || `A 6-digit verification code has been sent to ${cleanEmail}`);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const errMsg = err?.message || "Failed to send verification code.";
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("already exists")) {
        setEmailConflictError(errMsg);
      } else {
        setOtpError(errMsg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) newDigits[i] = cleaned[i];
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

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await authApi.verifyRegisterOtp(form.email.toLowerCase().trim(), code, "customer");
      const token = res?.verifiedToken || res?.data?.verifiedToken;
      if (!token) throw new Error("Verification token missing from response.");
      setVerifiedToken(token);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully.");
      toast.success("Email verified successfully.");
    } catch (err) {
      setOtpError(err?.message || "Invalid or expired verification code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Indian States & Cities
  const indianStates = useMemo(() => Object.keys(INDIAN_STATES_AND_CITIES).sort(), []);
  const stateOptions = useMemo(() => {
    const fromApi = (Array.isArray(statesData) ? statesData : (statesData?.states || []))
      .map((s) => (typeof s === "string" ? s : s?.name))
      .filter(Boolean);
    if (fromApi.length > 0) {
      return Array.from(new Set([...fromApi, ...indianStates])).sort();
    }
    return indianStates;
  }, [statesData, indianStates]);

  const indianCities = useMemo(() => {
    if (!form.state || !INDIAN_STATES_AND_CITIES[form.state]) return [];
    const cities = INDIAN_STATES_AND_CITIES[form.state].map((item) =>
      typeof item === "string" ? item : item.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.state]);

  // International Countries (Admin-created active countries only)
  const internationalCountries = useMemo(() => {
    const list = (dbCountries || [])
      .map((c) => c?.name?.trim())
      .filter((n) => Boolean(n) && n.toLowerCase() !== "india");
    return Array.from(new Set(list)).sort();
  }, [dbCountries]);
  const internationalCities = useMemo(() => {
    if (!form.country || !INTERNATIONAL_COUNTRIES_AND_CITIES[form.country]) return [];
    const cities = INTERNATIONAL_COUNTRIES_AND_CITIES[form.country].map((c) =>
      typeof c === "string" ? c : c.city
    );
    return Array.from(new Set(cities)).sort();
  }, [form.country]);

  // Categories & Subcategories
  const categoriesList = useMemo(() => Object.keys(CATEGORIES_DATA).sort(), []);
  const subCategoriesList = useMemo(() => {
    if (!form.category || !CATEGORIES_DATA[form.category]) return [];
    return CATEGORIES_DATA[form.category];
  }, [form.category]);

  // Validation before going to Step 2
  const validateStep1 = () => {
    setError("");
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return false;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!emailVerified) {
      setError("Please verify your email with the 6-digit OTP code before proceeding.");
      return false;
    }
    if (!form.phoneNumber.trim()) {
      setError("Please enter your mobile phone number.");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Validation before going to Step 3
  const validateStep2 = () => {
    setError("");
    if (form.regionType === "national") {
      if (!form.state) {
        setError("Please select your State.");
        return false;
      }
      if (!form.city) {
        setError("Please select your City.");
        return false;
      }
    } else {
      if (!form.country) {
        setError("Please select your Country.");
        return false;
      }
      if (!form.city) {
        setError("Please select your City.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handlePrev = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (registrationPath === "business") {
      if (!selectedBusiness) {
        setError("Please select a registered business first.");
        return;
      }
      if (!selectedBusiness.isEligibleForMemberLink) {
        setError(
          selectedBusiness.ineligibleReason ||
            "This business is not eligible to add team members. An active Chamber Membership and Tier 4 Enterprise subscription are required."
        );
        return;
      }
      if (!bizVerified || !businessLinkToken) {
        setError("Please verify authorization with the 6-digit code sent to the business email.");
        return;
      }
      if (!validateStep1()) return;
      if (!form.agreeTerms) {
        setError("Please accept the terms & conditions to create your account.");
        return;
      }

      setSubmitting(true);
      setError("");

      try {
        const selectedPlanObj = SUBSCRIBER_TIERS.find((t) => t.id === form.selectedTier) || SUBSCRIBER_TIERS[0];
        const fullPhone = `${form.phoneCountryCode}${form.phoneNumber.replace(/\D/g, "")}`;

        await register({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          password: form.password,
          phone: fullPhone,
          country: selectedBusiness.country || (form.regionType === "national" ? "India" : form.country),
          countryCode: form.phoneCountryCode,
          state: selectedBusiness.state || form.state || "Not specified",
          city: selectedBusiness.city || form.city || "Not specified",
          businessName: selectedBusiness.name,
          organization: selectedBusiness.name,
          category: selectedBusiness.category || form.category || "",
          subCategory: selectedBusiness.subCategory || form.subCategory || "",
          subscriberTier: selectedPlanObj.name,
          accountType: "user",
          verifiedToken,
          businessId: selectedBusiness._id,
          businessLinkToken,
        });

        toast.success(`Account created successfully and linked to ${selectedBusiness.name}!`);

        if (
          redirectParam &&
          !redirectParam.startsWith("//") &&
          (redirectParam.startsWith("/user") ||
            redirectParam.startsWith("/business") ||
            redirectParam.startsWith("/discover") ||
            redirectParam.startsWith("/events") ||
            redirectParam.startsWith("/enquiry") ||
            redirectParam.startsWith("/membership"))
        ) {
          router.push(redirectParam);
        } else {
          router.push("/user");
        }
      } catch (err) {
        setError(err?.message || "Failed to create account under business.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Individual Path
    if (!validateStep1() || !validateStep2()) return;
    if (!form.agreeTerms) {
      setError("Please accept the terms & conditions to create your account.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const selectedPlanObj = SUBSCRIBER_TIERS.find((t) => t.id === form.selectedTier) || SUBSCRIBER_TIERS[0];
      const fullPhone = `${form.phoneCountryCode}${form.phoneNumber.replace(/\D/g, "")}`;

      await register({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: fullPhone,
        country: form.regionType === "national" ? "India" : form.country,
        countryCode: form.phoneCountryCode,
        state: form.regionType === "national" ? form.state : (form.country || "International"),
        city: form.city,
        businessName: form.businessName.trim(),
        organization: form.businessName.trim(),
        category: form.category,
        subCategory: form.subCategory,
        membershipId: form.membershipId?.trim() ? form.membershipId.trim().toUpperCase() : undefined,
        subscriberTier: selectedPlanObj.name,
        accountType: "user",
        verifiedToken,
      });

      toast.success("Account created successfully! Welcome to RIFAH User Portal.");

      if (
        redirectParam &&
        !redirectParam.startsWith("//") &&
        (redirectParam.startsWith("/user") ||
          redirectParam.startsWith("/business") ||
          redirectParam.startsWith("/discover") ||
          redirectParam.startsWith("/events") ||
          redirectParam.startsWith("/enquiry") ||
          redirectParam.startsWith("/membership"))
      ) {
        router.push(redirectParam);
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError(err?.message || "Failed to create account. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            {/* Top decorative stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

            <div className="p-6 sm:p-8">
              {/* Dual-Path Registration Selection */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationPath("individual");
                    setError("");
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3",
                    registrationPath === "individual"
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xl mt-0.5 shrink-0",
                      registrationPath === "individual" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">Individual Subscriber</h3>
                      {registrationPath === "individual" && <Check className="h-3.5 w-3.5 text-blue-600 font-bold" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Personal registration with full access to networking, enquiry, LMS, and member tiers.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegistrationPath("business");
                    setError("");
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3",
                    registrationPath === "business"
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xl mt-0.5 shrink-0",
                      registrationPath === "business" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">Under Existing Business</h3>
                      {registrationPath === "business" && <Check className="h-3.5 w-3.5 text-blue-600 font-bold" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Join a registered RIFAH Chamber business with an active Tier 4 Enterprise subscription.
                    </p>
                  </div>
                </button>
              </div>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3">
                    {registrationPath === "individual" ? (
                      <>
                        <UserRound className="h-3.5 w-3.5" />
                        <span>Individual Subscriber Registration</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Register Under Existing Business</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {registrationPath === "individual" ? `Step ${step} of 3` : `Step ${bizVerified ? 2 : 1} of 2`}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {registrationPath === "individual" ? "Create your subscriber account" : "Join business member roster"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {registrationPath === "individual"
                    ? "Access chamber networking, business discovery, enquiries, LMS, and personalized member tiers."
                    : "Authorize with your business contact email and set up your individual member profile."}
                </p>

                {/* Stepper Progress */}
                {registrationPath === "individual" ? (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 1 ? "bg-blue-600" : "bg-slate-200")} />
                    <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 2 ? "bg-blue-600" : "bg-slate-200")} />
                    <div className={cn("h-1.5 rounded-full transition-all duration-300", step >= 3 ? "bg-blue-600" : "bg-slate-200")} />
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className={cn("h-1.5 rounded-full transition-all duration-300", "bg-blue-600")} />
                    <div className={cn("h-1.5 rounded-full transition-all duration-300", bizVerified ? "bg-blue-600" : "bg-slate-200")} />
                  </div>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* INDIVIDUAL REGISTRATION FLOW */}
              {registrationPath === "individual" && (
                <>
                  {/* Step 1: Contact & Security */}
                  {step === 1 && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="user-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="user-name"
                        name="name"
                        autoComplete="name"
                        type="text"
                        placeholder="e.g. Mohd Tariq"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email with Inline OTP Verification */}
                  <div className="space-y-1.5">
                    <Label htmlFor="user-email" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Email Address (with OTP Verification) *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="user-email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={emailVerified}
                        className={cn(
                          "pl-10 pr-28 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20",
                          emailVerified && "bg-emerald-50/50 border-emerald-300 text-emerald-900"
                        )}
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleSendOtp}
                            disabled={otpSending || !form.email || !form.email.includes("@")}
                            className="h-8 px-3 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          >
                            {otpSending ? <Loader2 className="h-3 w-3 animate-spin" /> : otpSent ? "Resend" : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {emailConflictError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>{emailConflictError}</span>
                        </div>
                        <Link href="/login" className="font-bold underline text-blue-600 hover:text-blue-800 ml-2 shrink-0">
                          Sign In
                        </Link>
                      </div>
                    )}

                    {otpError && !otpSent && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    {/* OTP Box */}
                    {otpSent && !emailVerified && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mt-2">
                        {devOtp && (
                          <div className="p-2 rounded-lg bg-blue-100/70 border border-blue-200 text-[11px] text-blue-800 font-medium flex items-center justify-between">
                            <span>Development/Test Code:</span>
                            <span className="font-mono font-bold tracking-widest text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                              {devOtp}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700">Enter 6-digit Verification Code:</p>
                          <span className="text-xs font-mono font-medium text-slate-500">
                            Expires in: {formatTimer(otpTimer)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-10 h-11 text-center text-base font-bold rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          ))}
                        </div>

                        {otpError && <p className="text-xs text-rose-600 font-medium">{otpError}</p>}
                        {otpSuccess && <p className="text-xs text-emerald-600 font-medium">{otpSuccess}</p>}

                        <div className="flex items-center justify-between pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleEditEmail}
                            className="text-xs text-slate-500 hover:text-slate-700 p-0 h-auto"
                          >
                            Change email
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleVerifyOtp}
                            disabled={otpVerifying || otpDigits.join("").length !== 6}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
                          >
                            {otpVerifying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify Code"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone with Country Code Dropdown */}
                  <div>
                    <Label htmlFor="user-phone" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Mobile Phone Number *
                    </Label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 sm:col-span-4 relative">
                        <select
                          id="user-phone-country"
                          name="phone-country-code"
                          value={form.phoneCountryCode}
                          onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                          className="w-full h-11 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                              {c.flag} {c.dialCode} ({c.name})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="col-span-7 sm:col-span-8 relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user-phone"
                          name="tel"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="tel"
                          placeholder="e.g. 9876543210"
                          value={form.phoneNumber}
                          onChange={(e) => {
                            // Only allow numeric digits — prevents email addresses, symbols or browser autofill mismatch
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
                            handleChange("phoneNumber", digits);
                          }}
                          className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user-pass"
                          name="new-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Min. 6 chars"
                          value={form.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="user-confirm-pass" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user-confirm-pass"
                          name="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="pt-3">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue to Business & Location</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Business Details */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <Label htmlFor="business-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Business / Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="e.g. Apex Engineering Solutions"
                        value={form.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Chamber Membership ID (If joining under existing Tier 4 Enterprise Membership) */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="membership-id" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Chamber Membership ID</span>
                        <span className="text-slate-400 font-normal">(Optional)</span>
                      </Label>
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                        Tier IV Roster
                      </span>
                    </div>
                    <Input
                      id="membership-id"
                      type="text"
                      placeholder="e.g. RIF-MEM-2025-XXXX or Company Membership ID"
                      value={form.membershipId}
                      onChange={(e) => handleChange("membershipId", e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs sm:text-sm uppercase tracking-wide bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      If registering as an additional member under a single company membership, provide the membership ID. <strong>All registered members must purchase an individual subscription.</strong>
                    </p>
                  </div>

                  {/* National vs International Toggle */}
                  {/* ==========================================
                      [COUNTRY_MODULE_DISABLED] Region Selection
                  <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
                    <Label className="text-xs font-semibold text-slate-700 mb-2 block">
                      Region / Geographical Presence *
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            regionType: "national",
                            country: "India",
                            state: "",
                            city: "",
                          }));
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                          form.regionType === "national"
                            ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                            : "bg-transparent border-slate-200 text-slate-600 hover:bg-white/60"
                        )}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>National (India)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            regionType: "international",
                            country: "United Arab Emirates",
                            state: "",
                            city: "",
                          }));
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                          form.regionType === "international"
                            ? "bg-white border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                            : "bg-transparent border-slate-200 text-slate-600 hover:bg-white/60"
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        <span>International (Global)</span>
                      </button>
                    </div>
                  </div>
                  ========================================== */}

                  {/* Cascading State/Country & City Selection */}
                  {form.regionType === "national" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Indian State */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          State *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.state}
                            onChange={(e) => {
                              const st = e.target.value;
                              setForm((prev) => ({ ...prev, state: st, city: "" }));
                            }}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">Select State</option>
                            {indianStates.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Indian City */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          City *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            disabled={!form.state}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">{form.state ? "Select City" : "Choose state first"}</option>
                            {indianCities.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* International Country */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          Country *
                        </Label>
                        <div className="relative">
                          <select
                            value={form.country}
                            onChange={(e) => {
                              const cty = e.target.value;
                              setForm((prev) => ({ ...prev, country: cty, city: "" }));
                            }}
                            className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">Select Country</option>
                            {internationalCountries.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* International State / City */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          State / City *
                        </Label>
                        {internationalCities.length > 0 ? (
                          <div className="relative">
                            <select
                              value={form.city}
                              onChange={(e) => handleChange("city", e.target.value)}
                              disabled={!form.country}
                              className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                            >
                              <option value="">{form.country ? "Select State / City" : "Choose country first"}</option>
                              {internationalCities.map((ct) => (
                                <option key={ct} value={ct}>
                                  {ct}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                        ) : (
                          <Input
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            disabled={!form.country}
                            placeholder={form.country ? `Enter State / City in ${form.country}` : "Choose country first"}
                            className="h-11 rounded-xl border-slate-200 text-xs sm:text-sm"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Industry Category */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Industry Category
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setForm((prev) => ({ ...prev, category: cat, subCategory: "" }));
                        }}
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                      >
                        <option value="">Select Primary Industry</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Cascading Sub-Category */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Sub-Category / Specialization
                    </Label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        value={form.subCategory}
                        onChange={(e) => handleChange("subCategory", e.target.value)}
                        disabled={!form.category}
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">
                          {form.category ? "Select Specialized Sub-category" : "Select Category first"}
                        </option>
                        {subCategoriesList.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      className="h-12 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Choose Member Plan</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Member Tier Selection (Option 1 Hybrid) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-base font-bold text-slate-900">Select Your Membership Tier</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You can start with the Free plan now and upgrade anytime inside your dashboard.
                    </p>
                  </div>

                  {/* Tier Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {SUBSCRIBER_TIERS.map((tier) => {
                      const isSelected = form.selectedTier === tier.id;
                      const isFree = tier.costingInr === 0;

                      return (
                        <div
                          key={tier.id}
                          onClick={() => handleChange("selectedTier", tier.id)}
                          className={cn(
                            "relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between",
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 shadow-sm"
                              : "border-slate-200/90 hover:border-slate-300 bg-white"
                          )}
                        >
                          {/* Popular or Free Badge */}
                          {tier.isPopular && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase">
                              Popular
                            </span>
                          )}
                          {isFree && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase">
                              Zero Cost
                            </span>
                          )}
                          {tier.id === "tier_4" && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold tracking-wider uppercase">
                              Multi-Member Enterprise
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-bold text-sm text-slate-900">{tier.name}</h3>
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border flex items-center justify-center",
                                  isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                                )}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 my-2">
                              <span className="text-2xl font-black text-slate-950">
                                ₹{tier.costingInr}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">/ month</span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                              {tier.summary}
                            </p>

                            <ul className="space-y-1.5 text-[11px] text-slate-700">
                              {tier.bulletPoints?.slice(0, 3).map((bp, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>

                            {tier.id === "tier_4" && (
                              <div className="mt-2.5 rounded-lg border border-purple-200 bg-purple-50/80 p-2 text-[10.5px] text-purple-900 leading-snug">
                                <span className="font-semibold text-purple-950">Multi-Member Policy:</span> Multiple member registrations under single membership. All members have to purchase subscriptions.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tier IV Advisory Callout */}
                  {form.selectedTier === "tier_4" && (
                    <div className="rounded-2xl border border-purple-200/90 bg-purple-50/70 p-3.5 text-xs text-purple-900 flex items-start gap-2.5 animate-in fade-in-50">
                      <Sparkles className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
                      <div>
                        <strong className="font-bold text-purple-950">Tier IV Enterprise Subscription Terms:</strong> Multiple members can register under your single chamber membership. Note that every member on the roster must purchase an active subscription (₹200/mo) to unlock member privileges.
                      </div>
                    </div>
                  )}

                  {/* Terms checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600">
                        I agree to RIFAH Chamber's{" "}
                        <Link href="/terms" className="text-blue-600 underline font-semibold">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 underline font-semibold">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Final Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      className="h-12 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {form.selectedTier === "tier_1"
                              ? "Create Free Account & Go to Dashboard"
                              : "Continue with Selected Tier"}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BUSINESS REGISTRATION FLOW */}
          {registrationPath === "business" && (
            <div className="space-y-5">
              {/* Step A: Select & Authorize Business */}
              {!bizVerified ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-900">
                        <span className="font-bold block text-sm text-blue-950 mb-0.5">
                          Join an Existing Chamber Business Roster
                        </span>
                        Under RIFAH policy, multi-member team registration is permitted for businesses holding an active Chamber Membership (Silver, Gold, Platinum, Diamond) and an active Tier 4 Enterprise subscription.
                      </div>
                    </div>
                  </div>

                  {/* State, Chapter and Search Filters */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* State Filter */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          Filter by State
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <select
                            value={selectedState}
                            onChange={(e) => {
                              setSelectedState(e.target.value);
                              setSelectedChapter("");
                              setSelectedBusiness(null);
                              setBizOtpSent(false);
                            }}
                            className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">All States</option>
                            {stateOptions.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Chapter Filter */}
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                          Filter by Chapter
                        </Label>
                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <select
                            value={selectedChapter}
                            onChange={(e) => {
                              setSelectedChapter(e.target.value);
                              setSelectedBusiness(null);
                              setBizOtpSent(false);
                            }}
                            className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">All Chapters</option>
                            {filteredChapters.map((ch) => {
                              const cName = typeof ch === "string" ? ch : ch.name;
                              return (
                                <option key={ch._id || cName} value={cName}>
                                  {cName}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Business Search Box */}
                    <div>
                      <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Search Business by Name
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Search registered business name..."
                          value={businessSearchQuery}
                          onChange={(e) => {
                            setBusinessSearchQuery(e.target.value);
                            setSelectedBusiness(null);
                            setBizOtpSent(false);
                          }}
                          className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Results List */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Select Your Business ({displayedBusinesses.length} found)
                    </Label>

                    {loadingBusinesses ? (
                      <div className="p-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs">Finding eligible businesses...</span>
                      </div>
                    ) : displayedBusinesses.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-slate-500 text-xs space-y-1">
                        <p className="font-semibold text-slate-700">No eligible businesses found matching your criteria.</p>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                          Only businesses with an active Chamber Membership (Silver, Gold, Platinum, Diamond) and Tier IV (Enterprise) subscription can register team members. Try adjusting your state, chapter, or search term.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                        {displayedBusinesses.map((biz) => {
                          const isSelected = selectedBusiness?._id === biz._id;

                          return (
                            <div
                              key={biz._id}
                              onClick={() => {
                                setSelectedBusiness(biz);
                                setBizOtpSent(false);
                                setBizOtpError("");
                                setBizOtpSuccess("");
                                setBizMaskedEmail(biz.maskedEmail || "");
                              }}
                              className={cn(
                                "p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                isSelected
                                  ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20"
                                  : "border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/60 bg-white"
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900">{biz.name}</span>
                                  {biz.membership && (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                                      {biz.membership}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                                    Tier IV (Enterprise)
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                                    {biz.chapter || biz.city || biz.state}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                  Category: {biz.category || "General"} • Contact Email: {biz.maskedEmail || "Protected"}
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all",
                                    isSelected
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  )}
                                >
                                  {isSelected ? "Selected ✓" : "Select Business"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Business Verification Box */}
                  {selectedBusiness && (
                    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-4 space-y-3 animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-600" />
                          <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                            Step 1 Authorization Verification
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBusiness(null);
                            setBizOtpSent(false);
                            setBizOtpError("");
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Choose Different Business
                        </button>
                      </div>

                      <p className="text-xs text-indigo-900 leading-relaxed">
                        Selected Business: <strong className="font-bold text-slate-900">{selectedBusiness.name}</strong>.
                        To ensure security, an authorization verification code will be sent to the business contact email (
                        <span className="font-mono font-bold text-indigo-950">{bizMaskedEmail || selectedBusiness.maskedEmail}</span>
                        ).
                      </p>

                      {bizOtpError && (
                        <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>{bizOtpError}</span>
                        </div>
                      )}

                      {bizOtpSuccess && (
                        <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{bizOtpSuccess}</span>
                        </div>
                      )}

                      {!bizOtpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendBusinessOtp}
                          disabled={bizOtpSending || !selectedBusiness.isEligibleForMemberLink}
                          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                        >
                          {bizOtpSending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Sending Code to Business Contact...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4" />
                              <span>Send Verification Code to Business Email</span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <Label className="text-xs font-semibold text-slate-700">
                                Enter 6-Digit Verification Code
                              </Label>
                              <span className="text-[11px] font-mono text-slate-500">
                                {bizOtpTimer > 0 ? `Expires in ${formatTimer(bizOtpTimer)}` : "Expired"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 justify-between max-w-xs mx-auto">
                              {bizOtpDigits.map((digit, idx) => (
                                <Input
                                  key={idx}
                                  ref={(el) => (bizOtpInputRefs.current[idx] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleBizOtpDigitChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleBizOtpKeyDown(idx, e)}
                                  className="w-10 h-12 text-center text-lg font-bold rounded-xl border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSendBusinessOtp}
                              disabled={bizOtpSending || bizOtpTimer > 0}
                              className="h-11 px-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-700"
                            >
                              {bizOtpSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Resend Code"}
                            </Button>
                            <Button
                              type="button"
                              onClick={handleVerifyBusinessOtp}
                              disabled={bizOtpVerifying || bizOtpDigits.join("").length !== 6}
                              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                            >
                              {bizOtpVerifying ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Verifying Authorization...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Verify & Continue to Profile</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Step B: Authorized - Member Details & Subscription Choice */
                <div className="space-y-4">
                  {/* Verified Business Banner */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          Authorized under {selectedBusiness?.name}
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          {selectedBusiness?.chapter || selectedBusiness?.state} • Tier IV Enterprise Business
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBizVerified(false);
                        setBusinessLinkToken(null);
                        setBizOtpSent(false);
                      }}
                      className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Change
                    </button>
                  </div>

                  {/* Member Full Name */}
                  <div>
                    <Label htmlFor="biz-user-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Your Full Name *
                    </Label>
                    <div className="relative">
                      <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="biz-user-name"
                        name="name"
                        type="text"
                        placeholder="e.g. Mohd Tariq"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Member Email Address with Inline OTP */}
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-user-email" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Your Email Address (Personal Account Verification) *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="biz-user-email"
                        name="email"
                        type="email"
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={emailVerified}
                        className={cn(
                          "pl-10 pr-28 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500/20",
                          emailVerified && "bg-emerald-50/50 border-emerald-300 text-emerald-900"
                        )}
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleSendOtp}
                            disabled={otpSending || !form.email || !form.email.includes("@")}
                            className="h-8 px-3 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          >
                            {otpSending ? <Loader2 className="h-3 w-3 animate-spin" /> : otpSent ? "Resend" : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {emailConflictError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between mt-2 animate-in fade-in-50">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>{emailConflictError}</span>
                        </div>
                        <Link href="/login" className="font-bold underline text-blue-600 hover:text-blue-800 ml-2 shrink-0">
                          Sign In
                        </Link>
                      </div>
                    )}

                    {otpError && !otpSent && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 mt-2 animate-in fade-in-50">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    {/* Inline Email OTP Entry */}
                    {otpSent && !emailVerified && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2 animate-in fade-in-50">
                        {devOtp && (
                          <div className="p-2 rounded-lg bg-blue-100/70 border border-blue-200 text-[11px] text-blue-800 font-medium flex items-center justify-between">
                            <span>Development/Test Code:</span>
                            <span className="font-mono font-bold tracking-widest text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                              {devOtp}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Enter personal 6-digit verification code:</span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {otpTimer > 0 ? `Expires in ${formatTimer(otpTimer)}` : "Expired"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 justify-between max-w-xs mx-auto">
                          {otpDigits.map((digit, idx) => (
                            <Input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-10 h-11 text-center text-lg font-bold rounded-xl border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleEditEmail}
                            className="h-8 text-xs rounded-lg"
                          >
                            Change Email
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleVerifyOtp}
                            disabled={otpVerifying || otpDigits.join("").length !== 6}
                            className="h-8 px-4 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {otpVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify Code"}
                          </Button>
                        </div>
                        {otpError && <p className="text-xs text-rose-600 mt-1">{otpError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Member Phone Number */}
                  <div>
                    <Label htmlFor="biz-user-phone" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Phone Number *
                    </Label>
                    <div className="flex gap-2">
                      <div className="w-24 shrink-0">
                        <Input
                          type="text"
                          value={form.phoneCountryCode}
                          onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                          className="h-11 rounded-xl border-slate-200 text-sm text-center font-semibold"
                          placeholder="+91"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="biz-user-phone"
                          name="phoneNumber"
                          autoComplete="tel"
                          type="tel"
                          placeholder="Mobile number"
                          value={form.phoneNumber}
                          onChange={(e) => handleChange("phoneNumber", e.target.value)}
                          className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="biz-pwd" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="biz-pwd"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="biz-pwd-confirm" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="biz-pwd-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Member Subscription Tier Selection */}
                  <div className="pt-2">
                    <div className="mb-2">
                      <Label className="text-xs font-bold text-slate-900 block">
                        Select Your Member Subscription Tier
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Multiple member registrations are linked under the business membership. All team members maintain an individual subscription (Free Tier 1 included).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUBSCRIBER_TIERS.map((tier) => {
                        const isSelected = form.selectedTier === tier.id;
                        const isFree = tier.costingInr === 0;

                        return (
                          <div
                            key={tier.id}
                            onClick={() => handleChange("selectedTier", tier.id)}
                            className={cn(
                              "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between",
                              isSelected
                                ? "border-blue-600 bg-blue-50/40 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-slate-900">{tier.name}</span>
                                <div
                                  className={cn(
                                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                                    isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                                  )}
                                >
                                  {isSelected && <Check className="h-2 w-2 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-base font-black text-slate-950">
                                  ₹{tier.costingInr}
                                </span>
                                <span className="text-[10px] text-slate-500">/ month</span>
                                {isFree && (
                                  <span className="ml-auto px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                    Free
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-slate-500 line-clamp-2">
                                {tier.summary}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600">
                        I agree to RIFAH Chamber's{" "}
                        <Link href="/terms" className="text-blue-600 underline font-semibold">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 underline font-semibold">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account & Linking Roster...</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          <span>Complete Registration & Join Business</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </p>
                <Link
                  href="/register-business"
                  className="font-semibold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Register Chamber Business instead</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
