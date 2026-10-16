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

    // Members should never access admin, state-admin, chapter-admin, or biz panels
    if (
      isMember &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/state-admin") ||
        pathname.startsWith("/chapter-admin") ||
        pathname.startsWith("/biz"))
    ) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    // Admins should not wander into member /user workspace unless via explicit switch
    if (pathname === "/user" || pathname.startsWith("/user/")) {
      if (isCentralAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (isStateAdmin) {
        return NextResponse.redirect(new URL("/state-admin", request.url));
      }
      if (isChapterAdmin) {
        return NextResponse.redirect(new URL("/chapter-admin", request.url));
      }
      if (isBusinessOwner) {
        return NextResponse.redirect(new URL("/biz", request.url));
      }
    }

    // Business owners should not access admin panels
    if (
      isBusinessOwner &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/state-admin") ||
        pathname.startsWith("/chapter-admin"))
    ) {
      return NextResponse.redirect(new URL("/biz", request.url));
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
