"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

const ALLOWED_ROLES = ["super_admin", "secretariat"];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "chapter_admin") {
      router.replace("/chapter-admin");
    } else if (!ALLOWED_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return children;
}
