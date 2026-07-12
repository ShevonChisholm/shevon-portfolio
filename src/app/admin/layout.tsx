import { ReactNode } from "react";
import { AdminNotificationsProvider } from "@/components/admin/notifications/AdminNotifications";
import AdminShell from "./AdminShell";
import AdminRouteGuard from "./AdminRouteGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminNotificationsProvider>
      <AdminRouteGuard>
        <AdminShell>{children}</AdminShell>
      </AdminRouteGuard>
    </AdminNotificationsProvider>
  );
}
