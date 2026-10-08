"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

// secretariat is central_admin's equal (see backend roles.js / login-page.jsx)
const ALLOWED_ROLES = ["central_admin", "secretariat", "admin", "super_admin"];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "state_admin") {
      router.replace("/state-admin");
    } else if (user.role === "chapter_admin") {
      router.replace("/chapter-admin");
    } else if (!ALLOWED_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (!loading && user && !ALLOWED_ROLES.includes(user.role)) return null; // redirect effect above handles navigation

  return children;
}
