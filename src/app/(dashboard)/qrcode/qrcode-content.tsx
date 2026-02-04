'use client';

import { CheckCircle, Pause, RefreshCw, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import { Spinner } from '@/components/ui/spinner';
import { type AccessResult, checkAccessResult } from '@/lib/api/basic-fit';
import {
  ACCESS_CHECK_INTERVAL,
  QR_ERROR_LEVEL,
  QR_REFRESH_INTERVAL,
  QR_SIZE,
  STORAGE_KEY,
} from '@/lib/constants';

interface AuthData {
  cardNumber: string;
  deviceId: string;
  persistentGuid: string;
}

async function generateHash(
  cardNumber: string,
  guid: string,
  time: number,
  deviceId: string
): Promise<string> {
  const input = `${cardNumber}${guid}${time}${deviceId}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  // Return last 8 characters uppercase (matches reference implementation)
  return hashHex.slice(-8).toUpperCase();
}

async function generateQRData(cardNumber: string, deviceId: string, guid: string): Promise<string> {
  const time = Math.floor(Date.now() / 1000);
  const hash = await generateHash(cardNumber, guid, time, deviceId);
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
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);

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
  const generate = useCallback(async () => {
    if (!authData) return;
    const qr = await generateQRData(
      authData.cardNumber,
      authData.deviceId,
      authData.persistentGuid
    );
    setQrData(qr);
    setAnimationKey((prev) => prev + 1);
  }, [authData]);

  // QR generation - only when visible
  useEffect(() => {
    if (!authData || !isVisible) return;

    // Generate immediately when becoming visible
    generate();

    const interval = setInterval(generate, QR_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [authData, isVisible, generate]);

  // Check access result periodically
  useEffect(() => {
    if (!authData || !isVisible) return;

    const checkAccess = async () => {
      try {
        const result = await checkAccessResult(authData.cardNumber);
        setAccessResult(result);
      } catch {
        // Silent fail - access check is optional
      }
    };

    // Check immediately and then periodically
    checkAccess();
    const interval = setInterval(checkAccess, ACCESS_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [authData, isVisible]);

  if (!authData) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* Layered ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow behind QR area */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[600px] h-[600px] rounded-full ambient-glow-primary" />
        {/* Secondary ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[800px] h-[400px] rounded-full opacity-50 ambient-glow-secondary" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.012] noise-texture" />
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
            <div className="relative bg-[#fefdfb] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl shadow-black/40">
              {/* Inner border highlight */}
              <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] sm:rounded-[calc(2rem-1px)] border border-black/5 pointer-events-none" />

              {/* QR Code with cross-fade transition */}
              <div className="relative aspect-square">
                {/* Spinner layer - fades out when QR ready */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    qrData ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <Spinner size="lg" />
                </div>
                {/* QR layer - fades in when ready */}
                <div
                  key={animationKey}
                  className={`transition-opacity duration-300 animate-qr-refresh ${
                    qrData ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {qrData && (
                    <QRCodeSVG
                      value={qrData}
                      size={QR_SIZE}
                      level={QR_ERROR_LEVEL}
                      className="w-full h-auto"
                      bgColor="#fefdfb"
                      fgColor="#09090b"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card info panel */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 sm:mb-5 hover:bg-zinc-900/90 hover:border-zinc-700/80 transition-colors cursor-default">
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
                key={animationKey}
                className="h-full rounded-full progress-bar-gradient"
                style={{
                  width: '0%',
                  animation: isVisible ? 'progress-fill 5s linear forwards' : 'none',
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

          {/* Last scan status */}
          {accessResult && (
            <div
              className={`mt-4 p-3 rounded-xl border ${
                accessResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {accessResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${accessResult.success ? 'text-emerald-400' : 'text-zinc-400'}`}
                  >
                    {accessResult.success ? 'Entry Granted' : 'No recent scan'}
                  </p>
                  {accessResult.gymName && (
                    <p className="text-xs text-zinc-500 truncate">{accessResult.gymName}</p>
                  )}
                  {accessResult.timestamp && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {new Date(accessResult.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
            aria-hidden="true"
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
