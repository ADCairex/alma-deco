"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type AdminSessionProviderProps = {
  children: ReactNode;
  session: Session | null;
};

export function AdminSessionProvider({ children, session }: AdminSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
