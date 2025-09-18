
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const showHeader = !isLoading && user && pathname !== '/login';

  return (
    <div className="flex min-h-screen w-full flex-col">
        {showHeader && <AppHeader />}
        {children}
    </div>
  );
}
