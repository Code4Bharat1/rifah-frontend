const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return "";

  // 1. Data URLs or local public images
  if (path.startsWith("data:") || path.startsWith("/images/")) {
    return path;
  }

  // 2. Cloudinary or other external remote URLs (already fully qualified https://)
  if (path.startsWith("https://res.cloudinary.com") || (path.startsWith("https://") && !path.includes("localhost"))) {
    return path;
  }

  // 3. If path contains hardcoded localhost:5000 from local development/database seeds, replace with live SERVER_BASE_URL
  if (path.includes("localhost:5000")) {
    const cleaned = path.replace(/http:\/\/localhost:5000\/?/, "");
    const cleanSub = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${SERVER_BASE_URL}${cleanSub}`;
  }

  // 4. Any other remote URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 5. Relative paths (like uploads/... or /uploads/...)
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

  if (response.status === 401 && !isRetry && !endpoint.includes("/login") && !endpoint.includes("/auth/refresh-token")) {
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

    // If we reach here on a 401, refresh failed or didn't exist. Force logout.
    if (typeof window !== "undefined") {
      localStorage.removeItem("rifah_access_token");
      localStorage.removeItem("rifah_refresh_token");
      localStorage.removeItem("rifah_user");
      window.location.href = "/login";
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
