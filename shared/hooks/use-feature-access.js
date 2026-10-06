"use client";

import { useMemo } from "react";
import { useAuth } from "@shared/providers/auth-provider";
import { useMyBusiness, useMyMembership } from "@shared/hooks/use-rifah-api";
import { checkFeatureAccess, normalizeUserTier, SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";

// Map navigation routes to 32-feature matrix keys
const ROUTE_FEATURE_MAP = {
  "/biz/messages": "chat",
  "/biz/networking": "networking_groups",
  "/biz/power-networking": "meeting_request",
  "/biz/lms": "lms",
  "/biz/advertisements": "featured_business",
  "/biz/events": "event_announcements",
  // User portal routes mapped to SUBSCRIBER_TIERS
  "/user/messages": "chat",
  "/user/networking": "networking_groups",
  "/user/power-networking": "meeting_request",
  "/user/lms": "lms",
  "/user/events": "event_announcements",
};

export function useFeatureAccess() {
  const { user } = useAuth();
  const { data: business } = useMyBusiness();
  const { data: membershipData } = useMyMembership();

  // Determine current tier from business membership, membership data, or user subscription
  const planName =
    business?.membership ||
    membershipData?.planName ||
    membershipData?.subscriberTier ||
    business?.subscriberTier ||
    user?.subscriberTier ||
    membershipData?.planId ||
    user?.membershipPlan ||
    "Tier I (Free)";
  const tierId = normalizeUserTier(planName);
  const currentTier = SUBSCRIBER_TIERS.find((t) => t.id === tierId) || SUBSCRIBER_TIERS[0];

  // Check if subscription has expired (e.g. 1 month passed for monthly subscriber or plan period passed)
  const isExpired = useMemo(() => {
    if (membershipData) {
      if (membershipData.isExpired === true || (membershipData.status || "").toLowerCase() === "expired") {
        return true;
      }
      if (membershipData.endDate && new Date(membershipData.endDate) < new Date()) {
        return true;
      }
    }
    if (business?.membershipExpiryDate) {
      return new Date(business.membershipExpiryDate) < new Date();
    }
    if (user?.membershipExpiresAt) {
      return new Date(user.membershipExpiresAt) < new Date();
    }
    return false;
  }, [membershipData, business?.membershipExpiryDate, user?.membershipExpiresAt]);

  /**
   * Check if a specific feature key is accessible
   */
  const canAccess = (featureKey) => {
    // Central Admin & Super Admin have universal bypass
    if (user?.role === "central_admin" || user?.role === "super_admin" || user?.role === "admin") {
      return { isAllowed: true, isExpired: false, value: "Unlimited", tierName: "Admin Bypass" };
    }

    return checkFeatureAccess(planName, featureKey, isExpired);
  };

  /**
   * Check if a sidebar navigation path is locked
   */
  const isRouteLocked = (pathname) => {
    if (!pathname) return false;
    const clean = pathname.split("?")[0].replace(/\/$/, "");

    // Central & Chapter Admins have route bypass
    if (
      user?.role === "central_admin" ||
      user?.role === "super_admin" ||
      user?.role === "admin" ||
      user?.role === "chapter_admin" ||
      user?.role === "state_admin"
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
      clean.startsWith("/biz/business/")
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
    planName,
    currentTier,
    isExpired,
    membershipData,
    canAccess,
    isRouteLocked,
  };
}
