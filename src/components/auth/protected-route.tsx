/**
 * Protected route wrapper component
 * Uses localStorage directly to check auth (no Zustand hydration issues)
 */
'use client';

import { useEffect, useState } from 'react';
import { STORAGE_KEY } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage directly
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.cardNumber) {
          setIsAuthenticated(true);
          return;
        }
      } catch {}
    }
    // Not authenticated - redirect
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  // Show loading spinner while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
