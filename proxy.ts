import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes, publicRoutePrefixes, getAllowedBasePath } from "./lib/auth";

// Edge-safe JWT decode (Base64URL via atob)
function safeJwtDecode(token: string) {
  try {
    const payload = token.split(".")[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

interface DecodedToken {
  id: string;
  role: "client" | "coach" | "admin";
  exp: number;
}

// Main guard exported as `proxy` per existing project convention
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value || null;
  const refreshToken = req.cookies.get("refreshToken")?.value || null;

  // 0) Always allow framework/static/assets/api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    // Allow all files with common static file extensions from public folder
    /\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf|css|js|json|xml|txt|pdf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1) Allow public routes (no auth required)
  if (publicRoutes.includes(pathname)) return NextResponse.next();
  if (publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2) If no access token but refresh token exists, allow page load so client can refresh silently
  if (!accessToken && refreshToken) {
    return NextResponse.next();
  }

  // 3) If neither token present -> redirect to login
  if (!accessToken) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4) Decode JWT; if malformed, but refresh exists allow client-side recovery
  const decoded: DecodedToken | null = safeJwtDecode(accessToken);
  if (!decoded) {
    if (refreshToken) return NextResponse.next();
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5) Expired access token: let through if refresh cookie present, else redirect
  if (decoded.exp * 1000 < Date.now()) {
    if (refreshToken) return NextResponse.next();
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("session", "expired");
    return NextResponse.redirect(loginUrl);
  }

  // 6) Role-based path enforcement
  const allowedBase = getAllowedBasePath(decoded.role);
  const roleBases = ["/client", "/coach", "/admin"];
  const isRoleSection = roleBases.some((b) => pathname.startsWith(b));
  if (isRoleSection && !pathname.startsWith(allowedBase)) {
    const redirectUrl = new URL(allowedBase + "/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 7) Valid
  return NextResponse.next();
}

export const config = {
  // Intercept almost everything; early-return inside for assets/api
  matcher: ["/:path*"],
};

