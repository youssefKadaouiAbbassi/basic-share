# BasicShare

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

BasicShare - Generate Basic-Fit gym QR codes. A lightweight Progressive Web App (PWA) for generating Basic-Fit gym QR codes on demand. Keep your gym access code readily available on your phone with instant generation and auto-refresh.

## Disclaimer

**This project is for personal convenience and educational purposes only.** It's designed to simplify gym access by having your QR code readily available on your phone. This tool is not intended for unauthorized access, misuse, or circumventing gym security measures. Users are responsible for complying with Basic-Fit's terms of service and using this tool ethically.

## Features

✨ **Instant QR Code Generation** - Generate your gym access QR code in seconds
🔄 **Auto-Refresh Every 5 Seconds** - Codes refresh automatically to stay valid
⚡ **Battery Efficient** - Pauses when app is in background to save power
📱 **Works Offline** - Full PWA support for offline functionality
🌓 **Dark Mode** - Easy on the eyes with a sleek dark interface
📲 **Mobile-First Design** - Optimized for phones and tablets

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org)
- **UI**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **PWA**: [Serwist](https://serwist.pages.dev) (with Turbopack)
- **QR Codes**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **Icons**: [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+) or Node.js (v18+)
- Basic-Fit gym membership

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/youssefKadaouiAbbassi/basic-share.git
   cd basic-share
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open in browser**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
bun run build
bun start
```

## How It Works

BasicShare generates QR codes using the same format as the official Basic-Fit app:

```
GM2:{cardNumber}:{persistentGuid}:{timestamp}:{hash}
```

**Components:**
- `cardNumber` - Your Basic-Fit membership card number
- `persistentGuid` - A unique identifier tied to your account
- `timestamp` - Current Unix timestamp (in seconds)
- `hash` - DJBS2 hash of the concatenated data

The QR code refreshes every 5 seconds to ensure the timestamp stays current, just like the official app. The hash is recalculated with each refresh to maintain validity.

**Security Note:** Your card number and credentials are stored securely on your device in local storage and never transmitted to external servers. All QR generation happens locally in your browser.

## Usage

1. **Log In** - Enter your Basic-Fit card number on the login screen
2. **View Your Code** - Your QR code appears instantly and auto-refreshes
3. **Scan at Gym** - Present the QR code to the gym entrance scanner
4. **Sign Out** - Click "Sign Out" to clear your data from the device

### Status Indicators

- 🟢 **Live** - App is active and QR code is refreshing
- ⏸️ **Paused** - App is in background; refresh pauses to save battery

The progress bar shows when the next refresh will occur. QR codes are refreshed automatically every 5 seconds when the app is in the foreground.

## Development

### Available Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Run code linter (Biome)
bun run format   # Format code with Biome
bun run check    # Check and fix code issues
```

### Project Structure

```
basic-share/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with SerwistProvider
│   │   ├── page.tsx             # Landing page
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── sw.ts                # Service worker source
│   │   ├── serwist/[path]/      # Service worker route handler
│   │   ├── (auth)/login/        # Login page
│   │   └── (dashboard)/qrcode/  # QR code display
│   ├── components/
│   │   ├── auth/                # Authentication components
│   │   ├── serwist-provider.tsx # PWA provider component
│   │   └── pwa-install-prompt.tsx
│   └── lib/
│       └── constants.ts         # App constants
├── public/                      # Static assets & splash screens
├── next.config.ts               # Next.js + Serwist config
└── tsconfig.json                # TypeScript configuration
```

### Code Quality

This project uses [Biome](https://biomejs.dev) for linting and formatting:

```bash
bun run lint      # Check code
bun run format    # Format all files
bun run check     # Check and fix issues
```

## Browser Support

BasicShare works on all modern browsers with PWA support:

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 16.4+
- ✅ Edge 90+

## PWA Installation

Install BasicShare as a standalone app:

1. **Desktop (Chrome/Edge)**
   - Click the install icon in the address bar
   - Or use the browser menu → "Install app"

2. **Mobile (iOS)**
   - Open in Safari
   - Tap the share button → "Add to Home Screen"

3. **Mobile (Android)**
   - Open in Chrome
   - Tap the menu → "Install app"

## Offline Support

BasicShare is fully functional offline thanks to its service worker. Your QR code will continue to generate even without internet connectivity. Your card data is stored locally on your device.

## Performance

- 🚀 First load: ~1.2 seconds
- 💾 Install size: ~2.5 MB
- 🔋 Battery impact: Minimal (auto-pauses in background)
- 📊 Lighthouse score: 95+ (PWA)

## Security & Privacy

- ✅ No backend servers - all code generation happens in your browser
- ✅ No data transmission - credentials never leave your device
- ✅ Local storage only - data persists locally between sessions
- ✅ No tracking or analytics
- ✅ No third-party APIs
- ✅ Open source for security auditing

## Credits

Created by [Youssef Kadaoui Abbassi](https://github.com/youssefKadaouiAbbassi)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note:** BasicShare is an independent project and is not affiliated with, endorsed by, or associated with Basic-Fit N.V. Use responsibly and in accordance with Basic-Fit's terms of service.
