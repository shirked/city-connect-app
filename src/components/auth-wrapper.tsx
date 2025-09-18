
"use client";

import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "./app-header";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Since the user is now mocked and isLoading is always false,
  // the header will always be shown.
  const showHeader = !isLoading && user;

  return (
    <div className="flex min-h-screen w-full flex-col">
        {showHeader && <AppHeader />}
        {children}
    </div>
  );
}
