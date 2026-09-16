"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

export default function ChapterAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "super_admin") {
      router.replace("/admin");
    } else if (user.role === "state_admin") {
      // If state_admin navigates to the chapter-admin root overview, redirect to state-admin executive desk
      if (pathname === "/chapter-admin") {
        router.replace("/state-admin");
      }
      // Subroutes (/chapter-admin/businesses, /chapter-admin/verification, etc.) are allowed
    } else if (user.role !== "chapter_admin") {
      router.replace("/");
    }
  }, [user, loading, router, pathname]);

  return children;
}
