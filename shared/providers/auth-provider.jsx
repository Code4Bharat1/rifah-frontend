"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, userApi } from "../lib/api-services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

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
    const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
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
    } catch (err) {
      console.warn("Session expired or invalid token:", err.message);
      if (requestId === requestIdRef.current) {
        setUser(null);
        localStorage.removeItem("rifah_access_token");
        localStorage.removeItem("rifah_refresh_token");
        localStorage.removeItem("rifah_user");
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (emailOrCredentials, passwordArg) => {
    // Supports both: login({email, password}) and login(email, password)
    const credentials =
      typeof emailOrCredentials === "string"
        ? { email: emailOrCredentials, password: passwordArg }
        : emailOrCredentials;

    const res = await authApi.login(credentials);
    const payload = res.data || res;
    const loggedInUser = payload.user;
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    if (accessToken) localStorage.setItem("rifah_access_token", accessToken);
    if (refreshToken) localStorage.setItem("rifah_refresh_token", refreshToken);
    if (loggedInUser) {
      requestIdRef.current++; // invalidate any in-flight fetchCurrentUser (BUG-013)
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    }
    try {
      queryClient.clear();
      await queryClient.invalidateQueries();
    } catch (e) {}
    return { 
      ...loggedInUser, 
      requirePasswordReset: loggedInUser?.forcePasswordChange || payload.requirePasswordReset,
      requiresRoleSelection: payload.requiresRoleSelection,
      availableRoles: payload.availableRoles 
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
    }
    return loggedInUser;
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
    }
    return updatedUser;
  };

  const logout = () => {
    requestIdRef.current++;
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
        token: typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null,
        login,
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
        switchRole: async (targetRole) => {
          const res = await authApi.switchRole(targetRole);
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
          }
          try {
            queryClient.clear();
            await queryClient.invalidateQueries();
          } catch (e) {}
          // Return user with businessId/businessSlug if admin switched to business_owner
          return loggedInUser;
        }
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
