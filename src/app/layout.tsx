import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';
import { AuthWrapper } from '@/components/auth-wrapper';

export const metadata: Metadata = {
  title: 'Civic Connect',
  description: 'Report civic issues in your city.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <Providers>
          <AuthWrapper>
            <div className="relative z-10">{children}</div>
            <Toaster />
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
