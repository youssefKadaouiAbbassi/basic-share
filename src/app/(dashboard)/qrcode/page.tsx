'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled - this component ONLY runs on client
// This guarantees localStorage is available when the component mounts
const QRCodeContent = dynamic(() => import('./qrcode-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
    </div>
  ),
});

export default function QRCodePage() {
  return <QRCodeContent />;
}
