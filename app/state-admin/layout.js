"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

export default function StateAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "central_admin") {
      // Central Admin has overview across both admin and state admin
      return;
    }
    if (user.role === "chapter_admin") {
      router.replace("/chapter-admin");
    } else if (user.role === "business_owner") {
      router.replace("/biz");
    } else if (user.role !== "state_admin") {
      router.replace("/biz");
    }
  }, [user, loading, router]);

  return children;
}
