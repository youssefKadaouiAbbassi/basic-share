'use client';

import { ChevronRight, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { STORAGE_KEY } from '@/lib/constants';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already logged in - redirect to QR code
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.cardNumber) {
          window.location.replace('/qrcode');
          return;
        }
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Layered ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow - warm orange */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
          }}
        />
        {/* Secondary glow - subtle warm undertone */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(ellipse, #fb923c 0%, transparent 70%)',
          }}
        />
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div
        className={`relative z-10 flex flex-col items-center max-w-sm w-full transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* App icon with refined styling */}
        <div className="relative mb-10" role="img" aria-label="BasicShare app icon">
          {/* Outer glow ring */}
          <div className="absolute -inset-3 bg-orange-500/20 rounded-[2rem] blur-xl" aria-hidden="true" />
          {/* Icon container */}
          <div className="relative w-[88px] h-[88px] rounded-[1.75rem] bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 p-[1px] shadow-2xl shadow-orange-500/25">
            <div className="w-full h-full rounded-[calc(1.75rem-1px)] bg-gradient-to-b from-orange-500 to-orange-600 flex items-center justify-center">
              <QrCode className="w-11 h-11 text-white drop-shadow-sm" strokeWidth={2.25} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Hero text with refined typography */}
        <h1 className="text-[2.75rem] font-bold text-white mb-3 tracking-tight leading-none">
          BasicShare
        </h1>
        <p className="text-zinc-400 text-lg mb-14 text-center leading-relaxed font-light">
          Generate Basic-Fit gym QR codes
        </p>

        {/* Primary CTA button */}
        <a
          href="/login"
          aria-label="Get started with BasicShare"
          className="group w-full flex items-center justify-center gap-2 py-[18px] px-6 rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 text-white font-semibold text-[17px] transition-all duration-200 shadow-lg shadow-orange-500/30 active:scale-[0.98] active:shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 relative overflow-hidden"
        >
          {/* Subtle top highlight */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden="true" />
          <span>Get Started</span>
          <ChevronRight
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </a>

        {/* Trust indicator */}
        <div className="mt-12 flex items-center gap-2 text-zinc-600" role="status" aria-live="polite">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-sm font-medium">Stored securely on your device</span>
        </div>

        {/* Developer credit */}
        <a
          href="https://github.com/youssefKadaouiAbbassi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Youssef Kadaoui Abbassi's GitHub profile"
          className="mt-8 flex items-center gap-2 text-zinc-700 hover:text-zinc-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-md px-2 py-1 -mx-2 -my-1 group"
        >
          <span className="text-xs font-medium">Made by</span>
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-xs font-medium">Youssef Kadaoui Abbassi</span>
        </a>
      </div>
    </div>
  );
}
