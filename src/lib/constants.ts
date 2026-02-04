// Storage keys
export const STORAGE_KEY = 'basicshare_auth';
export const INSTALL_DISMISSED_KEY = 'basicshare_install_dismissed';

// Timing constants (ms)
export const PWA_INSTALL_DELAY = 1000;
export const AUTH_CHECK_DEBOUNCE = 300;
export const QR_REFRESH_INTERVAL = 5000;

// QR Code constants
export const QR_TOTAL_CYCLES = 6;
export const QR_SIZE = 280;
export const QR_ERROR_LEVEL = 'M' as const;

// Validation constants
export const CARD_NUMBER_MIN_LENGTH = 6;

// UI constants
export const SPINNER_SIZE = 8;
export const TOAST_DURATION = 3000;

// Basic-Fit API
export const CONTENTFUL_TOKEN = 'wRd4zwNule_XU0IrbE-DSfF0IcFxSnDCilyboUhYLps';
export const CONTENTFUL_SPACE_ID = 'ztnn01luatek';
export const CONTENTFUL_ENV = 'master';
export const BASIC_FIT_API_BASE = 'https://my.basic-fit.com/door-policy';

// Gym data refresh intervals (ms)
export const GYM_REFRESH_INTERVAL = 60000; // 1 minute
export const ACCESS_CHECK_INTERVAL = 30000; // 30 seconds
export const BUSYNESS_REFRESH_INTERVAL = 300000; // 5 minutes

// Geolocation
export const DEFAULT_SEARCH_RADIUS_KM = 50;
export const MAX_NEARBY_GYMS = 20;
