const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const ICON_SVG = path.join(PUBLIC_DIR, 'icon.svg');
const BG_COLOR = '#09090b';

// Ensure output directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function generateAppleTouchIcon() {
  console.log('Generating apple-touch-icon-180.png...');

  await sharp(ICON_SVG)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon-180.png'));

  console.log('✓ apple-touch-icon-180.png created');
}

async function generateSplashScreen(width, height, filename) {
  console.log(`Generating ${filename}...`);

  const iconSize = 120;
  const iconY = Math.floor((height - iconSize - 80) / 2); // 80px for text below
  const iconX = Math.floor((width - iconSize) / 2);

  // Create SVG for splash screen
  const splashSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>

      <!-- Icon -->
      <g transform="translate(${iconX}, ${iconY})">
        <defs>
          <linearGradient id="grad-splash" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f97316"/>
            <stop offset="100%" style="stop-color:#ea580c"/>
          </linearGradient>
        </defs>
        <rect width="${iconSize}" height="${iconSize}" rx="22.5" fill="url(#grad-splash)"/>

        <!-- Simplified QR Code pattern -->
        <g fill="white">
          <!-- Top-left finder -->
          <rect x="18.75" y="18.75" width="26.25" height="26.25" rx="2"/>
          <rect x="22.5" y="22.5" width="18.75" height="18.75" rx="1" fill="#ea580c"/>
          <rect x="26.25" y="26.25" width="11.25" height="11.25" rx="0.5" fill="white"/>

          <!-- Top-right finder -->
          <rect x="75" y="18.75" width="26.25" height="26.25" rx="2"/>
          <rect x="78.75" y="22.5" width="18.75" height="18.75" rx="1" fill="#ea580c"/>
          <rect x="82.5" y="26.25" width="11.25" height="11.25" rx="0.5" fill="white"/>

          <!-- Bottom-left finder -->
          <rect x="18.75" y="75" width="26.25" height="26.25" rx="2"/>
          <rect x="22.5" y="78.75" width="18.75" height="18.75" rx="1" fill="#ea580c"/>
          <rect x="26.25" y="82.5" width="11.25" height="11.25" rx="0.5" fill="white"/>

          <!-- Data modules -->
          <rect x="52.5" y="22.5" width="7.5" height="7.5" rx="1"/>
          <rect x="63.75" y="22.5" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="33.75" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="52.5" width="7.5" height="7.5" rx="1"/>
          <rect x="63.75" y="52.5" width="7.5" height="7.5" rx="1"/>
          <rect x="75" y="52.5" width="7.5" height="7.5" rx="1"/>
          <rect x="86.25" y="52.5" width="7.5" height="7.5" rx="1"/>
          <rect x="93.75" y="52.5" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="63.75" width="7.5" height="7.5" rx="1"/>
          <rect x="75" y="63.75" width="7.5" height="7.5" rx="1"/>
          <rect x="93.75" y="63.75" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="75" width="7.5" height="7.5" rx="1"/>
          <rect x="63.75" y="75" width="7.5" height="7.5" rx="1"/>
          <rect x="75" y="75" width="7.5" height="7.5" rx="1"/>
          <rect x="86.25" y="75" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="86.25" width="7.5" height="7.5" rx="1"/>
          <rect x="75" y="86.25" width="7.5" height="7.5" rx="1"/>
          <rect x="93.75" y="86.25" width="7.5" height="7.5" rx="1"/>
          <rect x="52.5" y="93.75" width="7.5" height="7.5" rx="1"/>
          <rect x="63.75" y="93.75" width="7.5" height="7.5" rx="1"/>
          <rect x="75" y="93.75" width="7.5" height="7.5" rx="1"/>
          <rect x="86.25" y="93.75" width="7.5" height="7.5" rx="1"/>
          <rect x="93.75" y="93.75" width="7.5" height="7.5" rx="1"/>
        </g>
      </g>

      <!-- App Name -->
      <text
        x="${width / 2}"
        y="${iconY + iconSize + 50}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="24"
        font-weight="600"
        fill="white"
        text-anchor="middle"
      >BasicShare</text>
    </svg>
  `;

  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(PUBLIC_DIR, filename));

  console.log(`✓ ${filename} created`);
}

async function generateAllAssets() {
  try {
    // Generate apple touch icon
    await generateAppleTouchIcon();

    // Generate splash screens for major iPhone sizes
    const splashScreens = [
      { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS/11 Pro
      { width: 1170, height: 2532, name: 'splash-1170x2532.png' }, // iPhone 12/13/14
      { width: 1284, height: 2778, name: 'splash-1284x2778.png' }, // iPhone 12/13/14 Plus/Pro Max
    ];

    for (const screen of splashScreens) {
      await generateSplashScreen(screen.width, screen.height, screen.name);
    }

    console.log('\n✅ All iOS assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating assets:', error);
    process.exit(1);
  }
}

generateAllAssets();
