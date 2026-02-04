'use client';

import { Pause, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import { STORAGE_KEY } from '@/lib/constants';

const REFRESH_INTERVAL = 5000; // 5 seconds

interface AuthData {
  cardNumber: string;
  deviceId: string;
  persistentGuid: string;
}

function generateHash(cardNumber: string, guid: string, time: number, deviceId: string): string {
  const input = `${cardNumber}${guid}${time}${deviceId}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(-8);
}

function generateQRData(cardNumber: string, deviceId: string, guid: string): string {
  const time = Math.floor(Date.now() / 1000);
  const hash = generateHash(cardNumber, guid, time, deviceId);
  return `GM2:${cardNumber}:${guid}:${time}:${hash}`;
}

export default function QRCodeContent() {
  const [authData] = useState<AuthData | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as AuthData;
        if (data.cardNumber) return data;
      } catch {}
    }
    return null;
  });

  const [qrData, setQrData] = useState('');
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track page visibility - pause when app is in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Redirect if no auth
  useEffect(() => {
    if (!authData) {
      window.location.href = '/login';
    }
  }, [authData]);

  // Generate QR code function
  const generate = useCallback(() => {
    if (!authData) return;
    const qr = generateQRData(authData.cardNumber, authData.deviceId, authData.persistentGuid);
    setQrData(qr);
    setProgress(0);
  }, [authData]);

  // QR generation - only when visible
  useEffect(() => {
    if (!authData || !isVisible) return;

    // Generate immediately when becoming visible
    generate();

    const interval = setInterval(generate, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [authData, isVisible, generate]);

  // Progress bar - only when visible
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!authData) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 flex flex-col relative overflow-auto">
      {/* Layered ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow behind QR area */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
          }}
        />
        {/* Secondary ambient glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[800px] h-[400px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(ellipse, rgba(251, 146, 60, 0.04) 0%, transparent 70%)',
          }}
        />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content - QR Code Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 py-4 sm:py-8">
        <div
          className={`w-full max-w-sm transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* QR Code Container - The Hero */}
          <div className="relative mb-4 sm:mb-8">
            {/* Animated pulse ring - shows "live" status */}
            <div
              className={`absolute inset-0 rounded-2xl sm:rounded-[2rem] transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 rounded-2xl sm:rounded-[2rem] bg-orange-500/20 animate-ping"
                style={{ animationDuration: '3s' }}
              />
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-3 sm:-inset-4 bg-orange-500/15 rounded-[1.75rem] sm:rounded-[2.5rem] blur-2xl" />

            {/* QR Card */}
            <div className="relative bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl shadow-black/50">
              {/* Inner border highlight */}
              <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] sm:rounded-[calc(2rem-1px)] border border-black/5 pointer-events-none" />

              {/* QR Code */}
              <div className="relative">
                {qrData ? (
                  <QRCodeSVG
                    value={qrData}
                    size={280}
                    level="M"
                    className="w-full h-auto"
                    bgColor="#ffffff"
                    fgColor="#09090b"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card info panel */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 sm:mb-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-0.5 sm:mb-1">
                  Card Number
                </p>
                <p className="text-orange-500 font-mono text-base sm:text-xl font-semibold tracking-wider truncate">
                  {authData.cardNumber}
                </p>
              </div>
              {/* Status indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isVisible ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                  {isVisible ? 'Live' : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2 sm:space-y-3">
            {/* Progress bar */}
            <div className="h-1 bg-zinc-900/80 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
                }}
              />
            </div>

            {/* Refresh indicator */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-zinc-500">
              {isVisible ? (
                <>
                  <RefreshCw className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Auto-refresh every 5 seconds
                  </span>
                </>
              ) : (
                <>
                  <Pause className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Paused while in background
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer
        className={`relative z-10 text-center px-4 sm:px-6 py-4 sm:py-6 transition-all duration-500 delay-200 flex-shrink-0 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-zinc-600 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4">
          Present this code at the gym entrance scanner
        </p>
        <a
          href="https://github.com/youssefKadaouiAbbassi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-zinc-700 hover:text-zinc-500 transition-colors duration-200 group"
        >
          <span className="text-[10px] sm:text-xs font-medium">Made by</span>
          <svg
            className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-[10px] sm:text-xs font-medium">Youssef Kadaoui Abbassi</span>
        </a>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
