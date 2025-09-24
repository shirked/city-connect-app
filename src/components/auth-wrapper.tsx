
"use client";

import { useAuth } from "@/hooks/use-auth";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Since the user is now mocked and isLoading is always false,
  // the header will always be shown.
  const showHeader = !isLoading && user;

  return (
    <div className="flex min-h-screen w-full flex-col">
        {/* The header is now always rendered in the RootLayout */}
        {children}
    </div>
  );
}
