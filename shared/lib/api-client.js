export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return "";
}

let inMemoryAccessToken = null;

export function setAccessToken(token) {
  inMemoryAccessToken = token || null;
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

const API_BASE_URL = getApiBaseUrl();

// Automatically determine backend root server URL from env or API_BASE_URL
export function getBackendServerBase() {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
  }
  const currentApiUrl = getApiBaseUrl();
  if (currentApiUrl && (currentApiUrl.startsWith("http://") || currentApiUrl.startsWith("https://"))) {
    try {
      const u = new URL(currentApiUrl);
      return `${u.protocol}//${u.host}`;
    } catch (e) {
      // fallback
    }
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
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
    return cleanStr;
  }

  // 5. Relative paths
  const cleanPath = cleanStr.startsWith("/") ? cleanStr : `/${cleanStr}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
}

// Fetches a binary file (e.g. PDF) from an authenticated endpoint and triggers a browser download
export async function downloadFile(endpoint, filename) {
  const token = inMemoryAccessToken || (typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null);
  const activeApiUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${activeApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    credentials: "include",
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

async function requestTokenRefresh() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const activeApiUrl = getApiBaseUrl();
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("rifah_refresh_token") : null;
      try {
        const refreshRes = await fetch(`${activeApiUrl}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;
          if (newAccessToken) {
            setAccessToken(newAccessToken);
            return { success: true, newAccessToken };
          }
        }
        return {
          success: false,
          isExplicitAuthFailure: refreshRes.status === 401 || refreshRes.status === 403,
        };
      } catch (netErr) {
        return { success: false, isExplicitAuthFailure: false };
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiClient(endpoint, options = {}, isRetry = false) {
  // Never send stale Authorization tokens to unauthenticated auth endpoints
  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/auth/forgot-password") ||
    endpoint.includes("/auth/reset-password") ||
    endpoint.includes("/auth/verify-reset-code") ||
    endpoint.includes("/auth/refresh-token");

  const explicitToken = options.token || (options.headers?.Authorization ? options.headers.Authorization.replace(/^Bearer\s+/i, "") : null);
  let token = explicitToken || (!isAuthEndpoint ? (inMemoryAccessToken || (typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null)) : null);

  // Proactively refresh token if missing in memory on client mount before firing protected requests
  if (!token && !isAuthEndpoint && !isRetry && typeof window !== "undefined") {
    const refreshResult = await requestTokenRefresh();
    if (refreshResult && refreshResult.success) {
      token = inMemoryAccessToken;
    }
  }

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
      credentials: options.credentials || "include",
      headers,
    });
  } catch (netErr) {
    if (!isRetry) {
      await new Promise((r) => setTimeout(r, 1200));
      try {
        return await apiClient(endpoint, options, true);
      } catch (retryErr) {
        // Fall through to logging
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
    const refreshResult = await requestTokenRefresh();
    if (refreshResult && refreshResult.success) {
      // Retry original request with clean headers and the updated in-memory token
      const retryOptions = {
        ...options,
        headers: customHeaders,
      };
      delete retryOptions.token;
      return apiClient(endpoint, retryOptions, true);
    }

    // If the refresh failed because the token was explicitly revoked/expired, purge session & redirect
    if (refreshResult && refreshResult.isExplicitAuthFailure && typeof window !== "undefined") {
      setAccessToken(null);
      localStorage.removeItem("rifah_access_token");
      localStorage.removeItem("rifah_refresh_token");
      localStorage.removeItem("rifah_user");
      document.cookie = "rifah_access_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "rifah_user_role=; path=/; max-age=0; SameSite=Lax";

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
