import {
  BASIC_FIT_API_BASE,
  CONTENTFUL_ENV,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_TOKEN,
} from '@/lib/constants';

// Types
export interface Gym {
  id: string;
  clubId: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  busynessData?: Record<string, Record<string, number>> | null;
}

export interface BusynessData {
  currentLevel: number; // 0-100
  hourlyData: Record<string, number[]>; // day -> 24 hours of levels
  lastUpdated: string;
}

export interface AccessResult {
  success: boolean;
  timestamp: string;
  gymName?: string;
  message?: string;
}

export interface GymWithDistance extends Gym {
  distance: number; // km
}

// Contentful types
interface ContentfulGymItem {
  sys: { id: string };
  clubId: string;
  name: string;
  displayName: string;
  address: string;
  city: string;
  country: string;
  location: { lat: number; lon: number } | null;
  busynessData: Record<string, Record<string, number>> | null;
}

// Contentful GraphQL query for gyms
const GYM_QUERY = `
query GetGyms($limit: Int!) {
  clubCollection(limit: $limit) {
    items {
      sys { id }
      clubId
      name
      displayName
      address
      city
      country
      location {
        lat
        lon
      }
      busynessData
    }
  }
}
`;

// Contentful GraphQL query for single gym
const SINGLE_GYM_QUERY = `
query GetGymByClubId($clubId: String!) {
  clubCollection(where: { clubId: $clubId }, limit: 1) {
    items {
      sys { id }
      clubId
      name
      displayName
      address
      city
      country
      location {
        lat
        lon
      }
      busynessData
    }
  }
}
`;

// Fetch all gyms from Contentful
export async function fetchGyms(): Promise<Gym[]> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENV}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONTENTFUL_TOKEN}`,
      },
      body: JSON.stringify({
        query: GYM_QUERY,
        variables: { limit: 2000 },
      }),
    }
  );

  const data = await response.json();

  if (!data.data?.clubCollection?.items) {
    console.error('Failed to fetch gyms:', data);
    return [];
  }

  return data.data.clubCollection.items.map((item: ContentfulGymItem) => ({
    id: item.sys.id,
    clubId: item.clubId,
    name: item.name,
    slug: item.clubId, // Use clubId as slug
    address: item.address || '',
    city: item.city || '',
    country: item.country || '',
    latitude: item.location?.lat || 0,
    longitude: item.location?.lon || 0,
    busynessData: item.busynessData,
  }));
}

// Fetch single gym by clubId
export async function fetchGymByClubId(clubId: string): Promise<Gym | null> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENV}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONTENTFUL_TOKEN}`,
      },
      body: JSON.stringify({
        query: SINGLE_GYM_QUERY,
        variables: { clubId },
      }),
    }
  );

  const data = await response.json();
  const item = data.data?.clubCollection?.items?.[0] as ContentfulGymItem | undefined;

  if (!item) return null;

  return {
    id: item.sys.id,
    clubId: item.clubId,
    name: item.name,
    slug: item.clubId,
    address: item.address || '',
    city: item.city || '',
    country: item.country || '',
    latitude: item.location?.lat || 0,
    longitude: item.location?.lon || 0,
    busynessData: item.busynessData,
  };
}

// Process busyness data from gym record
export function fetchGymBusyness(
  busynessData: Record<string, Record<string, number>> | null | undefined
): BusynessData | null {
  if (!busynessData) return null;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const currentHour = now.getHours();

  // Convert object format to array format
  const hourlyData: Record<string, number[]> = {};
  for (const [day, hours] of Object.entries(busynessData)) {
    hourlyData[day] = Array.from({ length: 24 }, (_, i) => hours[String(i)] || 0);
  }

  const todayData = hourlyData[today] || [];
  const currentLevel = todayData[currentHour] || 0;

  return {
    currentLevel,
    hourlyData,
    lastUpdated: now.toISOString(),
  };
}

// Check QR access result
export async function checkAccessResult(cardNumber: string): Promise<AccessResult | null> {
  try {
    const response = await fetch(
      `${BASIC_FIT_API_BASE}/api/checkAccessResult?cardNumber=${cardNumber}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      success: data.accessGranted || false,
      timestamp: data.timestamp || new Date().toISOString(),
      gymName: data.gymName,
      message: data.message,
    };
  } catch {
    return null;
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get nearby gyms sorted by distance
export function getNearbyGyms(
  gyms: Gym[],
  userLat: number,
  userLon: number,
  maxDistance: number = 50
): GymWithDistance[] {
  return gyms
    .map((gym) => ({
      ...gym,
      distance: calculateDistance(userLat, userLon, gym.latitude, gym.longitude),
    }))
    .filter((gym) => gym.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Get crowd level label
export function getCrowdLevel(percentage: number): { label: string; color: string } {
  if (percentage < 30) return { label: 'Quiet', color: 'text-emerald-500' };
  if (percentage < 60) return { label: 'Moderate', color: 'text-yellow-500' };
  if (percentage < 80) return { label: 'Busy', color: 'text-orange-500' };
  return { label: 'Very Busy', color: 'text-red-500' };
}
