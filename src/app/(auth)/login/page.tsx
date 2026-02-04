'use client';

import { useState, useEffect } from 'react';
import { QrCode, ArrowLeft } from 'lucide-react';
import { STORAGE_KEY } from '@/lib/constants';

export default function LoginPage() {
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    setError(null);
    const trimmed = cardNumber.trim();

    if (!trimmed) {
      setError('Please enter your card number');
      return;
    }

    const digitsOnly = trimmed.replace(/\D/g, '');

    if (!digitsOnly) {
      setError('Card number should contain digits');
      return;
    }

    if (digitsOnly.length < 6) {
      setError('Card number seems too short');
      return;
    }

    setIsLoading(true);

    try {
      const authData = {
        cardNumber: digitsOnly,
        deviceId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        persistentGuid: Math.random().toString(36).substring(2, 18).toUpperCase(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      window.location.assign('/qrcode');
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
          }}
        />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header with back button */}
      <header
        className={`relative z-10 px-4 pt-4 pb-2 transition-all duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white active:text-zinc-300 transition-colors py-2 pr-4 -ml-1 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.25} />
          <span className="text-[15px] font-medium">Back</span>
        </a>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-6">
        <div
          className={`flex-1 flex flex-col justify-center max-w-sm mx-auto w-full transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Logo and header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-gradient-to-b from-orange-500 to-orange-600 mb-6 shadow-lg shadow-orange-500/20 relative">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[1.25rem]" />
              <QrCode className="w-8 h-8 text-white" strokeWidth={2.25} />
            </div>
            <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">
              Sign In
            </h1>
            <p className="text-zinc-400 text-base font-light">
              Enter your Basic-Fit card number
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Error message with animation */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                error ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            </div>

            {/* Input group */}
            <div className="space-y-2.5">
              <label htmlFor="cardNumber" className="block text-zinc-400 text-sm font-medium pl-1">
                Card Number
              </label>
              <div
                className={`relative rounded-2xl transition-all duration-200 ${
                  inputFocused
                    ? 'ring-2 ring-orange-500/30 ring-offset-2 ring-offset-zinc-950'
                    : ''
                }`}
              >
                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter your card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-white text-lg placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-orange-500/50 transition-colors disabled:opacity-50"
                />
              </div>
              <p className="text-zinc-600 text-xs pl-1 leading-relaxed">
                Located on your membership card or in the Basic-Fit app
              </p>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-[18px] px-6 rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 text-white font-semibold text-[17px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 active:scale-[0.98] hover:shadow-xl hover:shadow-orange-500/30 relative overflow-hidden mt-2"
            >
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>

          {/* Footer hint */}
          <p className="mt-10 text-zinc-600 text-xs text-center font-medium">
            Your information stays on this device
          </p>
        </div>
      </main>
    </div>
  );
}
