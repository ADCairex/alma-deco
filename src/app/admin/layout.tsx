import type { ReactNode } from "react";

import { auth } from "@/auth";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <AdminSessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
