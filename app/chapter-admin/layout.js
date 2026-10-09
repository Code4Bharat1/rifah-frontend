"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

function isRoutePermitted(pathname, allowedRoutes) {
  if (!Array.isArray(allowedRoutes) || allowedRoutes.length === 0) return false;
  const cleanPath = (pathname || "").replace(/\/$/, "");

  return allowedRoutes.some((route) => {
    const cleanRoute = (route || "").replace(/\/$/, "");
    if (!cleanRoute) return false;

    if (cleanPath === cleanRoute) return true;

    const panelRoots = ["/admin", "/state-admin", "/chapter-admin"];
    if (panelRoots.includes(cleanRoute)) {
      return false;
    }

    return cleanPath.startsWith(cleanRoute + "/");
  });
}

export default function ChapterAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;

    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "chapter-admin") {
        router.replace("/");
        return;
      }
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) {
        const fallback = allowed[0] || "/chapter-admin";
        if (pathname !== fallback) {
          router.replace(fallback);
        }
      }
      return;
    }

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
    } else if (
      user.activeWorkspace?.panelType !== "chapter-admin" &&
      user.role !== "chapter_admin" &&
      user.role !== "central_admin" &&
      user.role !== "secretariat"
    ) {
      router.replace("/");
    }
  }, [user, loading, router, pathname]);

  if (!loading && user) {
    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "chapter-admin") return null;
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) return null;
    } else if (
      user.activeWorkspace?.panelType !== "chapter-admin" &&
      !["chapter_admin", "central_admin", "secretariat", "state_admin"].includes(user.role)
    ) {
      return null;
    }
  }

  return children;
}
