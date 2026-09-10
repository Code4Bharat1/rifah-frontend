"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

export default function ChapterAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (["super_admin", "secretariat"].includes(user.role)) {
      router.replace("/admin");
    } else if (user.role !== "chapter_admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  return children;
}
