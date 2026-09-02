"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  userApi,
  businessApi,
  categoryApi,
  chapterApi,
  verificationApi,
  catalogueApi,
  enquiryApi,
  leadApi,
  membershipApi,
  paymentApi,
  messageApi,
  notificationApi,
  eventApi,
  reviewApi,
  reportApi,
  auditApi,
} from "../lib/api-services";

// ==================== BUSINESS HOOKS ====================

export function useBusinesses(params = {}) {
  return useQuery({
    queryKey: ["businesses", params],
    queryFn: async () => {
      const res = await businessApi.list(params);
      return res?.data || res;
    },
  });
}

export function useBusinessDetail(idOrSlug) {
  return useQuery({
    queryKey: ["business", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const res = await businessApi.getByIdOrSlug(idOrSlug);
      return res?.data || res;
    },
    enabled: Boolean(idOrSlug),
  });
}

export function useMyBusiness() {
  return useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await businessApi.getMyBusiness();
      return res?.data || res;
    },
  });
}

// ==================== CATALOGUE HOOKS ====================

export function useCatalogue(params = {}) {
  return useQuery({
    queryKey: ["catalogue", params],
    queryFn: async () => {
      const res = await catalogueApi.list(params);
      return res?.data?.items || res?.data || res;
    },
  });
}

export function useBusinessCatalogue(businessId) {
  return useQuery({
    queryKey: ["catalogue-business", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const res = await catalogueApi.getByBusiness(businessId);
      return res?.data || res;
    },
    enabled: Boolean(businessId),
  });
}

// ==================== CATEGORIES & CHAPTERS ====================

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res?.data || res;
    },
  });
}

export function useChapters() {
  return useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const res = await chapterApi.list();
      return res?.data?.chapters || res?.data || res;
    },
  });
}

// ==================== ENQUIRIES & LEADS ====================

export function useMyEnquiries(params = {}) {
  return useQuery({
    queryKey: ["my-enquiries", params],
    queryFn: async () => {
      const res = await enquiryApi.getMyEnquiries(params);
      return res?.data || res;
    },
  });
}

export function useAllEnquiries(params = {}) {
  return useQuery({
    queryKey: ["all-enquiries", params],
    queryFn: async () => {
      const res = await enquiryApi.getAllEnquiries(params);
      return res?.data || res;
    },
  });
}

export function useMyLeads(params = {}) {
  return useQuery({
    queryKey: ["my-leads", params],
    queryFn: async () => {
      try {
        const res = await leadApi.getMyLeads(params);
        return res?.data || res;
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          return [];
        }
        throw err;
      }
    },
    retry: false,
  });
}

// ==================== MEMBERSHIP & PAYMENTS ====================

export function useMembershipPlans() {
  return useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const res = await membershipApi.getPlans();
      return res?.data || res;
    },
  });
}

export function useMyMembership() {
  return useQuery({
    queryKey: ["my-membership"],
    queryFn: async () => {
      const res = await membershipApi.getMyMembership();
      return res?.data || res;
    },
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await paymentApi.getMyPayments();
      return res?.data || res;
    },
  });
}

export function useAllPayments(params = {}) {
  return useQuery({
    queryKey: ["all-payments", params],
    queryFn: async () => {
      const res = await paymentApi.getAllPayments(params);
      return res?.data || res;
    },
  });
}

// ==================== EVENTS HOOKS ====================

export function useEvents(params = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const res = await eventApi.list(params);
      return res?.data || res;
    },
  });
}

export function useEventDetail(idOrSlug) {
  return useQuery({
    queryKey: ["event", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const res = await eventApi.getByIdOrSlug(idOrSlug);
      return res?.data || res;
    },
    enabled: Boolean(idOrSlug),
  });
}

// ==================== REVIEWS HOOKS ====================

export function useBusinessReviews(businessId) {
  return useQuery({
    queryKey: ["reviews", businessId],
    queryFn: async () => {
      if (!businessId) return { reviews: [] };
      const res = await reviewApi.getByBusiness(businessId);
      return res?.data || res;
    },
    enabled: Boolean(businessId),
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await reviewApi.getAdminReviews();
      return res?.data || res;
    },
  });
}

// ==================== MESSAGING & NOTIFICATIONS ====================

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const res = await messageApi.getConversations();
        return res?.data?.conversations || res?.data || res;
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          return [];
        }
        throw err;
      }
    },
    retry: false,
  });
}

export function useMessages(otherUserId) {
  return useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      try {
        const res = await messageApi.getMessages(otherUserId);
        return res?.data?.messages || res?.data || res;
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          return [];
        }
        throw err;
      }
    },
    enabled: Boolean(otherUserId),
    retry: false,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await notificationApi.list();
        const rawData = res?.data || res;
        const notifications = Array.isArray(rawData)
          ? rawData
          : (rawData?.notifications || []);
        const unreadCount = typeof rawData?.unreadCount === "number"
          ? rawData.unreadCount
          : notifications.filter((n) => !n.isRead && !n.readAt).length;

        return { notifications, unreadCount };
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          return { notifications: [], unreadCount: 0 };
        }
        throw err;
      }
    },
    retry: false,
  });
}

// ==================== ANALYTICS & ADMIN ====================

export function useBusinessAnalytics() {
  return useQuery({
    queryKey: ["business-analytics"],
    queryFn: async () => {
      const res = await reportApi.getBusinessAnalytics();
      return res?.data || res;
    },
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await reportApi.getOverview();
      return res?.data || res;
    },
  });
}

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const res = await auditApi.getLogs(params);
      return res?.data || res;
    },
  });
}

export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const res = await userApi.getAdminUsers(params);
      return res?.data || res;
    },
  });
}

export function useVerificationQueue() {
  return useQuery({
    queryKey: ["verification-queue"],
    queryFn: async () => {
      const res = await verificationApi.getQueue();
      return res?.data?.queue || res?.data || res;
    },
  });
}
