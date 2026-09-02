"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, userApi } from "../lib/api-services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      const userData = res?.data || res;
      setUser(userData);
      localStorage.setItem("rifah_user", JSON.stringify(userData));
    } catch (err) {
      console.warn("Session expired or invalid token:", err.message);
      setUser(null);
      localStorage.removeItem("rifah_access_token");
      localStorage.removeItem("rifah_refresh_token");
      localStorage.removeItem("rifah_user");
    } finally {
      setLoading(false);
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
      localStorage.setItem("rifah_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    }
    return loggedInUser;
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
      localStorage.setItem("rifah_user", JSON.stringify(registeredUser));
      setUser(registeredUser);
    }
    return registeredUser;
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
      localStorage.setItem("rifah_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem("rifah_access_token");
    localStorage.removeItem("rifah_refresh_token");
    localStorage.removeItem("rifah_user");
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        completeOnboarding,
        register,
        registerBusiness,
        changePassword,
        logout,
        refreshProfile,
        refreshUser: refreshProfile,
        isAuthenticated: !!user,
        role: user?.role || "guest",
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
