const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export function resolveMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
}

export async function apiClient(endpoint, options = {}, isRetry = false) {
  const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  // Clean custom headers so stale Authorization headers in options don't override the new token
  const customHeaders = { ...(options.headers || {}) };
  delete customHeaders.Authorization;
  delete customHeaders.authorization;

  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (response.status === 401 && !isRetry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh-token")) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("rifah_refresh_token") : null;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;
          const newRefreshToken = refreshData?.data?.refreshToken || refreshData?.refreshToken;
          if (newAccessToken) {
            localStorage.setItem("rifah_access_token", newAccessToken);
            if (newRefreshToken) localStorage.setItem("rifah_refresh_token", newRefreshToken);
            // Retry original request with clean headers
            const retryOptions = {
              ...options,
              headers: customHeaders,
            };
            return apiClient(endpoint, retryOptions, true);
          }
        }
      } catch (e) {
        // Token refresh attempt failed
      }
    }
  }

  if (!response.ok) {
    let errorMsg = data?.error?.message || data?.message || (typeof data === "string" ? data : "An error occurred with the request.");
    if (data?.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
      errorMsg = data.error.details.map((d) => d.message).join(", ");
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;
