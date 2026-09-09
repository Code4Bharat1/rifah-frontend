const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Automatically determine backend root server URL from API_BASE_URL or env
function getBackendServerBase() {
  if (API_BASE_URL && (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://"))) {
    try {
      const u = new URL(API_BASE_URL);
      return `${u.protocol}//${u.host}`;
    } catch (e) {
      // fallback
    }
  }
  return process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
}

const SERVER_BASE_URL = getBackendServerBase();

export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return "";

  // Normalize backslashes (for Windows server paths or mixed paths)
  const cleanStr = path.replace(/\\/g, "/");

  // 1. Data URLs, blobs, or local frontend public assets
  if (cleanStr.startsWith("data:") || cleanStr.startsWith("blob:") || cleanStr.startsWith("/images/")) {
    return cleanStr;
  }

  // 2. Cloudinary CDN URLs (permanent global HTTPS)
  if (cleanStr.startsWith("https://res.cloudinary.com") || cleanStr.startsWith("http://res.cloudinary.com")) {
    return cleanStr;
  }

  // 3. If path contains uploads/ (from local dev or any server domain), map cleanly to current active backend SERVER_BASE_URL
  if (cleanStr.includes("/uploads/") || cleanStr.includes("uploads/")) {
    const idx = cleanStr.indexOf("uploads/");
    const relativePart = `/${cleanStr.slice(idx)}`;
    return `${SERVER_BASE_URL}${relativePart}`;
  }

  // 4. Any other external remote URL (e.g. Google avatar, external CDN)
  if (cleanStr.startsWith("http://") || cleanStr.startsWith("https://")) {
    // If it points to localhost while in production, map to active backend
    if (cleanStr.includes("localhost:5000") && !SERVER_BASE_URL.includes("localhost")) {
      const idx = cleanStr.indexOf("localhost:5000");
      const relativePart = cleanStr.slice(idx + "localhost:5000".length);
      return `${SERVER_BASE_URL}${relativePart.startsWith("/") ? relativePart : `/${relativePart}`}`;
    }
    return cleanStr;
  }

  // 5. Relative paths
  const cleanPath = cleanStr.startsWith("/") ? cleanStr : `/${cleanStr}`;
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

    // If we reach here on a 401, refresh failed or didn't exist.
    if (typeof window !== "undefined") {
      const hadToken = Boolean(token || refreshToken);
      localStorage.removeItem("rifah_access_token");
      localStorage.removeItem("rifah_refresh_token");
      localStorage.removeItem("rifah_user");

      const publicPaths = [
        "/",
        "/about",
        "/about-rifah",
        "/aboutrifah",
        "/aboutRIFAH",
        "/about-us",
        "/discover",
        "/catalogue",
        "/events",
        "/contact",
        "/membership",
        "/login",
        "/register",
        "/register-business",
      ];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some(
        (p) => currentPath === p || (p !== "/" && currentPath.startsWith(p))
      );

      // Redirect to /login if user is on a protected path (e.g. /biz, /admin, /me)
      if (!isPublicPath) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
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
