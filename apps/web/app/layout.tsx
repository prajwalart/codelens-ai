import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeLens AI - Code Intelligence',
  description: 'AI-Powered Developer Intelligence and Automated Code Review Platform',
};

import { NextAuthProvider } from '@/components/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <NextAuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
