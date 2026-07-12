const platformAdminRoutePrefixes = [
  "/admin/dashboard",
  "/admin/leads",
  "/admin/discovery",
  "/admin/follow-ups",
  "/admin/clients",
  "/admin/proposals",
  "/admin/client-projects",
  "/admin/onboarding",
  "/admin/packages",
] as const;

export function isPlatformAdminRoute(pathname: string) {
  return platformAdminRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
