"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Send,
  ExternalLink,
  Award,
  Building2,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Package,
  Phone,
  Share2,
  Star,
  Users,
  Wrench,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

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
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/providers/auth-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";

import { MembershipBadge, Pill, VerificationBadge } from "@shared/components/rifah/badges";
import { BusinessCard } from "@shared/components/rifah/business-card";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel, SectionHeader } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { SkeletonCard } from "@shared/components/rifah/empty-state";
import { businessGallery, businessImage } from "@shared/lib/media";
import { resolveMediaUrl } from "@shared/lib/api-client";
import {
  useBusinessDetail,
  useBusinessCatalogue,
  useBusinessReviews,
  useBusinesses,
} from "@shared/hooks/use-rifah-api";
import { reviewApi, userApi, enquiryApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

function formatSocialUrl(type, rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  switch (type) {
    case "instagram": {
      const handle = trimmed
        .replace(/^@/, "")
        .replace(/^https?:\/\//i, "")
        .replace(/^(www\.)?instagram\.com\/?/i, "")
        .trim();
      return `https://www.instagram.com/${handle}`;
    }
    case "linkedin": {
      const handle = trimmed
        .replace(/^@/, "")
        .replace(/^https?:\/\//i, "")
        .replace(/^(www\.)?linkedin\.com\/?/i, "")
        .trim();
      if (handle.startsWith("in/") || handle.startsWith("company/")) {
        return `https://www.linkedin.com/${handle}`;
      }
      return `https://www.linkedin.com/in/${handle}`;
    }
    case "website":
    default: {
      if (trimmed.startsWith("//")) return `https:${trimmed}`;
      return `https://${trimmed}`;
    }
  }
}

function BusinessNotFound() {
  return (
    <PublicLayout>
      <div className="rifah-container py-16 text-center">
        <h1 className="text-2xl font-bold">Business unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This business profile may have been suspended or is awaiting RIFAH verification.
        </p>
        <Button asChild className="mt-6">
          <Link href="/discover">Back to directory</Link>
        </Button>
      </div>
    </PublicLayout>
  );
}

function BusinessProfile() {
  const params = useParams();
  const businessId = params?.businessId;

  const { data: business, isLoading } = useBusinessDetail(businessId);
  const { data: catalogueItems } = useBusinessCatalogue(business?._id);
  const { data: reviewsData } = useBusinessReviews(business?._id);
  const industryOrCat = business?.industry || (Array.isArray(business?.categories) ? business.categories[0] : business?.category) || "";
  const { data: relatedData } = useBusinesses({
    industry: industryOrCat || undefined,
    limit: 8,
  });
  const { data: allDirectoryData } = useBusinesses({
    limit: 8,
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ownerId = business?.owner?._id || business?.owner;
  const isMyOwnBusiness = Boolean(user?._id && ownerId && String(user._id) === String(ownerId));

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewRatingHover, setReviewRatingHover] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Tab and Catalogue detail modal state
  const [activeTab, setActiveTab] = useState("about");
  const [selectedCatalogueItem, setSelectedCatalogueItem] = useState(null);
  const [activeCatalogueImageIndex, setActiveCatalogueImageIndex] = useState(0);
  const [catalogueLinkCopied, setCatalogueLinkCopied] = useState(false);

  // Enquiry modal state
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquiryForm, setEnquiryForm] = useState({
    guestName: user?.name || "",
    guestEmail: user?.email || "",
    guestPhone: user?.phone || "",
    title: "",
    description: "",
    quantity: "",
    location: "",
  });

  useEffect(() => {
    if (user) {
      setEnquiryForm((prev) => ({
        ...prev,
        guestName: prev.guestName || user.name || "",
        guestEmail: prev.guestEmail || user.email || "",
        guestPhone: prev.guestPhone || user.phone || "",
      }));
    }
  }, [user]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError("");
    setEnquirySubmitting(true);
    try {
      await enquiryApi.create({
        targetType: "business",
        targetBusiness: business._id,
        title: enquiryForm.title,
        category: business.industry || business.categories?.[0] || "General",
        quantity: enquiryForm.quantity || "As discussed",
        location: enquiryForm.location || business.city || "Not specified",
        requiredBy: "Flexible",
        description: enquiryForm.description,
        guestName: enquiryForm.guestName,
        guestEmail: enquiryForm.guestEmail,
        guestPhone: enquiryForm.guestPhone,
      });
      setEnquirySuccess(true);
      setEnquiryForm({
        guestName: user?.name || "",
        guestEmail: user?.email || "",
        guestPhone: user?.phone || "",
        title: "",
        description: "",
        quantity: "",
        location: "",
      });
    } catch (err) {
      setEnquiryError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleEnquiryClose = (open) => {
    setEnquiryOpen(open);
    if (!open) {
      // Reset on close
      setTimeout(() => {
        setEnquirySuccess(false);
        setEnquiryError("");
      }, 300);
    }
  };

  // Open catalogue item from URL query parameter (e.g. ?item=slug) or hash without full page reload
  useEffect(() => {
    if (typeof window === "undefined" || !catalogueItems?.length) return;
    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get("item") || (window.location.hash ? window.location.hash.replace("#", "") : null);
    if (itemParam) {
      const match = catalogueItems.find(
        (i) => String(i.slug || "").toLowerCase() === itemParam.toLowerCase() || String(i._id) === itemParam
      );
      if (match) {
        setSelectedCatalogueItem(match);
        setActiveCatalogueImageIndex(0);
        setActiveTab("catalogue");
      }
    }
  }, [catalogueItems]);

  const handleOpenCatalogueItem = (item) => {
    setSelectedCatalogueItem(item);
    setActiveCatalogueImageIndex(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("item", item.slug || item._id);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleCloseCatalogueItem = () => {
    setSelectedCatalogueItem(null);
    setActiveCatalogueImageIndex(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("item");
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleCopyCatalogueItemLink = async (item) => {
    if (typeof window === "undefined" || !item) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("item", item.slug || item._id);
      await navigator.clipboard.writeText(url.toString());
      setCatalogueLinkCopied(true);
      toast.success("Direct link to this item copied!");
      setTimeout(() => setCatalogueLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Lock body scroll and listen for Escape key when catalogue item full-screen page is open
  useEffect(() => {
    if (!selectedCatalogueItem) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseCatalogueItem();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCatalogueItem]);

  const handleEnquireFromCatalogue = (item) => {
    setEnquiryForm((prev) => ({
      ...prev,
      title: `Enquiry: ${item.name}`,
      quantity: item.moq || prev.quantity || "",
      description: `Hi, I am interested in "${item.name}" (${item.type || "Product"}). Please provide more details on pricing, availability, and ordering requirements.`,
    }));
    handleCloseCatalogueItem();
    setEnquiryOpen(true);
  };

  useEffect(() => {
    setCoverError(false);
    setLogoError(false);
  }, [businessId, business?._id]);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyLink = async () => {
    try {
      const url = getShareUrl();
      if (!url) return;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${business?.name || "Business"} | RIFAH Chamber of Commerce`,
          text: `Check out ${business?.name || "this business"} on RIFAH Chamber of Commerce:`,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="rifah-container py-12">
          <SkeletonCard />
        </div>
      </PublicLayout>
    );
  }

  if (!business) return <BusinessNotFound />;

  const catalogue = catalogueItems || [];
  const products = catalogue.filter((i) => i.type === "Product");
  const services = catalogue.filter((i) => i.type === "Service");

  const rawReviews = reviewsData?.reviews || reviewsData?.data?.reviews || reviewsData?.data || reviewsData || [];
  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const totalReviews = reviews.length;
  const hasReviews = totalReviews > 0;

  const avgRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1)
    : (Number(business.rating) > 0 ? Number(business.rating).toFixed(1) : "0.0");

  const effectiveTotalReviews = hasReviews ? totalReviews : (Number(business?.reviewsCount) || 0);
  const hasAnyRating = hasReviews || (Number(business?.rating) > 0 && effectiveTotalReviews > 0);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(Number(r.rating) || 0) === stars).length;
    const pct = hasReviews
      ? Math.round((count / totalReviews) * 100)
      : (hasAnyRating && Math.round(Number(avgRating)) === stars ? 100 : 0);
    return { stars, pct, count };
  });

  const currentBizId = String(business?._id || business?.id || "");
  const currentBizSlug = business?.slug ? String(business.slug).toLowerCase() : "";

  const extractBusinesses = (input) => {
    if (Array.isArray(input)) return input;
    if (Array.isArray(input?.businesses)) return input.businesses;
    if (Array.isArray(input?.data)) return input.data;
    if (Array.isArray(input?.data?.businesses)) return input.data.businesses;
    return [];
  };

  const filterSelf = (list) =>
    list.filter((b) => {
      const bId = String(b?._id || b?.id || "");
      const bSlug = b?.slug ? String(b.slug).toLowerCase() : "";
      if (currentBizId && bId === currentBizId) return false;
      if (currentBizSlug && bSlug === currentBizSlug) return false;
      return true;
    });

  const categoryRelated = filterSelf(extractBusinesses(relatedData));
  const generalRelated = filterSelf(extractBusinesses(allDirectoryData));

  const mergedRelated = [...categoryRelated];
  generalRelated.forEach((b) => {
    const bId = String(b?._id || b?.slug || b?.id);
    if (!mergedRelated.some((m) => String(m?._id || m?.slug || m?.id) === bId)) {
      mergedRelated.push(b);
    }
  });

  const related = mergedRelated.slice(0, 3);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBody.trim() || reviewRating < 1) {
      alert("Please select a star rating.");
      return;
    }
    const authorName = user?.name || reviewerName.trim() || "Guest Reviewer";
    setReviewSubmitting(true);
    try {
      const res = await reviewApi.submit({
        businessId: business._id,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
        authorName,
      });

      const submittedReview = res?.data || res;
      const stats = submittedReview?.stats;

      if (submittedReview && business?._id) {
        queryClient.setQueryData(["reviews", business._id], (old) => {
          const list = Array.isArray(old) ? old : (old?.data || old?.reviews || []);
          const cleanReview = {
            _id: submittedReview._id || submittedReview.id || `review-${Date.now()}`,
            rating: Number(submittedReview.rating) || reviewRating,
            title: reviewTitle,
            body: reviewBody,
            authorName: submittedReview.authorName || authorName,
            authorRole: submittedReview.authorRole || "Verified Member",
            createdAt: submittedReview.createdAt || new Date().toISOString(),
          };
          const filtered = list.filter((r) => String(r._id || r.id) !== String(cleanReview._id));
          return [cleanReview, ...filtered];
        });
      }

      if (stats && businessId) {
        const updateBizCache = (oldBiz) => {
          if (!oldBiz) return oldBiz;
          return {
            ...oldBiz,
            rating: stats.rating ?? oldBiz.rating,
            reviewsCount: stats.reviewsCount ?? oldBiz.reviewsCount,
          };
        };
        queryClient.setQueryData(["business", businessId], updateBizCache);
        if (business?.slug) queryClient.setQueryData(["business", business.slug], updateBizCache);
      }

      setReviewSuccess(true);
      setReviewBody("");
      setReviewTitle("");
      setReviewerName("");
      setReviewRating(0);
      setReviewRatingHover(0);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["reviews"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["business"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["businesses"], type: "all" }),
      ]);

      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      alert(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isValidImage = (url) => typeof url === "string" && url.trim().length > 0 && !url.includes("undefined") && !url.includes("null");

  const hasCover = isValidImage(business?.coverImage) && !coverError;
  const hasLogo = isValidImage(business?.logo) && !logoError;
  const coverUrl = hasCover ? resolveMediaUrl(business.coverImage) : null;
  const logoUrl = hasLogo ? resolveMediaUrl(business.logo) : null;
  const initial = (business?.name || "B").charAt(0).toUpperCase();

  const subCategory = business?.subCategory || business?.categories?.[1] || "";

  return (
    <PublicLayout>
      {/* Cover + identity Banner */}
      <div className="h-44 sm:h-56 lg:h-64 overflow-hidden relative bg-gradient-to-r from-slate-950 via-[#004B7A] to-[#0088D1]">
        {hasCover && coverUrl ? (
          <img
            src={coverUrl}
            alt={`${business.name} cover banner`}
            width={1024}
            height={640}
            onError={() => setCoverError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-end px-8 sm:px-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <Building2 className="h-40 w-40 text-white/10 -mr-6 -mb-6 transform -rotate-12" />
          </div>
        )}
      </div>

      <div className="rifah-container relative -mt-16 sm:-mt-20 z-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {/* Main Business Profile Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl shadow-slate-900/5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  {/* Logo or Initial Monogram */}
                  <div className="relative -mt-12 sm:-mt-16 shrink-0">
                    {hasLogo && logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${business.name} logo`}
                        loading="lazy"
                        width={1024}
                        height={640}
                        onError={() => setLogoError(true)}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl sm:rounded-3xl border-4 border-white dark:border-slate-900 object-cover bg-white shadow-xl"
                      />
                    ) : (
                      <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl sm:rounded-3xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-white font-black text-3xl sm:text-4xl shadow-xl select-none">
                        {initial}
                      </div>
                    )}
                  </div>

                  {/* Business Name, Tagline & Badges */}
                  <div className="min-w-0 pt-1 sm:pt-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {business.name}
                    </h1>
                    {business.tagline && (
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                        {business.tagline}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <VerificationBadge status={business.verification} />
                      <MembershipBadge tier={business.membership} />
                      {business.industry && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {business.industry}
                        </span>
                      )}
                      {subCategory && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {subCategory}
                        </span>
                      )}
                      {business.chapter && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {business.chapter}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile actions (Share + Enquiry + Social Quick Links) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    onClick={() => setEnquiryOpen(true)}
                    aria-label="Send enquiry to this business"
                    title="Send enquiry to this business"
                    className="rounded-xl h-9 px-3.5 font-semibold gap-1.5 shadow-2xs"
                  >
                    <MessageSquarePlus className="h-4 w-4" /> Send Enquiry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareOpen(true)}
                    aria-label="Share business profile"
                    title="Share business profile"
                    className="rounded-xl h-9 px-3.5 font-semibold gap-1.5 shadow-2xs"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  {business.instagram && (
                    <a
                      href={formatSocialUrl("instagram", business.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow on Instagram"
                      aria-label="Follow on Instagram"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:bg-pink-50 dark:hover:bg-pink-950/30 text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 transition-colors shadow-2xs"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {business.linkedin && (
                    <a
                      href={formatSocialUrl("linkedin", business.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Connect on LinkedIn"
                      aria-label="Connect on LinkedIn"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors shadow-2xs"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={formatSocialUrl("website", business.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit Official Website"
                      aria-label="Visit Official Website"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:bg-primary/10 text-slate-700 dark:text-slate-300 hover:text-primary hover:border-primary/30 transition-colors shadow-2xs"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Key Highlights Grid */}
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Building2, label: "Industry", value: business.industry || "General" },
                  ...(subCategory
                    ? [{ icon: Package, label: "Sub Category", value: subCategory }]
                    : [{ icon: Users, label: "Team size", value: business.employees || "10–50" }]),
                  { icon: MapPin, label: "Location", value: `${business.city || ""}${business.state ? `, ${business.state}` : ""}`.trim() || "Not specified" },
                  { icon: Star, label: "Rating", value: hasAnyRating ? `${avgRating} (${effectiveTotalReviews})` : "No ratings yet" },
                ].map((s) => (
                  <div key={s.label} className="min-w-0 bg-slate-50 dark:bg-slate-800/40 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <dt className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <s.icon className="h-3.5 w-3.5 text-primary" /> {s.label}
                    </dt>
                    <dd className="mt-1 truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Profile sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="catalogue">Catalogue ({catalogue.length})</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="info">Business info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({effectiveTotalReviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                <Panel title="About the business">
                  <p className="text-sm leading-relaxed text-muted-foreground">{business.about}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.categories?.map((c, idx) => (
                      <Pill key={`${c}-${idx}`} tone="primary">
                        {c}
                      </Pill>
                    ))}
                  </div>
                </Panel>
                {business.certifications?.length > 0 && (
                  <Panel title="Certifications">
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {business.certifications.map((c, idx) => (
                        <li key={`${c}-${idx}`} className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
                          <Award className="h-4 w-4 shrink-0 text-primary" /> {c}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                )}
              </TabsContent>

              <TabsContent value="catalogue" className="mt-4">
                <Panel title="Catalogue" description={`${catalogue.length} published ${catalogue.length === 1 ? "item" : "items"}`}>
                  {catalogue.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <p>This business has not published any catalogue items yet.</p>
                    </div>
                  ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {catalogue.map((item, idx) => (
                        <li
                          key={item._id || item.slug || `item-${idx}`}
                          onClick={() => handleOpenCatalogueItem(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpenCatalogueItem(item);
                            }
                          }}
                          className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-border p-4 bg-card/60 overflow-hidden hover:border-primary/60 hover:shadow-md hover:bg-card transition-all duration-200"
                        >
                          <div>
                            {item.images && item.images.length > 0 ? (
                              <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-muted border border-border">
                                <img
                                  src={resolveMediaUrl(item.images[0])}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {item.images.length > 1 && (
                                  <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
                                    +{item.images.length - 1} photos
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="relative mb-3 h-24 w-full overflow-hidden rounded-xl bg-muted/60 flex items-center justify-center border border-border group-hover:bg-muted transition-colors">
                                {item.type === "Service" ? (
                                  <Wrench className="h-6 w-6 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                )}
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{item.name}</p>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${item.type === "Service"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                    : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                                  }`}
                              >
                                {item.type || "Product"}
                              </span>
                            </div>

                            {item.category && (
                              <p className="mt-1 text-[11px] font-medium text-primary">
                                {item.category}
                              </p>
                            )}

                            {item.description && (
                              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                                Price
                              </span>
                              <span className="font-bold text-foreground">
                                {item.price ? (item.price.startsWith("₹") ? item.price : `₹ ${item.price}`) : "On Request"}
                              </span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              {item.moq && (
                                <>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                                    MOQ
                                  </span>
                                  <span className="font-semibold text-muted-foreground">
                                    {item.moq}
                                  </span>
                                </>
                              )}
                              <span className="mt-1 text-[11px] font-semibold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                View details →
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                <Panel title="Gallery" description="Facility and product imagery">
                  {business.gallery && business.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {business.gallery.map((g, i) => (
                        <img
                          key={`${g}-${i}`}
                          src={resolveMediaUrl(g)}
                          alt={`${business.name} gallery image ${i + 1}`}
                          loading="lazy"
                          width={1024}
                          height={640}
                          className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      <p>No gallery images uploaded yet.</p>
                    </div>
                  )}
                </Panel>
              </TabsContent>

              <TabsContent value="info" className="mt-4 space-y-4">
                <Panel title="Business information">
                  <dl>
                    <FieldRow label="Business type" value={business.businessType} />
                    <FieldRow label="Established" value={business.founded} />
                    <FieldRow label="Industry" value={business.industry} />
                    <FieldRow label="RIFAH chapter" value={business.chapter} />
                    <FieldRow label="Membership" value={<MembershipBadge tier={business.membership} />} />
                    <FieldRow label="Verification" value={<VerificationBadge status={business.verification} />} />
                    <FieldRow
                      label="Business hours"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" /> {business.hours}
                        </span>
                      }
                    />
                  </dl>
                </Panel>
                <Panel title="Location & contact">
                  <dl className="mt-2">
                    {(business.contactPerson || business.owner?.name) && (
                      <FieldRow
                        label="Representative"
                        value={
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {business.contactPerson || business.owner?.name}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                              {business.roleInBusiness || business.owner?.roleInBusiness || business.owner?.designation || business.designation || "Founder / Owner"}
                            </span>
                          </div>
                        }
                      />
                    )}
                    <FieldRow label="Address" value={`${business.address || ""}, ${business.city}, ${business.state}`} />
                    {business.instagram && (
                      <FieldRow
                        label="Instagram"
                        value={
                          <a
                            href={formatSocialUrl("instagram", business.instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-pink-600 dark:text-pink-400 hover:underline font-medium"
                          >
                            <Instagram className="h-4 w-4 text-pink-500" /> {business.instagram.startsWith("http") ? "Instagram Profile" : business.instagram}
                          </a>
                        }
                      />
                    )}
                    {business.linkedin && (
                      <FieldRow
                        label="LinkedIn"
                        value={
                          <a
                            href={formatSocialUrl("linkedin", business.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            <Linkedin className="h-4 w-4 text-blue-500" /> {business.linkedin.startsWith("http") ? "LinkedIn Page" : business.linkedin}
                          </a>
                        }
                      />
                    )}
                    {business.website && (
                      <FieldRow
                        label="Website"
                        value={
                          <a
                            href={formatSocialUrl("website", business.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                          >
                            <Globe className="h-4 w-4 text-muted-foreground" /> {business.website}
                          </a>
                        }
                      />
                    )}
                  </dl>
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Want to reach this business directly?</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEnquiryOpen(true)}
                      className="rounded-xl gap-1.5 font-semibold"
                    >
                      <MessageSquarePlus className="h-4 w-4" /> Send Enquiry
                    </Button>
                  </div>
                </Panel>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                <Panel title="Reviews & Ratings" description="Verified chamber member experiences and buyer feedback">
                  <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="text-center sm:text-left">
                      <p className="text-4xl font-bold tracking-tight text-foreground">{hasAnyRating ? avgRating : "0.0"}</p>
                      <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              hasAnyRating && i < Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {effectiveTotalReviews > 0 ? `${effectiveTotalReviews} ${effectiveTotalReviews === 1 ? "review" : "reviews"}` : "0 reviews"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {ratingBreakdown.map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-8 shrink-0 text-muted-foreground">{r.stars}★</span>
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-muted-foreground text-right">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">No reviews yet</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      Be the first to share your experience with {business.name}. Your verified review will appear right here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r, idx) => (
                      <article key={r._id || r.id || `rev-${idx}`} className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs transition-colors hover:border-primary/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-sm uppercase shadow-xs">
                              {(r.authorName || r.author?.name || "M")[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {r.authorName || r.author?.name || "Verified Member"}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {r.authorRole || "Chamber Member"} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent"}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn("h-3.5 w-3.5", i < r.rating ? "fill-warning text-warning" : "text-muted")}
                              />
                            ))}
                          </div>
                        </div>
                        {r.title && <h3 className="mt-3 text-sm font-semibold text-foreground">{r.title}</h3>}
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                      </article>
                    ))}
                  </div>
                )}

                <Panel title="Write a review" description="Share your feedback with other chamber members and visitors">
                  {reviewSuccess ? (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Thank you! Your review has been submitted.</span>
                    </div>
                  ) : isMyOwnBusiness ? (
                    <div className="rounded-xl bg-muted/40 p-4 border border-border/60 text-xs text-muted-foreground">
                      💡 This is your own business profile. Reviews submitted by other members and buyers will appear above.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      {!user && (
                        <div>
                          <label className="text-xs font-medium text-foreground">Your Name *</label>
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            required
                            placeholder="e.g. John Doe"
                            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-foreground">Your Rating *</label>
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            {(reviewRatingHover || reviewRating) > 0
                              ? `${reviewRatingHover || reviewRating} / 5 Stars`
                              : "(Click a star to rate)"}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              onMouseEnter={() => setReviewRatingHover(num)}
                              onMouseLeave={() => setReviewRatingHover(0)}
                              aria-label={`Rate ${num} of 5`}
                              className={cn(
                                "grid h-10 w-10 place-items-center rounded-xl border transition-all cursor-pointer",
                                (reviewRatingHover || reviewRating) >= num
                                  ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-500 shadow-2xs"
                                  : "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 hover:border-slate-300 hover:text-slate-400"
                              )}
                            >
                              <Star
                                className={cn(
                                  "h-5 w-5 transition-transform hover:scale-110",
                                  (reviewRatingHover || reviewRating) >= num
                                    ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                                    : "fill-transparent text-slate-300 dark:text-slate-600"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Review Title (Optional)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Excellent service, timely delivery & responsive team"
                          className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Review Comments *</label>
                        <textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          required
                          rows={3}
                          placeholder="Write your experience with this business..."
                          className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" disabled={reviewSubmitting || reviewRating === 0 || !reviewBody.trim()}>
                        {reviewSubmitting ? "Publishing review..." : "Submit review"}
                      </Button>
                    </form>
                  )}
                </Panel>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky side rail */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Key Representative Card */}
            {(business.contactPerson || business.owner?.name) && (
              <Panel title="Key Representative">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border shrink-0 bg-primary/10 flex items-center justify-center font-bold text-primary text-base shadow-2xs">
                    {business.owner?.avatar || business.avatar ? (
                      <img
                        src={resolveMediaUrl(business.owner?.avatar || business.avatar)}
                        alt={business.contactPerson || business.owner?.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (business.contactPerson || business.owner?.name || "R").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {business.contactPerson || business.owner?.name}
                    </p>
                    <span className="mt-0.5 inline-block text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 truncate max-w-full">
                      {business.roleInBusiness || business.owner?.roleInBusiness || business.owner?.designation || business.designation || "Founder / Owner"}
                    </span>
                    {(business.instagram || business.linkedin) && (
                      <div className="mt-2 flex items-center gap-2">
                        {business.instagram && (
                          <a
                            href={formatSocialUrl("instagram", business.instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Instagram"
                            className="p-1 rounded-md text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 transition-colors"
                          >
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {business.linkedin && (
                          <a
                            href={formatSocialUrl("linkedin", business.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 transition-colors"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            )}

            <Panel title="Membership & trust">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Membership</span>
                  <MembershipBadge tier={business.membership} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Verification</span>
                  <VerificationBadge status={business.verification} compact />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Chapter</span>
                  <span className="font-medium">{business.chapter}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{business.founded || "2020"}</span>
                </li>
              </ul>
            </Panel>
          </aside>
        </div>

        <section className="py-10 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Similar businesses {business?.industry ? `in ${business.industry}` : ""}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Discover verified chamber members and trusted business partners.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0 self-start sm:self-auto">
              <Link href="/discover">View all directory</Link>
            </Button>
          </div>

          {related.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b, bIdx) => (
                <BusinessCard key={b._id || b.slug || b.id || `rel-${bIdx}`} business={b} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-8 sm:p-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-sm text-foreground">
                No other businesses registered in {business?.industry || "this category"} yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Explore our full chamber directory to connect with verified partners across all industries.
              </p>
              <Button asChild size="sm" className="mt-4 rounded-xl">
                <Link href="/discover">Explore Full Directory</Link>
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Share Business Profile Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-surface border border-border shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Share2 className="h-4 w-4" />
              </div>
              Share Business Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share <strong className="text-foreground">{business.name}</strong> with your network, clients, or partners.
            </DialogDescription>
          </DialogHeader>

          {/* Business Preview card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border mt-1">
            <img
              src={logoUrl}
              alt={business.name}
              className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate text-foreground">{business.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {business.tagline || business.industry || "RIFAH Member"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {business.city && <span>{business.city}, {business.state}</span>}
                {avgRating && (
                  <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                    ★ {avgRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Social share options */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Share directly via
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp (Official Logo) */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out *${business.name}* on RIFAH Chamber of Commerce:\n${getShareUrl()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">WhatsApp</span>
              </a>

              {/* LinkedIn (Official Logo) */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.67 1.66c0 .92.75 1.67 1.67 1.67s1.67-.75 1.67-1.67c0-.91-.75-1.66-1.67-1.66Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">LinkedIn</span>
              </a>

              {/* X / Twitter (Official Logo) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out ${business.name} on RIFAH Chamber of Commerce!`
                )}&url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-black/50 dark:hover:border-white/50 hover:bg-black/5 dark:hover:bg-white/5 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 text-white dark:text-black fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">X / Twitter</span>
              </a>

              {/* Gmail / Email (Official 4-Color Logo) */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`${business.name} on RIFAH Chamber of Commerce`)}&body=${encodeURIComponent(
                  `Hello,\n\nI wanted to share this business profile with you:\n\n${business.name}\n${getShareUrl()}`
                )}`}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition group text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-muted/80 border border-border flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M1.5 6.5v11a2 2 0 0 0 2 2h3v-9.5l-5-3.5z" />
                    <path fill="#34A853" d="M22.5 6.5v11a2 2 0 0 1-2 2h-3v-9.5l5-3.5z" />
                    <path fill="#EA4335" d="M17.5 4.5l-5.5 4-5.5-4h-3a2 2 0 0 0-2 2v.5l10.5 7.5 10.5-7.5V6.5a2 2 0 0 0-2-2h-3z" />
                    <path fill="#FBBC05" d="M6.5 10v9.5h11V10l-5.5 4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">Email</span>
              </a>
            </div>
          </div>

          {/* Direct Copy link */}
          <div className="mt-3 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-mono select-all outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "gap-1.5 text-xs font-semibold shrink-0 transition-all rounded-xl",
                  copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Device Share Option */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <div className="mt-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full gap-2 text-xs font-medium rounded-xl"
                onClick={handleNativeShare}
              >
                <Smartphone className="h-3.5 w-3.5" /> Share via phone / other apps
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enquiry Modal */}
      <Dialog open={enquiryOpen} onOpenChange={handleEnquiryClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageSquarePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              Send Enquiry
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Send your requirement directly to <strong className="text-foreground">{business.name}</strong>. They will receive your enquiry and respond.
            </DialogDescription>
          </DialogHeader>

          {enquirySuccess ? (
            <div className="py-6 sm:py-8 text-center">
              <span className="mx-auto grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-foreground">Enquiry Sent!</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                Your enquiry has been submitted to <strong>{business.name}</strong>. They will get back to you via the contact details you provided.
              </p>
              <Button
                className="mt-4 sm:mt-5 rounded-xl w-full sm:w-auto"
                onClick={() => handleEnquiryClose(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-3">
              {enquiryError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 sm:p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{enquiryError}</span>
                </div>
              )}

              <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">Your Name <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.guestName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, guestName: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">Your Email <span className="text-destructive">*</span></label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.guestEmail}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, guestEmail: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">Phone <span className="text-muted-foreground font-normal text-[10px]">(optional)</span></label>
                  <input
                    type="tel"
                    value={enquiryForm.guestPhone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, guestPhone: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">City / Location</label>
                  <input
                    type="text"
                    value={enquiryForm.location}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, location: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground">Requirement <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={enquiryForm.title}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, title: e.target.value })}
                  placeholder="e.g. Need 500 units of custom packaging"
                  className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold text-foreground">Quantity</label>
                  <input
                    type="text"
                    value={enquiryForm.quantity}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: e.target.value })}
                    placeholder="e.g. 500 units"
                    className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground">Additional Details <span className="text-muted-foreground font-normal text-[10px]">(optional)</span></label>
                <textarea
                  value={enquiryForm.description}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, description: e.target.value })}
                  rows={2}
                  placeholder="Specifications, delivery expectations, any other details..."
                  className="w-full rounded-lg sm:rounded-xl border border-border bg-transparent px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEnquiryClose(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={enquirySubmitting}
                  className="rounded-xl gap-1.5 font-semibold sm:min-w-[140px]"
                >
                  {enquirySubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Enquiry</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Catalogue Item Detail Popup Modal (Vertical Flow, Scrollable without Visible Scrollbar) */}
      <Dialog
        open={Boolean(selectedCatalogueItem)}
        onOpenChange={(open) => {
          if (!open) handleCloseCatalogueItem();
        }}
      >
        <DialogContent className="w-[94vw] sm:max-w-lg md:max-w-xl max-h-[88vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedCatalogueItem?.name || "Product Offering"}</DialogTitle>
            <DialogDescription>Details and specifications for {selectedCatalogueItem?.name || "this item"}</DialogDescription>
          </DialogHeader>
          {selectedCatalogueItem && (
            <div className="flex flex-col">
              {/* Media Stage (Top of Vertical Stack) */}
              <div className="relative bg-muted/40 border-b border-border p-3 sm:p-4 pb-3">
                {selectedCatalogueItem.images && selectedCatalogueItem.images.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative h-56 sm:h-72 w-full overflow-hidden rounded-2xl bg-black/5 dark:bg-black/30 border border-border flex items-center justify-center">
                      <img
                        src={resolveMediaUrl(
                          selectedCatalogueItem.images[activeCatalogueImageIndex] || selectedCatalogueItem.images[0]
                        )}
                        alt={selectedCatalogueItem.name}
                        className="h-full w-full object-contain p-2 transition-all duration-200"
                      />
                      {selectedCatalogueItem.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCatalogueImageIndex((prev) =>
                                prev === 0 ? selectedCatalogueItem.images.length - 1 : prev - 1
                              );
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCatalogueImageIndex((prev) =>
                                prev === selectedCatalogueItem.images.length - 1 ? 0 : prev + 1
                              );
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2.5 right-3 rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold text-white">
                            {activeCatalogueImageIndex + 1} / {selectedCatalogueItem.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Image Thumbnails if > 1 */}
                    {selectedCatalogueItem.images.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {selectedCatalogueItem.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCatalogueImageIndex(idx)}
                            className={cn(
                              "relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                              activeCatalogueImageIndex === idx
                                ? "border-primary ring-2 ring-primary/30 scale-105"
                                : "border-border/70 opacity-60 hover:opacity-100"
                            )}
                          >
                            <img
                              src={resolveMediaUrl(img)}
                              alt={`thumb ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 sm:h-48 w-full rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-border/70 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-12 w-12 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-center text-primary">
                      {selectedCatalogueItem.type === "Service" ? (
                        <Wrench className="h-6 w-6" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      No media uploaded for this offering
                    </span>
                  </div>
                )}
              </div>

              {/* Details Content (Vertical Flow) */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Type badge, Category tag & Slug */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedCatalogueItem.type === "Service"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                        }`}
                    >
                      {selectedCatalogueItem.type || "Product"}
                    </span>
                    {selectedCatalogueItem.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Tag className="h-3 w-3" />
                        {selectedCatalogueItem.category}
                      </span>
                    )}
                  </div>
                  {selectedCatalogueItem.slug && (
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
                      #{selectedCatalogueItem.slug}
                    </span>
                  )}
                </div>

                {/* Title & Business attribution */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    {selectedCatalogueItem.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    Offered by <strong className="text-foreground">{business.name}</strong>
                    {business.city && <span>· {business.city}</span>}
                  </p>
                </div>

                {/* Price & MOQ stats */}
                <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-2xl bg-muted/30 border border-border">
                  <div className="p-2.5 rounded-xl bg-card border border-border/50">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Price
                    </span>
                    <span className="mt-0.5 text-base sm:text-lg font-bold text-primary block truncate">
                      {selectedCatalogueItem.price
                        ? selectedCatalogueItem.price.startsWith("₹")
                          ? selectedCatalogueItem.price
                          : `₹ ${selectedCatalogueItem.price}`
                        : "On Request"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border/50">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Minimum Order (MOQ)
                    </span>
                    <span className="mt-0.5 text-xs sm:text-sm font-semibold text-foreground block truncate">
                      {selectedCatalogueItem.moq || "Flexible / On Request"}
                    </span>
                  </div>
                </div>

                {/* Description & Specifications */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Description & Specifications
                  </span>
                  <div className="rounded-2xl border border-border/60 bg-muted/15 p-3.5">
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {selectedCatalogueItem.description || "No detailed description has been provided for this offering."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCatalogueItemLink(selectedCatalogueItem)}
                    className="rounded-xl gap-1.5 text-xs font-semibold"
                  >
                    {catalogueLinkCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Link Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Share Item Link
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseCatalogueItem}
                      className="rounded-xl"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleEnquireFromCatalogue(selectedCatalogueItem)}
                      className="rounded-xl gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> Enquire for this {selectedCatalogueItem.type || "Item"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { BusinessProfile as BusinessProfilePage };
export default BusinessProfile;
