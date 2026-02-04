'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculateDistance,
  detectCountryFromCoords,
  fetchGymByClubId,
  fetchGymsByCountry,
  type Gym,
  type GymWithDistance,
} from '@/lib/api/basic-fit';

const CACHE_KEY = 'basicshare_gyms_cache_v2'; // v2: country-based filtering
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours - gym locations rarely change
const PREFETCH_KEY = 'basicshare_prefetched_gym';
const PREFETCH_TTL = 30 * 1000; // 30 seconds - prefetch is very short-lived

// Default location (Paris) for users who deny geolocation
const DEFAULT_LOCATION = { lat: 48.8566, lon: 2.3522 };

interface CacheData {
  data: Gym[];
  location: { lat: number; lon: number };
  timestamp: number;
}

interface GymContextValue {
  gyms: GymWithDistance[];
  loading: boolean;
  error: Error | null;
  userLocation: { lat: number; lon: number } | null;
  refetch: () => Promise<void>;
}

const GymContext = createContext<GymContextValue | null>(null);

function getCache(): CacheData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CacheData;

    // Check TTL only - gym locations don't change often
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCache(data: Gym[], location: { lat: number; lon: number }) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, location, timestamp: Date.now() }));
  } catch {
    // localStorage quota exceeded - ignore
  }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached data if available - no loading spinner needed
  const [gyms, setGyms] = useState<GymWithDistance[]>(() => {
    const cached = getCache();
    if (cached) {
      // Show cached gyms immediately with placeholder distances
      return cached.data.slice(0, 50).map((gym) => ({ ...gym, distance: 0 }));
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !getCache()); // Only loading if no cache
  const [error, setError] = useState<Error | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const loadGyms = useCallback(async (lat: number, lon: number, useCache = true) => {
    // Check cache first - we cache all gyms for 24h since locations rarely change
    const cached = useCache ? getCache() : null;

    // Only show loading spinner if we don't have cached data
    if (!cached) {
      setLoading(true);
    }
    setError(null);

    try {
      let allGyms: Gym[];

      if (cached) {
        allGyms = cached.data;
      } else {
        // Detect country and fetch only gyms from that country (~500-900 vs 2000)
        const country = detectCountryFromCoords(lat, lon);
        allGyms = await fetchGymsByCountry(country);
        setCache(allGyms, { lat, lon });
      }

      // Filter by distance and add distance field
      const gymsWithDistance = allGyms
        .map((gym) => ({
          ...gym,
          distance: calculateDistance(lat, lon, gym.latitude, gym.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50); // Top 50 nearest (no distance cap - show nearest regardless)

      setGyms(gymsWithDistance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gyms'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    const loc = userLocation || DEFAULT_LOCATION;
    await loadGyms(loc.lat, loc.lon, false);
  }, [loadGyms, userLocation]);

  // Get user location and load gyms
  useEffect(() => {
    const loadWithLocation = () => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          loadGyms(loc.lat, loc.lon);
        },
        () => {
          // Geolocation denied/failed - use default
          setUserLocation(DEFAULT_LOCATION);
          loadGyms(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
        },
        { timeout: 5000 }
      );
    };

    loadWithLocation();
  }, [loadGyms]);

  const value = useMemo(
    () => ({ gyms, loading, error, userLocation, refetch }),
    [gyms, loading, error, userLocation, refetch]
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGyms() {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGyms must be used within a GymProvider');
  }
  return context;
}

export function useGym(clubId: string) {
  const context = useContext(GymContext);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Check for prefetched data first (instant load)
    if (typeof window !== 'undefined') {
      try {
        const prefetched = localStorage.getItem(PREFETCH_KEY);
        if (prefetched) {
          const parsed = JSON.parse(prefetched);
          // Check if it's fresh and for the right gym
          if (
            parsed.data?.clubId === clubId &&
            Date.now() - parsed.timestamp < PREFETCH_TTL
          ) {
            setGym(parsed.data);
            setLoading(false);
            // Clear prefetch cache after use
            localStorage.removeItem(PREFETCH_KEY);
            return;
          }
          // Stale or wrong gym - clear it
          localStorage.removeItem(PREFETCH_KEY);
        }
      } catch {
        // Ignore parse errors
        localStorage.removeItem(PREFETCH_KEY);
      }
    }

    // Step 2: If context available and has gyms, find from cache
    if (context && context.gyms.length > 0) {
      const found = context.gyms.find((g) => g.clubId === clubId);
      if (found) {
        setGym(found);
        setLoading(false);
        return;
      }
    }

    // Step 3: If context is still loading, wait
    if (context && context.loading) {
      return;
    }

    // Step 4: Fallback - fetch single gym directly
    setLoading(true);
    fetchGymByClubId(clubId)
      .then((data) => {
        setGym(data);
      })
      .catch(() => {
        setGym(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clubId, context]);

  return { gym, loading: context?.loading || loading };
}
