import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BasicShare - Generate Basic-Fit gym QR codes',
  description: 'Generate Basic-Fit gym QR codes',
  openGraph: {
    title: 'BasicShare - Generate Basic-Fit gym QR codes',
    description: 'Generate Basic-Fit gym QR codes',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'BasicShare',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'BasicShare - Generate Basic-Fit gym QR codes',
    description: 'Generate Basic-Fit gym QR codes',
    images: ['/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BasicShare',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
