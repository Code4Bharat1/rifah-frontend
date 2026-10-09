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

export default function StateAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;

    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "state-admin") {
        router.replace("/");
        return;
      }
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) {
        const fallback = allowed[0] || "/state-admin";
        if (pathname !== fallback) {
          router.replace(fallback);
        }
      }
      return;
    }

    if (user.role === "central_admin" || user.role === "secretariat") {
      return;
    }
    if (user.activeWorkspace?.panelType === "state-admin") {
      return;
    }
    if (user.role === "chapter_admin") {
      router.replace("/chapter-admin");
    } else if (user.role === "business_owner") {
      router.replace("/biz");
    } else if (user.role !== "state_admin") {
      router.replace("/biz");
    }
  }, [user, loading, router, pathname]);

  if (!loading && user) {
    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "state-admin") return null;
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) return null;
    } else if (
      user.activeWorkspace?.panelType !== "state-admin" &&
      !(["central_admin", "secretariat", "state_admin"]).includes(user.role)
    ) {
      return null;
    }
  }

  return children;
}
