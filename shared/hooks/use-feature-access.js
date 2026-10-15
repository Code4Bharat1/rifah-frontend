"use client";

import { useMemo } from "react";
import { useAuth } from "@shared/providers/auth-provider";
import { useMyBusiness, useMyMembership } from "@shared/hooks/use-rifah-api";
import { checkFeatureAccess, normalizeUserTier, SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";

// Map navigation routes to 32-feature matrix keys
const ROUTE_FEATURE_MAP = {
  "/biz/messages": "chat",
  "/biz/networking": "thank_you_note",
  "/biz/power-networking": "meeting_request",
  "/biz/lms": "lms",
  "/biz/advertisements": "featured_business",
  "/biz/events": "event_announcements",
  "/biz/branches": "multiple_locations",
  // User portal routes mapped to SUBSCRIBER_TIERS
  "/user/messages": "chat",
  "/user/networking": "thank_you_note",
  "/user/power-networking": "meeting_request",
  "/user/branches": "multiple_locations",
  "/user/lms": "lms",
  "/user/events": "event_announcements",
};

export function useFeatureAccess() {
  const { user } = useAuth();
  const { data: business, isLoading: bizLoading } = useMyBusiness();
  const { data: membershipData, isLoading: memLoading } = useMyMembership();
  // Until both lookups settle the plan is unknown (falls back to the free tier); locking on that
  // placeholder made the same account look locked on one device and unlocked on another.
  const planLoading = bizLoading || memLoading;

  // Collect candidate tier signals from all available sources (business, user, membership)
  const candidateTiers = [
    business?.subscriberTier,
    business?.membership,
    user?.subscriberTier,
    user?.membershipPlan,
    membershipData?.subscriberTier,
    membershipData?.planId,
    membershipData?.planName,
  ].filter(Boolean);

  const TIER_RANKS = { tier_1: 1, tier_2: 2, tier_3: 3, tier_4: 4 };
  let tierId = "tier_1";
  let maxRank = 1;

  for (const candidate of candidateTiers) {
    const normalized = normalizeUserTier(candidate);
    const rank = TIER_RANKS[normalized] || 1;
    if (rank > maxRank) {
      maxRank = rank;
      tierId = normalized;
    }
  }

  const currentTier = SUBSCRIBER_TIERS.find((t) => t.id === tierId) || SUBSCRIBER_TIERS[0];
  const planName = currentTier.name;

  // Check if subscription has expired (Free tier never expires)
  const isExpired = useMemo(() => {
    if (tierId === "tier_1") return false;
    if (membershipData) {
      if (membershipData.isExpired === true || (membershipData.status || "").toLowerCase() === "expired") {
        return true;
      }
      if (membershipData.endDate && new Date(membershipData.endDate) < new Date()) {
        return true;
      }
    }
    return false;
  }, [tierId, membershipData]);

  /**
   * Check if a specific feature key is accessible
   */
  const isBusinessContext =
    user?.role === "business_owner" ||
    user?.role === "business" ||
    Boolean(user?.previousRole);

  /**
   * Check if a specific feature key is accessible
   */
  const canAccess = (featureKey) => {
    // If plans are still loading, keep open temporarily
    if (planLoading) {
      return { isAllowed: true, isExpired: false, value: "", tierName: "Loading" };
    }
    // Universal admin bypass applies only when in administrative panels, not when operating inside business/user workspace testing tiers
    if (
      !isBusinessContext &&
      (user?.role === "central_admin" || user?.role === "super_admin" || user?.role === "admin")
    ) {
      return { isAllowed: true, isExpired: false, value: "Unlimited", tierName: "Admin Bypass" };
    }

    return checkFeatureAccess(planName, featureKey, isExpired);
  };

  /**
   * Check if a sidebar navigation path is locked
   */
  const isRouteLocked = (pathname) => {
    if (!pathname || planLoading) return false;
    const clean = pathname.split("?")[0].replace(/\/$/, "");

    const isBizOrUserRoute = clean.startsWith("/biz") || clean.startsWith("/user");

    // Central & Chapter Admins have route bypass in administrative contexts,
    // but routes inside /biz/* and /user/* must respect subscriber tier
    if (
      !isBizOrUserRoute &&
      !isBusinessContext &&
      (user?.role === "central_admin" ||
        user?.role === "super_admin" ||
        user?.role === "admin" ||
        user?.role === "chapter_admin" ||
        user?.role === "state_admin")
    ) {
      return false;
    }

    // Universal account management paths are never locked
    if (
      clean === "/user" ||
      clean === "/user/catalogue" ||
      clean.startsWith("/user/catalogue/") ||
      clean === "/user/membership" ||
      clean.startsWith("/user/membership/") ||
      clean === "/user/profile" ||
      clean.startsWith("/user/profile/") ||
      clean === "/user/notifications" ||
      clean.startsWith("/user/notifications/") ||
      clean === "/user/enquiries" ||
      clean.startsWith("/user/enquiries/") ||
      clean === "/user/my-enquiries" ||
      clean.startsWith("/user/my-enquiries/") ||
      clean === "/biz/membership" ||
      clean.startsWith("/biz/membership/") ||
      clean === "/biz/payments" ||
      clean.startsWith("/biz/payments/") ||
      clean === "/biz/profile" ||
      clean.startsWith("/biz/profile/") ||
      clean === "/biz/verification" ||
      clean.startsWith("/biz/verification/") ||
      clean === "/biz/notifications" ||
      clean.startsWith("/biz/notifications/") ||
      clean === "/biz/business" ||
      clean.startsWith("/biz/business/") ||
      clean === "/biz/networking" ||
      clean.startsWith("/biz/networking/") ||
      clean === "/user/networking" ||
      clean.startsWith("/user/networking/")
    ) {
      return false;
    }

    // If subscription is expired (1 month finished), lock all feature pages
    if (isExpired) {
      return true;
    }

    // Check specific route against feature matrix
    const matchedPrefix = Object.keys(ROUTE_FEATURE_MAP).find(
      (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
    );

    if (matchedPrefix) {
      const featureKey = ROUTE_FEATURE_MAP[matchedPrefix];
      const access = canAccess(featureKey);
      return !access.isAllowed;
    }

    return false;
  };

  return {
    tierId,
    planName,
    currentTier,
    isExpired,
    membershipData,
    canAccess,
    isRouteLocked,
  };
}
