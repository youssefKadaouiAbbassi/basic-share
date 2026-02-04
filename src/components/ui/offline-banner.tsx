'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // Set initial state
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 text-sm">
      <WifiOff className="w-4 h-4" />
      <span>You&apos;re offline</span>
    </div>
  );
}
