'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { STORAGE_KEY } from '@/lib/constants';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!showLogoutConfirm) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showLogoutConfirm]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
      <div className="h-full w-full bg-zinc-950 flex flex-col overflow-hidden">
        {/* Header with Sign Out - static, doesn't re-render */}
        <header
          className="relative z-10 px-4 sm:px-5 pt-3 sm:pt-5 pb-2 flex justify-between items-start flex-shrink-0"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            paddingLeft: 'max(1rem, env(safe-area-inset-left))',
            paddingRight: 'max(1rem, env(safe-area-inset-right))',
          }}
        >
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Your Gym Pass
            </h1>
            <div
              className="flex items-center gap-1.5 mt-0.5 sm:mt-1"
              role="status"
              aria-live="polite"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <p className="text-zinc-500 text-xs sm:text-sm font-medium">Ready to scan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white active:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-950 px-4 py-3 rounded-xl min-h-[48px] bg-zinc-900/50 border border-zinc-800 transition-colors"
            style={{ touchAction: 'manipulation' }}
            aria-label="Sign out of your account"
          >
            <LogOut className="w-5 h-5 pointer-events-none" strokeWidth={2} aria-hidden="true" />
            <span className="text-sm font-medium pointer-events-none">Sign Out</span>
          </button>
        </header>
        {/* Content area - flex-1 takes remaining space, contained within viewport */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
          role="presentation"
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <h2 id="logout-dialog-title" className="text-lg font-semibold text-white mb-2">Sign Out?</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Your card number will be removed from this device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
