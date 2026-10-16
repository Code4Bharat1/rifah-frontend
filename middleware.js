import { NextResponse } from "next/server";

const PROTECTED_PANELS = [
  "/admin",
  "/state-admin",
  "/chapter-admin",
  "/biz",
  "/user",
];

const ADMIN_ROLES = [
  "central_admin",
  "secretariat",
  "country_admin",
  "admin",
  "super_admin",
];

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("rifah_access_token")?.value;
  const role = request.cookies.get("rifah_user_role")?.value;

  const isProtected = PROTECTED_PANELS.some(
    (panel) => pathname === panel || pathname.startsWith(`${panel}/`)
  );

  // 1. Unauthenticated users trying to access any protected panel -> Immediate redirect to /login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based panel isolation when role cookie is available
  if (isProtected && role) {
    const isMember =
      role === "customer" || role === "buyer" || role === "user";
    const isCentralAdmin = ADMIN_ROLES.includes(role);
    const isStateAdmin = role === "state_admin";
    const isChapterAdmin = role === "chapter_admin";
    const isBusinessOwner = role === "business_owner" || role === "business";

    const matchesPanel = (panel) =>
      pathname === panel || pathname.startsWith(`${panel}/`);

    // Members should never access admin, state-admin, chapter-admin, or biz panels
    if (
      isMember &&
      (matchesPanel("/admin") ||
        matchesPanel("/state-admin") ||
        matchesPanel("/chapter-admin") ||
        matchesPanel("/biz"))
    ) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Business owners should not access admin panels or member user panel
    if (
      isBusinessOwner &&
      (matchesPanel("/admin") ||
        matchesPanel("/state-admin") ||
        matchesPanel("/chapter-admin") ||
        matchesPanel("/user"))
    ) {
      return NextResponse.redirect(new URL("/biz", request.url));
    }

    // Chapter Admins should not access other admin panels, biz, or member user panel
    if (
      isChapterAdmin &&
      (matchesPanel("/admin") ||
        matchesPanel("/state-admin") ||
        matchesPanel("/biz") ||
        matchesPanel("/user"))
    ) {
      return NextResponse.redirect(new URL("/chapter-admin", request.url));
    }

    // State Admins should not access central admin, chapter admin, biz, or member user panel
    if (
      isStateAdmin &&
      (matchesPanel("/admin") ||
        matchesPanel("/chapter-admin") ||
        matchesPanel("/biz") ||
        matchesPanel("/user"))
    ) {
      return NextResponse.redirect(new URL("/state-admin", request.url));
    }

    // Central Admins should not access state admin, chapter admin, biz, or member user panel
    if (
      isCentralAdmin &&
      (matchesPanel("/state-admin") ||
        matchesPanel("/chapter-admin") ||
        matchesPanel("/biz") ||
        matchesPanel("/user"))
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/state-admin/:path*",
    "/chapter-admin/:path*",
    "/biz/:path*",
    "/user/:path*",
  ],
};
