"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, userApi } from "../lib/api-services";

export function syncAuthCookies(token, user) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `rifah_access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
  if (user?.role) {
    document.cookie = `rifah_user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "rifah_access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "rifah_user_role=; path=/; max-age=0; SameSite=Lax";
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let cachedUser = null;
      try {
        const cached = localStorage.getItem("rifah_user");
        if (cached) {
          cachedUser = JSON.parse(cached);
          setUser(cachedUser);
        }
      } catch (_) {}

      const token = localStorage.getItem("rifah_access_token");
      const hasToken = Boolean(token);
      const hasCachedUser = Boolean(cachedUser);
      setLoading(!(hasToken && hasCachedUser));
      if (hasToken) {
        syncAuthCookies(token, cachedUser);
      }
    }
  }, []);

  // BUG-013: the mount-time session check (fetchCurrentUser, below) and an
  // explicit login() both call setUser asynchronously. If a user logs in
  // (e.g. picks "State Admin") before the background session check has
  // resolved, whichever call *resolves last* used to win, silently
  // overwriting the freshly logged-in user/role and sending the post-login
  // redirect down the wrong (stale/default) branch on the very first load
  // of the tab. A second login worked because by then the background check
  // had already settled. requestIdRef makes only the most recently
  // *started* write authoritative, so a slow, stale fetchCurrentUser can
  // never clobber a newer login/switchRole result.
  const requestIdRef = useRef(0);

  const fetchCurrentUser = async () => {
    const requestId = ++requestIdRef.current;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("rifah_access_token")
        : null;
    if (!token) {
      if (requestId === requestIdRef.current) {
        setUser(null);
        setLoading(false);
      }
      return;
    }
    try {
      const res = await authApi.getMe();
      const userData = res?.data || res;
      if (requestId !== requestIdRef.current) return;
      setUser(userData);
      localStorage.setItem("rifah_user", JSON.stringify(userData));
      syncAuthCookies(token, userData);
    } catch (err) {
      console.warn("User session check:", err.message);
      if (requestId === requestIdRef.current) {
        const isAuthError =
          err?.status === 401 ||
          err?.statusCode === 401 ||
          err?.code === "UNAUTHORIZED" ||
          err?.code === "TOKEN_EXPIRED" ||
          err?.code === "TOKEN_INVALID" ||
          (typeof err?.message === "string" &&
            (err.message.includes("401") ||
              err.message.toLowerCase().includes("session has expired") ||
              err.message
                .toLowerCase()
                .includes("invalid or expired refresh token") ||
              err.message.toLowerCase().includes("please log in to continue")));

        if (isAuthError) {
          setUser(null);
          clearAuthCookies();
          localStorage.removeItem("rifah_access_token");
          localStorage.removeItem("rifah_refresh_token");
          localStorage.removeItem("rifah_user");
        } else {
          // Non-auth error (e.g. temporary network glitch or server restart)
          // Retain cached user so panels do not panic-redirect
          const cachedUserStr =
            typeof window !== "undefined"
              ? localStorage.getItem("rifah_user")
              : null;
          if (cachedUserStr) {
            try {
              setUser(JSON.parse(cachedUserStr));
            } catch (_) {}
          }
        }
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Proactive session keep-alive: quietly renew access token every 10 minutes so users are never kicked out
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("rifah_refresh_token")
          : null;
      if (!refreshToken) return;
      try {
        const res = await authApi.refreshToken(refreshToken);
        const data = res?.data || res;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;
        if (newAccessToken && typeof window !== "undefined") {
          localStorage.setItem("rifah_access_token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("rifah_refresh_token", newRefreshToken);
          }
        }
      } catch (_) {
        // Silent catch: api-client will handle refresh whenever an actual request is made
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user]);

  const login = async (emailOrCredentials, passwordArg) => {
    // Supports both: login({email, password}) and login(email, password)
    const credentials =
      typeof emailOrCredentials === "string"
        ? { email: emailOrCredentials, password: passwordArg }
        : emailOrCredentials;

    requestIdRef.current++; // Invalidate any pending in-flight fetchCurrentUser
    localStorage.removeItem("rifah_access_token");
    localStorage.removeItem("rifah_refresh_token");
    localStorage.removeItem("rifah_user");

    const res = await authApi.login(credentials);
    const payload = res.data || res;
    const loggedInUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (loggedInUser) {
      requestIdRef.current++; // Invalidate any concurrent requests
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      syncAuthCookies(accessToken, loggedInUser);
    }
    try {
      queryClient.clear();
      await queryClient.invalidateQueries();
    } catch (e) {}
    return {
      ...loggedInUser,
      requirePasswordReset:
        loggedInUser?.forcePasswordChange || payload.requirePasswordReset,
      requiresRoleSelection: payload.requiresRoleSelection,
      availableRoles: payload.availableRoles,
      availableWorkspaces: payload.availableWorkspaces,
    };
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const payload = res.data || res;
    const registeredUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (registeredUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(registeredUser));
      setUser(registeredUser);
      syncAuthCookies(accessToken, registeredUser);
    }
    return registeredUser;
  };

  const registerBusiness = async (data) => {
    const res = await authApi.registerBusiness(data);
    const payload = res.data || res;
    const registeredUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (registeredUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(registeredUser));
      setUser(registeredUser);
      syncAuthCookies(accessToken, registeredUser);
    }
    return registeredUser;
  };

  const loginWithGoogle = async (data) => {
    const res = await authApi.googleAuth(data);
    const payload = res.data || res;
    const loggedInUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (loggedInUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      syncAuthCookies(accessToken, loggedInUser);
    }
    return loggedInUser;
  };

  const loginWithOtp = async (email, otp) => {
    const res = await authApi.verifyLoginOtp(email, otp);
    const payload = res.data || res;
    const loggedInUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (loggedInUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      syncAuthCookies(accessToken, loggedInUser);
    }
    try {
      queryClient.clear();
      await queryClient.invalidateQueries();
    } catch (e) {}
    return {
      ...loggedInUser,
      requiresRoleSelection: false,
      availableRoles: [loggedInUser?.role],
    };
  };

  const completeOnboarding = async (data) => {
    const res = await authApi.completeOnboarding(data);
    const payload = res.data || res;
    const loggedInUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (loggedInUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      syncAuthCookies(accessToken, loggedInUser);
    }
    return loggedInUser;
  };

  const changePassword = async (data) => {
    const res = await authApi.changePassword(data);
    const payload = res.data || res;
    const updatedUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (updatedUser) {
      requestIdRef.current++;
      localStorage.setItem("rifah_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      syncAuthCookies(accessToken, updatedUser);
    }
    return updatedUser;
  };

  const logout = () => {
    requestIdRef.current++;
    // Revoke the session server-side. Must start before the token is cleared below (apiClient
    // reads it synchronously); failure is harmless because local credentials are dropped anyway.
    if (localStorage.getItem("rifah_access_token")) {
      authApi.logout().catch(() => {});
    }
    clearAuthCookies();
    localStorage.removeItem("rifah_access_token");
    localStorage.removeItem("rifah_refresh_token");
    localStorage.removeItem("rifah_user");
    setUser(null);
    try {
      queryClient.clear();
    } catch (e) {}
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  const toggleSaveBusiness = async () => {
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token:
          typeof window !== "undefined"
            ? localStorage.getItem("rifah_access_token")
            : null,
        login,
        loginWithOtp,
        loginWithGoogle,
        completeOnboarding,
        register,
        registerBusiness,
        changePassword,
        logout,
        toggleSaveBusiness,
        refreshProfile,
        refreshUser: refreshProfile,
        isAuthenticated: !!user,
        role: user?.role || "guest",
        requiresRoleSelection: user?.requiresRoleSelection,
        availableRoles: user?.availableRoles,
        availableWorkspaces: user?.availableWorkspaces,
        activeWorkspace: user?.activeWorkspace,
        switchRole: async (targetRole, targetWorkspaceId = null) => {
          const res = await authApi.switchRole(targetRole, targetWorkspaceId);
          const payload = res.data || res;
          const loggedInUser = payload.user;
          const accessToken =
            payload.accessToken || payload.tokens?.accessToken;
          const refreshToken =
            payload.refreshToken || payload.tokens?.refreshToken;
          if (accessToken)
            localStorage.setItem("rifah_access_token", accessToken);
          if (refreshToken)
            localStorage.setItem("rifah_refresh_token", refreshToken);
          if (loggedInUser) {
            requestIdRef.current++;
            localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            syncAuthCookies(accessToken, loggedInUser);
          }
          try {
            queryClient.clear();
            await queryClient.invalidateQueries();
          } catch (e) {}
          // Return user with businessId/businessSlug or activeWorkspace
          return loggedInUser;
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
