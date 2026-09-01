import { apiClient } from "./api-client";

const buildQueryString = (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
  return new URLSearchParams(cleanParams).toString();
};

export const authApi = {
  login: (credentials) => apiClient("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => apiClient("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  registerBusiness: (data) => apiClient("/auth/register-business", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiClient("/auth/me"),
  refreshToken: (refreshToken) => apiClient("/auth/refresh-token", { method: "POST", body: JSON.stringify({ refreshToken }) }),
};

export const userApi = {
  getProfile: () => apiClient("/users/me"),
  updateProfile: (data) => apiClient("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  toggleSaveBusiness: (businessId) => apiClient(`/users/me/saved/${businessId}`, { method: "POST" }),
  getSavedBusinesses: () => apiClient("/users/me"),
  getAdminUsers: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/users${qs ? `?${qs}` : ""}`);
  },
  updateUserStatus: (id, data) => apiClient(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const businessApi = {
  list: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/businesses${qs ? `?${qs}` : ""}`);
  },
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
  list: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/catalogue${qs ? `?${qs}` : ""}`);
  },
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
  getMyEnquiries: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/enquiries/me${qs ? `?${qs}` : ""}`);
  },
  getAllEnquiries: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/enquiries/admin/all${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => apiClient(`/enquiries/${id}`),
  updateStatus: (id, data) => apiClient(`/enquiries/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const leadApi = {
  getMyLeads: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/leads/my-leads${qs ? `?${qs}` : ""}`);
  },
  submitQuotation: (id, data) => apiClient(`/leads/${id}/quote`, { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id, data) => apiClient(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  routeLead: (data) => apiClient("/leads/route", { method: "POST", body: JSON.stringify(data) }),
};

export const membershipApi = {
  getPlans: () => apiClient("/memberships/plans"),
  getMyMembership: () => apiClient("/memberships/me"),
  upgradePlan: (data) => apiClient("/memberships/upgrade", { method: "POST", body: JSON.stringify(data) }),
};

export const paymentApi = {
  getMyPayments: () => apiClient("/payments/me"),
  getAllPayments: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/payments/admin/all${qs ? `?${qs}` : ""}`);
  },
  createOrder: (data) => apiClient("/payments/order", { method: "POST", body: JSON.stringify(data) }),
  verifyPayment: (data) => apiClient("/payments/verify", { method: "POST", body: JSON.stringify(data) }),
};

export const messageApi = {
  getConversations: () => apiClient("/messages/conversations"),
  getMessages: (otherUserId) => apiClient(`/messages/conversation/${otherUserId}`),
  sendMessage: (data) => apiClient("/messages", { method: "POST", body: JSON.stringify(data) }),
};

export const notificationApi = {
  list: () => apiClient("/notifications/me"),
  markAllAsRead: () => apiClient("/notifications/read-all", { method: "PATCH" }),
  broadcast: (data) => apiClient("/notifications/broadcast", { method: "POST", body: JSON.stringify(data) }),
};

export const eventApi = {
  list: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/events${qs ? `?${qs}` : ""}`);
  },
  getByIdOrSlug: (idOrSlug) => apiClient(`/events/detail/${idOrSlug}`),
  register: (id) => apiClient(`/events/${id}/register`, { method: "POST" }),
  create: (data) => apiClient("/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
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
  getLogs: (params = {}) => {
    const qs = buildQueryString(params);
    return apiClient(`/audit${qs ? `?${qs}` : ""}`);
  },
};
