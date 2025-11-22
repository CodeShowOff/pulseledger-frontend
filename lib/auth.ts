// src/lib/auth.ts
export const protectedRoutes = {
  client: ["/client"],
  coach: ["/coach"],
  admin: ["/admin"],
};

export const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/register/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/footer-pages/about",
  "/footer-pages/contact",
];
// Public route prefixes (entire sections that are public)
export const publicRoutePrefixes = [
  "/footer-pages",
  "/public",
  "/auth",
];

export function getAllowedBasePath(role: string): string {
  switch (role) {
    case "client":
      return "/client";
    case "coach":
      return "/coach";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
