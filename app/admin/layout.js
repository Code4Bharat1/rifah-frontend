"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@shared/providers/auth-provider";

// secretariat is central_admin's equal (see backend roles.js / login-page.jsx)
const ALLOWED_ROLES = ["central_admin", "secretariat", "admin", "super_admin"];

function isRoutePermitted(pathname, allowedRoutes) {
  if (!Array.isArray(allowedRoutes) || allowedRoutes.length === 0) return false;
  const cleanPath = (pathname || "").replace(/\/$/, "");

  return allowedRoutes.some((route) => {
    const cleanRoute = (route || "").replace(/\/$/, "");
    if (!cleanRoute) return false;

    // Exact match
    if (cleanPath === cleanRoute) return true;

    // Root dashboard must never match other subroutes
    const panelRoots = ["/admin", "/state-admin", "/chapter-admin"];
    if (panelRoots.includes(cleanRoute)) {
      return false;
    }

    // Sub-path of an allowed non-root module (e.g. /admin/events/123)
    return cleanPath.startsWith(cleanRoute + "/");
  });
}

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;

    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "central-admin") {
        router.replace("/");
        return;
      }
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) {
        const fallback = allowed[0] || "/admin";
        if (pathname !== fallback) {
          router.replace(fallback);
        }
      }
      return;
    }

    if (user.activeWorkspace?.panelType === "central-admin") {
      return;
    }
    if (user.role === "state_admin") {
      router.replace("/state-admin");
    } else if (user.role === "chapter_admin") {
      router.replace("/chapter-admin");
    } else if (!ALLOWED_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, router, pathname]);

  if (!loading && user) {
    if (user.activeWorkspace?.type === "org_role") {
      if (user.activeWorkspace.panelType !== "central-admin") return null;
      const allowed = user.activeWorkspace.allowedNavRoutes || [];
      if (!isRoutePermitted(pathname, allowed)) return null;
    } else if (user.activeWorkspace?.panelType !== "central-admin" && !ALLOWED_ROLES.includes(user.role)) {
      return null;
    }
  }

  return children;
}
