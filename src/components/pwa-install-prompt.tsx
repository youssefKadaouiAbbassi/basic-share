'use client';

import { Download, Plus, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'basicshare_install_dismissed';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already installed or dismissed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem(STORAGE_KEY);

    if (isStandalone || dismissed) return;

    // Detect platform
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setPlatform('ios');
      // iOS Safari doesn't support beforeinstallprompt
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
      if (isSafari) {
        setTimeout(() => setShow(true), 1000);
      }
    } else {
      const detectedPlatform = isAndroid ? 'android' : 'desktop';
      setPlatform(detectedPlatform);
    }

    // Listen for install prompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShow(true);
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      setDeferredPrompt(null);
    } catch (error) {
      // Silently fail - user may have dismissed
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  if (!mounted || !show) {
    return null;
  }

  // iOS Safari - Show instructions
  if (platform === 'ios') {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative px-5 pt-4 pb-6 border-t border-zinc-800/80">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-white active:text-zinc-300 transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" strokeWidth={2.25} />
          </button>

          {/* Icon and message */}
          <div className="flex items-start gap-3 pr-12">
            {/* Share icon with glow */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg" />
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2.5">
                <Share className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base mb-1 tracking-tight">
                Install Gym Pass
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                Add this app to your Home Screen for quick access. Tap the{' '}
                <Share className="inline w-4 h-4 mx-0.5 -mt-0.5" strokeWidth={2.25} /> button below,
                then select <span className="text-white font-medium">"Add to Home Screen"</span>.
              </p>
            </div>
          </div>

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-400 active:text-zinc-300 text-xs font-medium transition-colors ml-[52px]"
          >
            Don't show again
          </button>
        </div>

        {/* Bottom safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)] bg-zinc-950/80 backdrop-blur-xl" />
      </div>
    );
  }

  // Android/Desktop Chrome - Show install button
  if (deferredPrompt) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative px-5 pt-4 pb-6 border-t border-zinc-800/80">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-white active:text-zinc-300 transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" strokeWidth={2.25} />
          </button>

          {/* Icon and message */}
          <div className="flex items-start gap-3 pr-12 mb-4">
            {/* Download icon with glow */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg" />
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2.5">
                <Download className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base mb-1 tracking-tight">
                Install Gym Pass
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Install this app for quick access from your home screen, no app store needed.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 ml-[52px]">
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="text-zinc-500 hover:text-zinc-400 active:text-zinc-300 text-sm font-medium transition-colors px-3"
            >
              Not now
            </button>
          </div>
        </div>

        {/* Bottom safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)] bg-zinc-950/80 backdrop-blur-xl" />
      </div>
    );
  }

  return null;
}
