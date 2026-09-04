import { apiClient } from "./api-client";

function toQueryString(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "" && v !== "undefined")
  );
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const authApi = {
  login: (credentials) => apiClient("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => apiClient("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  registerBusiness: (data) => apiClient("/auth/register-business", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiClient("/auth/me"),
  refreshToken: (refreshToken) => apiClient("/auth/refresh-token", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  changePassword: (data) => apiClient("/auth/change-password", { method: "PATCH", body: JSON.stringify(data) }),
  forgotPassword: (email) => apiClient("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  verifyResetCode: (data) => apiClient("/auth/verify-reset-code", { method: "POST", body: JSON.stringify(data) }),
  resetPassword: (data) => apiClient("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
  googleAuth: (data) => apiClient("/auth/google", { method: "POST", body: JSON.stringify(data) }),
  completeOnboarding: (data) => apiClient("/auth/complete-onboarding", { method: "POST", body: JSON.stringify(data) }),
};

export const userApi = {
  getProfile: () => apiClient("/users/me"),
  updateProfile: (data) => apiClient("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  toggleSaveBusiness: (businessId) => apiClient(`/users/me/saved/${businessId}`, { method: "POST" }),
  getSavedBusinesses: () => apiClient("/users/me"),
  getAdminUsers: (params = {}) => apiClient(`/users${toQueryString(params)}`),
  updateUserStatus: (id, data) => apiClient(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  deactivateAccount: (data = {}) => apiClient("/users/me/deactivate", { method: "POST", body: JSON.stringify(data) }),
};

export const businessApi = {
  list: (params = {}) => apiClient(`/businesses${toQueryString(params)}`),
  getByIdOrSlug: (idOrSlug) => apiClient(`/businesses/detail/${idOrSlug}`),
  getMyBusiness: () => apiClient("/businesses/me"),
  create: (data) => apiClient("/businesses", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/businesses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  updateStatus: (id, data) => apiClient(`/businesses/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiClient(`/businesses/${id}/logo`, { method: "POST", body: formData });
  },
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiClient(`/businesses/${id}/cover`, { method: "POST", body: formData });
  },
  uploadGallery: (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("gallery", files[i]);
    }
    return apiClient(`/businesses/${id}/gallery`, { method: "POST", body: formData });
  },
  uploadCertificate: (id, file) => {
    const formData = new FormData();
    formData.append("certificate", file);
    return apiClient(`/businesses/${id}/certificates`, { method: "POST", body: formData });
  },
};

export const categoryApi = {
  list: () => apiClient("/categories"),
  create: (data) => apiClient("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/categories/${id}`, { method: "DELETE" }),
};

export const chapterApi = {
  list: () => apiClient("/chapters"),
  getById: (id) => apiClient(`/chapters/${id}`),
  create: (data) => apiClient("/chapters", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/chapters/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  addUnit: (chapterId, data) => apiClient(`/chapters/${chapterId}/units`, { method: "POST", body: JSON.stringify(data) }),
  removeUnit: (chapterId, unitId) => apiClient(`/chapters/${chapterId}/units/${unitId}`, { method: "DELETE" }),
  assignAdmin: (chapterId, data) => apiClient(`/chapters/${chapterId}/admins`, { method: "POST", body: JSON.stringify(data) }),
};

export const verificationApi = {
  getByBusinessId: (businessId) => apiClient(`/verification/business/${businessId}`),
  getQueue: () => apiClient("/verification/queue"),
  submit: (data) => apiClient("/verification/submit", { method: "POST", body: JSON.stringify(data) }),
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append("document", file);
    return apiClient("/verification/upload", { method: "POST", body: formData });
  },
  review: (id, data) => apiClient(`/verification/${id}/review`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const catalogueApi = {
  list: (params = {}) => apiClient(`/catalogue${toQueryString(params)}`),
  getByBusiness: (businessId) => apiClient(`/catalogue/business/${businessId}`),
  getById: (id) => apiClient(`/catalogue/${id}`),
  create: (data) => apiClient("/catalogue", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/catalogue/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/catalogue/${id}`, { method: "DELETE" }),
  uploadImages: (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("catalogue", files[i]);
    }
    return apiClient(`/catalogue/${id}/images`, { method: "POST", body: formData });
  },
};

export const enquiryApi = {
  create: (data) => apiClient("/enquiries", { method: "POST", body: JSON.stringify(data) }),
  getMyEnquiries: (params = {}) => apiClient(`/enquiries/me${toQueryString(params)}`),
  getAllEnquiries: (params = {}) => apiClient(`/enquiries/admin/all${toQueryString(params)}`),
  exportCsv: (params = {}) => apiClient(`/enquiries/admin/export/csv${toQueryString(params)}`),
  getById: (id) => apiClient(`/enquiries/${id}`),
  updateStatus: (id, data) => apiClient(`/enquiries/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const leadApi = {
  getMyLeads: (params = {}) => apiClient(`/leads/me${toQueryString(params)}`),
  getEnquiryResponses: (enquiryId) => apiClient(`/leads/enquiry/${enquiryId}`),
  submitQuotation: (id, data) => apiClient(`/leads/${id}/quote`, { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id, data) => apiClient(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  routeLead: (data) => apiClient("/leads/route", { method: "POST", body: JSON.stringify(data) }),
};

export const membershipApi = {
  getPlans: () => apiClient("/memberships/plans"),
  createPlan: (data) => apiClient("/memberships/plans", { method: "POST", body: JSON.stringify(data) }),
  updatePlan: (planId, data) => apiClient(`/memberships/plans/${planId}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePlan: (planId) => apiClient(`/memberships/plans/${planId}`, { method: "DELETE" }),
  getMyMembership: () => apiClient("/memberships/me"),
  upgradePlan: (data) => apiClient("/memberships/upgrade", { method: "POST", body: JSON.stringify(data) }),
};

export const paymentApi = {
  getMyPayments: () => apiClient("/payments/me"),
  getAllPayments: (params = {}) => apiClient(`/payments/admin/all${toQueryString(params)}`),
  createOrder: (data) => apiClient("/payments/order", { method: "POST", body: JSON.stringify(data) }),
  verifyPayment: (data) => apiClient("/payments/verify", { method: "POST", body: JSON.stringify(data) }),
  refund: (id) => apiClient(`/payments/${id}/refund`, { method: "POST" }),
};

export const messageApi = {
  getConversations: () => apiClient("/messages/conversations"),
  getMessages: (otherUserId) => apiClient(`/messages/conversation/${otherUserId}`),
  sendMessage: (data) => apiClient("/messages", { method: "POST", body: JSON.stringify(data) }),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append("attachment", file);
    return apiClient("/messages/upload", { method: "POST", body: formData });
  },
};

export const notificationApi = {
  list: () => apiClient("/notifications/me"),
  markAllAsRead: () => apiClient("/notifications/read-all", { method: "PATCH" }),
  broadcast: (data) => apiClient("/notifications/broadcast", { method: "POST", body: JSON.stringify(data) }),
};

export const eventApi = {
  list: (params = {}) => apiClient(`/events${toQueryString(params)}`),
  getByIdOrSlug: (idOrSlug) => apiClient(`/events/detail/${idOrSlug}`),
  register: (id) => apiClient(`/events/${id}/register`, { method: "POST" }),
  create: (data) => apiClient("/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => apiClient(`/events/${id}`, { method: "DELETE" }),
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiClient(`/events/${id}/cover`, { method: "POST", body: formData });
  },
};

export const reviewApi = {
  getByBusiness: (businessId) => apiClient(`/reviews/business/${businessId}`),
  submit: (data) => apiClient("/reviews", { method: "POST", body: JSON.stringify(data) }),
  getAdminReviews: () => apiClient("/reviews/admin/all"),
  moderate: (id, data) => apiClient(`/reviews/${id}/moderate`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const reportApi = {
  getOverview: () => apiClient("/reports/admin/overview"),
  getBusinessAnalytics: () => apiClient("/reports/business/me"),
};

export const auditApi = {
  getLogs: (params = {}) => apiClient(`/audit${toQueryString(params)}`),
};

export const settingsApi = {
  get: () => apiClient("/settings"),
  update: (data) => apiClient("/settings", { method: "PATCH", body: JSON.stringify(data) }),
};
