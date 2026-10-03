"use client";

import { useMemo } from "react";
import { useAuth } from "@shared/providers/auth-provider";
import { useMyBusiness } from "@shared/hooks/use-rifah-api";
import { checkFeatureAccess, normalizeUserTier, SUBSCRIBER_TIERS } from "@shared/lib/subscription-models";

// Map navigation routes to 32-feature matrix keys
const ROUTE_FEATURE_MAP = {
  "/biz/feeds": "feed_posting",
  "/biz/messages": "chat",
  "/biz/networking": "networking_groups",
  "/biz/power-networking": "meeting_request",
  "/biz/enquiries": "enquiry_posting",
  "/biz/my-enquiries": "enquiry_posting",
  "/biz/lms": "lms",
  "/biz/analytics": "analytics",
  "/biz/events": "event_notifications",
  "/biz/operations": "lead_unlock",
};

export function useFeatureAccess() {
  const { user } = useAuth();
  const { data: business } = useMyBusiness();

  // Determine current tier from business or user subscription
  const planName = business?.membership || user?.membershipPlan || user?.membership || "Tier I (Free)";
  const tierId = normalizeUserTier(planName);
  const currentTier = SUBSCRIBER_TIERS.find((t) => t.id === tierId) || SUBSCRIBER_TIERS[0];

  // Check if subscription has expired
  const isExpired = useMemo(() => {
    if (business?.membershipExpiryDate) {
      return new Date(business.membershipExpiryDate) < new Date();
    }
    if (user?.membershipExpiresAt) {
      return new Date(user.membershipExpiresAt) < new Date();
    }
    return false;
  }, [business?.membershipExpiryDate, user?.membershipExpiresAt]);

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
    // Admin roles bypass
    if (user?.role === "central_admin" || user?.role === "super_admin" || user?.role === "admin" || user?.role === "chapter_admin") {
      return false;
    }

    const featureKey = ROUTE_FEATURE_MAP[pathname];
    if (!featureKey) return false; // Basic routes like Dashboard or Profile are always unlocked

    const access = canAccess(featureKey);
    return !access.isAllowed;
  };

  return {
    planName,
    currentTier,
    isExpired,
    canAccess,
    isRouteLocked,
  };
}
