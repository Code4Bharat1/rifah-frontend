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
    if (user.role === "state_admin") {
      // If state_admin navigates to the chapter-admin root overview or verification, redirect to state-admin executive desk
      if (pathname === "/chapter-admin" || pathname.startsWith("/chapter-admin/verification")) {
        router.replace("/state-admin");
      } else if (pathname === "/chapter-admin/chapter") {
        router.replace("/state-admin/chapters");
      } else if (pathname === "/chapter-admin/leads") {
        router.replace("/chapter-admin/enquiries");
      }
      // Other subroutes (/chapter-admin/businesses, /chapter-admin/users, /chapter-admin/audit, etc.) are allowed
    } else if (user.role !== "chapter_admin" && user.role !== "central_admin") {
      router.replace("/");
    }
  }, [user, loading, router, pathname]);

  return children;
}
