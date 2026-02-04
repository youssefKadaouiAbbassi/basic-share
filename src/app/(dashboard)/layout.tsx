'use client';

import { LogOut } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem('basicshare_auth');
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
      <div className="h-full w-full bg-zinc-950 flex flex-col overflow-hidden">
        {/* Header with Sign Out - static, doesn't re-render */}
        <header className="relative z-10 px-4 sm:px-5 pt-3 sm:pt-5 pb-2 flex justify-between items-start flex-shrink-0">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Your Gym Pass
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-zinc-500 text-xs sm:text-sm font-medium">
                Ready to scan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-500 hover:text-white active:text-zinc-300 px-4 py-3 rounded-xl min-h-[48px] bg-zinc-900/50 border border-zinc-800"
            style={{ touchAction: 'manipulation' }}
          >
            <LogOut className="w-5 h-5 pointer-events-none" strokeWidth={2} />
            <span className="text-sm font-medium pointer-events-none">Sign Out</span>
          </button>
        </header>
        {/* Content area - flex-1 takes remaining space, contained within viewport */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
