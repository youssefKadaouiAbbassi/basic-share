import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SerwistProvider } from '@/components/serwist-provider';

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
    apple: [{ url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BasicShare',
    startupImage: ['/apple-touch-icon.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BasicShare" />

        {/* iPhone X/XS/11 Pro */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />

        {/* iPhone 12/13/14 */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />

        {/* iPhone 12/13/14 Plus/Pro Max */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}>
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
