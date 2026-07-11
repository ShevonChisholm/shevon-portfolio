import { ReactNode } from "react";
import ClientPortalShell from "./ClientPortalShell";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <ClientPortalShell>{children}</ClientPortalShell>;
}
