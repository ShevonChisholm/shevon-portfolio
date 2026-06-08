import { ReactNode } from "react";
import { AdminNotificationsProvider } from "@/components/admin/notifications/AdminNotifications";
import AdminShell from "./AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminNotificationsProvider>
      <AdminShell>{children}</AdminShell>
    </AdminNotificationsProvider>
  );
}
