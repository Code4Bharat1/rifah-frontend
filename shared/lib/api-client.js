function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const isLiveDomain = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      if (isLiveDomain && process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
        return `${window.location.origin}/api/v1`;
      }
      // On local machine, always use 127.0.0.1 to avoid Windows IPv6 (::1) connection drop
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return process.env.NEXT_PUBLIC_API_URL.replace("localhost", "127.0.0.1");
      }
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `${window.location.origin}/api/v1`;
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api/v1").replace("localhost", "127.0.0.1");
}

const API_BASE_URL = getApiBaseUrl();

// Automatically determine backend root server URL from API_BASE_URL or env
export function getBackendServerBase() {
  const currentApiUrl = getApiBaseUrl();
  if (currentApiUrl && (currentApiUrl.startsWith("http://") || currentApiUrl.startsWith("https://"))) {
    try {
      const u = new URL(currentApiUrl);
      return `${u.protocol}//${u.host}`;
    } catch (e) {
      // fallback
    }
  }
  return process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:5000";
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

// Fetches a binary file (e.g. PDF) from an authenticated endpoint and triggers a browser download
export async function downloadFile(endpoint, filename) {
  const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
  const activeApiUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${activeApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let message = "Failed to download file.";
    try {
      const data = await response.json();
      message = data?.error?.message || data?.message || message;
    } catch (e) {
      // response wasn't JSON
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

// Global in-flight promise to queue concurrent requests during token refresh and prevent race conditions
let refreshPromise = null;

export async function apiClient(endpoint, options = {}, isRetry = false) {
  // Never send stale Authorization tokens to unauthenticated auth endpoints
  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/auth/forgot-password") ||
    endpoint.includes("/auth/reset-password") ||
    endpoint.includes("/auth/verify-reset-code");

  const token = typeof window !== "undefined" && !isAuthEndpoint ? localStorage.getItem("rifah_access_token") : null;
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

  const activeApiUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${activeApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    // If it's a transient connection failure or IPv4/IPv6 resolution mismatch, retry
    if (!isRetry) {
      const altUrl = url.includes("localhost")
        ? url.replace("localhost", "127.0.0.1")
        : url.includes("127.0.0.1")
        ? url.replace("127.0.0.1", "localhost")
        : null;

      if (altUrl) {
        try {
          return await apiClient(altUrl, options, true);
        } catch (_) {}
      }

      await new Promise((r) => setTimeout(r, 1200));
      try {
        return await apiClient(endpoint, options, true);
      } catch (retryErr) {
        // Second attempt with 1500ms delay for full DB reconnection
        await new Promise((r) => setTimeout(r, 1500));
        try {
          return await apiClient(endpoint, options, true);
        } catch (finalRetryErr) {
          // Fall through to logging
        }
      }
    }
    console.warn(`[API] Network unreachable for ${endpoint}. Backend may be starting up.`);
    throw new Error(`Unable to connect to the backend server. Please check if the server is running.`);
  }

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
      // If a refresh is not already in flight, start one; otherwise wait for the existing refresh promise
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const activeApiUrl = getApiBaseUrl();
          try {
            const refreshRes = await fetch(`${activeApiUrl}/auth/refresh-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;
              const newRefreshToken = refreshData?.data?.refreshToken || refreshData?.refreshToken;
              if (newAccessToken && typeof window !== "undefined") {
                localStorage.setItem("rifah_access_token", newAccessToken);
                if (newRefreshToken) localStorage.setItem("rifah_refresh_token", newRefreshToken);
                return { success: true, newAccessToken };
              }
            }
            // Explicit auth failure (expired or revoked refresh token)
            return {
              success: false,
              isExplicitAuthFailure: refreshRes.status === 401 || refreshRes.status === 403,
            };
          } catch (netErr) {
            // Transient network error or backend reboot - do not treat as explicit auth failure
            return { success: false, isExplicitAuthFailure: false };
          }
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshResult = await refreshPromise;
      if (refreshResult && refreshResult.success) {
        // Retry original request with clean headers and the updated token
        const retryOptions = {
          ...options,
          headers: customHeaders,
        };
        return apiClient(endpoint, retryOptions, true);
      }

      // If the refresh failed because the token was explicitly revoked/expired, purge session & redirect
      if (refreshResult && refreshResult.isExplicitAuthFailure && typeof window !== "undefined") {
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
          "/presence",
          "/members",
          "/login",
          "/register",
          "/register-business",
          "/register-customer",
        ];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some(
          (p) => currentPath === p || (p !== "/" && currentPath.startsWith(p))
        );

        if (!isPublicPath) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    } else if (typeof window !== "undefined") {
      // No refresh token available at all on protected route
      localStorage.removeItem("rifah_access_token");
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
        "/presence",
        "/members",
        "/login",
        "/register",
        "/register-business",
        "/register-customer",
      ];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some(
        (p) => currentPath === p || (p !== "/" && currentPath.startsWith(p))
      );

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
