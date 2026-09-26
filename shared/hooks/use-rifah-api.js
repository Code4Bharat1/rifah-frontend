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
  announcementApi,
  eventApi,
  reviewApi,
  reportApi,
  auditApi,
  contactApi,
  settingsApi,
  stateApi,
  centralAdminApi,
  oneToOneApi,
  thankYouNoteApi,
  referralApi,
  networkingAnalyticsApi,
  courseApi,
  birthdayApi,
  anniversaryApi,
  powerNetworkingApi,
  postsApi,
} from "../lib/api-services";
import { useAuth } from "../providers/auth-provider";

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
      try {
        const res = await businessApi.getByIdOrSlug(idOrSlug);
        return res?.data || res;
      } catch (err) {
        // Return null for 404 or missing business so page renders polite NotFound state instead of crashing
        return null;
      }
    },
    enabled: Boolean(idOrSlug),
    retry: 1,
  });
}

export function useMyBusiness() {
  return useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await businessApi.getMyBusiness();
      // BUG-FIX: use ?? null so that when the API returns { data: null }
      // we correctly return null instead of falling back to the entire
      // response wrapper object (which is truthy and broke admin sidebar locking).
      return res?.data ?? null;
    },
  });
}

// ==================== CATALOGUE HOOKS ====================

export function useCatalogue(params = {}, options = {}) {
  return useQuery({
    queryKey: ["catalogue", params],
    queryFn: async () => {
      const res = await catalogueApi.list(params);
      return res?.data?.items || res?.data || res;
    },
    ...options,
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
      return res?.data?.categories || res?.data || res;
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

export function useChapterDetails(id) {
  return useQuery({
    queryKey: ["chapters", id, "details"],
    queryFn: async () => {
      if (!id) return null;
      const res = await chapterApi.getChapterDetails(id);
      return res?.data || res;
    },
    enabled: Boolean(id),
  });
}

// ----------------------------------------------------------------------
// LMS
// ----------------------------------------------------------------------

export function useCourses(params = {}) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseApi.list(params),
  });
}

export function useCourse(id) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}

export function useCertificates(params = {}) {
  return useQuery({
    queryKey: ["certificates", params],
    queryFn: () => courseApi.getCertificates(params),
  });
}

export function useStates() {
  return useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await stateApi.list();
      return res?.data?.states || res?.data || res;
    },
  });
}

export function useStateDetails(stateName) {
  return useQuery({
    queryKey: ["states", stateName],
    queryFn: async () => {
      if (!stateName) return null;
      const res = await stateApi.getByName(stateName);
      return res?.data || res;
    },
    enabled: Boolean(stateName),
  });
}

export function useCurrentCentralAdmin() {
  return useQuery({
    queryKey: ["central-admin"],
    queryFn: async () => {
      const res = await centralAdminApi.getCurrent();
      return res?.data || res;
    },
  });
}

// ==================== NETWORKING ====================

export function useMyOneToOnes(params = {}) {
  return useQuery({
    queryKey: ["one-to-ones", "me", params],
    queryFn: async () => {
      const res = await oneToOneApi.listMine(params);
      return res?.data || res;
    },
  });
}

export function useAdminOneToOnes(params = {}) {
  return useQuery({
    queryKey: ["one-to-ones", "admin", params],
    queryFn: async () => {
      const res = await oneToOneApi.listAdmin(params);
      return res?.data || res;
    },
  });
}

export function useMyThankYouNotes(params = {}) {
  return useQuery({
    queryKey: ["thank-you-notes", "me", params],
    queryFn: async () => {
      const res = await thankYouNoteApi.listMine(params);
      return res?.data || res;
    },
  });
}

export function useAdminThankYouNotes(params = {}) {
  return useQuery({
    queryKey: ["thank-you-notes", "admin", params],
    queryFn: async () => {
      const res = await thankYouNoteApi.listAdmin(params);
      return res?.data || res;
    },
  });
}

export function useMyThankYouSummary() {
  return useQuery({
    queryKey: ["thank-you-notes", "summary", "me"],
    queryFn: async () => {
      const res = await thankYouNoteApi.summaryMine();
      return res?.data || res;
    },
  });
}

export function useMyReferrals(params = {}) {
  return useQuery({
    queryKey: ["referrals", "me", params],
    queryFn: async () => {
      const res = await referralApi.listMine(params);
      return res?.data || res;
    },
  });
}

export function useAdminReferrals(params = {}) {
  return useQuery({
    queryKey: ["referrals", "admin", params],
    queryFn: async () => {
      const res = await referralApi.listAdmin(params);
      return res?.data || res;
    },
  });
}

export function useNetworkingOverview() {
  return useQuery({
    queryKey: ["networking-analytics", "overview"],
    queryFn: async () => {
      const res = await networkingAnalyticsApi.overview();
      return res?.data || res;
    },
  });
}

export function useNetworkingLeaderboard(params = {}) {
  return useQuery({
    queryKey: ["networking-analytics", "leaderboard", params],
    queryFn: async () => {
      const res = await networkingAnalyticsApi.leaderboard(params);
      return res?.data || res;
    },
  });
}

export function useNetworkingBreakdown(params = {}) {
  return useQuery({
    queryKey: ["networking-analytics", "breakdown", params],
    queryFn: async () => {
      const res = await networkingAnalyticsApi.breakdown(params);
      return res?.data || res;
    },
    enabled: Boolean(params.level),
  });
}

export function usePublicStateRevenue() {
  return useQuery({
    queryKey: ["networking-analytics", "public-states"],
    queryFn: async () => {
      const res = await networkingAnalyticsApi.publicStateTotals();
      return res?.data || res;
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

export function useBusinessEnquiries(params = {}) {
  return useQuery({
    queryKey: ["business-enquiries", params],
    queryFn: async () => {
      try {
        const res = await enquiryApi.getMyBusinessEnquiries(params);
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

export function useAllEnquiries(params = {}) {
  return useQuery({
    queryKey: ["all-enquiries", params],
    queryFn: async () => {
      const res = await enquiryApi.getAllEnquiries(params);
      return res?.data || res;
    },
  });
}

export function useQueries(params = {}) {
  return useQuery({
    queryKey: ["queries", params],
    queryFn: async () => {
      const res = await contactApi.getQueries(params);
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

export function useEnquiryResponses(enquiryId) {
  return useQuery({
    queryKey: ["enquiry-responses", enquiryId],
    queryFn: async () => {
      if (!enquiryId) return [];
      try {
        const res = await leadApi.getEnquiryResponses(enquiryId);
        return res?.data || res;
      } catch (err) {
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          return [];
        }
        throw err;
      }
    },
    enabled: Boolean(enquiryId),
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
    enabled: typeof window !== "undefined",
  });
}

// ==================== EVENTS HOOKS ====================

export function useEvents(params = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const res = await eventApi.list(params);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        data.events = data;
        return data;
      }
      return data;
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
      if (!businessId) return [];
      const res = await reviewApi.getByBusiness(businessId);
      const data = res?.data || res;
      return Array.isArray(data) ? data : (data?.reviews || []);
    },
    enabled: Boolean(businessId),
  });
}

export function useAdminReviews(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: async () => {
      const res = await reviewApi.getAdminReviews(params);
      return res?.data?.reviews || res?.data || res;
    },
    staleTime: 0,
    ...options,
  });
}

// ==================== MESSAGING & NOTIFICATIONS ====================

export function useConversations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const res = await messageApi.getConversations();
        return res?.data?.conversations || res?.data || res || [];
      } catch {
        // Return empty array on temporary network/auth hiccups during polling
        return [];
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 6000,
    retry: 0,              // already handled inside queryFn — no React Query retries needed
    throwOnError: false,   // never bubble to error boundary for polling failures
    refetchOnWindowFocus: false,
  });
}


export function useMessages(otherUserId) {
  return useQuery({
    queryKey: ["messages", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      try {
        const res = await messageApi.getMessages(otherUserId);
        return res?.data?.messages || res?.data || res || [];
      } catch (err) {
        return [];
      }
    },
    enabled: Boolean(otherUserId),
    refetchInterval: 4000,
    retry: 1,
  });
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
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
        return { notifications: [], unreadCount: 0 };
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 8000,
    retry: 1,
  });
}

export function useAnnouncements(params = {}) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: async () => {
      const res = await announcementApi.list(params);
      return res?.data || res;
    },
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

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      try {
        const res = await reportApi.getPublicStats();
        return res?.data || res;
      } catch (err) {
        return { kpi: { totalBusinesses: 42, verifiedBusinesses: 28, totalChapters: 3 } };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminOverview() {
  const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await reportApi.getOverview();
      return res?.data || res;
    },
    enabled: Boolean(token),
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
    enabled: typeof window !== "undefined",
  });
}

export function useVerificationQueue(params = {}) {
  return useQuery({
    queryKey: ["verification-queue", params],
    queryFn: async () => {
      const res = await verificationApi.getQueue(params);
      return res?.data?.queue || res?.data || res;
    },
  });
}

export function useSettings(options = {}) {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await settingsApi.get();
      return res?.data?.data || res?.data || res;
    },
    staleTime: 0,
    refetchOnMount: "always",
    ...options,
  });
}

export function useTodayBirthdays(options = {}) {
  return useQuery({
    queryKey: ["today-birthdays"],
    queryFn: async () => {
      const res = await birthdayApi.getToday();
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000, // 5 mins
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useTodayAnniversaries(options = {}) {
  return useQuery({
    queryKey: ["today-anniversaries"],
    queryFn: async () => {
      const res = await anniversaryApi.getToday();
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000, // 5 mins
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useNewChapterMembers(options = {}) {
  return useQuery({
    queryKey: ["new-chapter-members"],
    queryFn: async () => {
      const res = await businessApi.getNewChapterMembers();
      return res?.data || res;
    },
    staleTime: 2 * 60 * 1000, // 2 mins
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== POWER NETWORKING HOOKS ====================

export function usePowerNetworkingStats() {
  return useQuery({
    queryKey: ["power-networking", "stats"],
    queryFn: async () => {
      const res = await powerNetworkingApi.getStats();
      return res?.data || res;
    },
    refetchInterval: 30000,
  });
}

export function usePowerRequirements(params = {}) {
  return useQuery({
    queryKey: ["power-networking", "requirements", params],
    queryFn: async () => {
      const res = await powerNetworkingApi.getRequirements(params);
      return res?.data || res;
    },
  });
}

export function usePowerRequirement(id) {
  return useQuery({
    queryKey: ["power-networking", "requirement", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await powerNetworkingApi.getRequirementById(id);
      return res?.data || res;
    },
    enabled: Boolean(id),
  });
}

export function usePowerRequirementMatches(id, params = {}) {
  return useQuery({
    queryKey: ["power-networking", "requirement-matches", id, params],
    queryFn: async () => {
      if (!id) return null;
      const res = await powerNetworkingApi.getRequirementMatches(id, params);
      return res?.data || res;
    },
    enabled: Boolean(id),
  });
}

export function usePowerDiscoverBusinesses(params = {}) {
  return useQuery({
    queryKey: ["power-networking", "discover", params],
    queryFn: async () => {
      const res = await powerNetworkingApi.discoverBusinesses(params);
      return res?.data || res;
    },
  });
}

export function usePowerConnections(params = {}) {
  return useQuery({
    queryKey: ["power-networking", "connections", params],
    queryFn: async () => {
      const res = await powerNetworkingApi.getConnections(params);
      return res?.data || res;
    },
  });
}

export function usePowerRequests(params = {}) {
  return useQuery({
    queryKey: ["power-networking", "requests", params],
    queryFn: async () => {
      const res = await powerNetworkingApi.getRequests(params);
      return res?.data || res;
    },
  });
}

export function useCreatePowerRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => powerNetworkingApi.createRequirement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
    },
  });
}

export function useSendPowerConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => powerNetworkingApi.sendConnectionRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
    },
  });
}

export function useRespondPowerConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => powerNetworkingApi.respondToRequest(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMyPowerNetwork(params = {}) {
  return useQuery({
    queryKey: ["power-networking", "my-network", params],
    queryFn: async () => {
      const res = await powerNetworkingApi.getMyNetwork(params);
      return res?.data || res;
    },
  });
}

export function useRemoveFromPowerNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => powerNetworkingApi.removeFromNetwork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
    },
  });
}

export function useSendPowerQuoteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => powerNetworkingApi.requestQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCancelPowerConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => powerNetworkingApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["power-networking"] });
    },
  });
}

// ==================== FEED POSTS HOOKS ====================

export function usePosts(params = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      const res = await postsApi.list(params);
      return res?.data || res || [];
    },
    // Auto-refetch every 10 seconds and on window focus so multi-PC posts sync automatically
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsApi.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddPostComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postsApi.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}


