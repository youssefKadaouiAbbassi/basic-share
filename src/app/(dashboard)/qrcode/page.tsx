'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled - this component ONLY runs on client
// This guarantees localStorage is available when the component mounts
// No loading spinner needed - QR generates instantly from localStorage
const QRCodeContent = dynamic(() => import('./qrcode-content'), {
  ssr: false,
});

export default function QRCodePage() {
  return <QRCodeContent />;
}
