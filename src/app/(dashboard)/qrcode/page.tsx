'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled - this component ONLY runs on client
// This guarantees localStorage is available when the component mounts
const QRCodeContent = dynamic(() => import('./qrcode-content'), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full bg-zinc-950 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"
          aria-hidden="true"
        />
        <span className="text-zinc-500 text-sm font-medium">Loading your pass...</span>
      </div>
    </div>
  ),
});

export default function QRCodePage() {
  return <QRCodeContent />;
}
