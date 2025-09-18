
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since login is disabled for the prototype
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
       <Loader2 className="h-10 w-10 animate-spin text-primary" />
       <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
