'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculateDistance,
  fetchGymByClubId,
  fetchNearbyGymsFromApi,
  type Gym,
  type GymWithDistance,
} from '@/lib/api/basic-fit';

const CACHE_KEY = 'basicshare_gyms_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

function getCache(lat: number, lon: number): CacheData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CacheData;

    // Check TTL
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if location is close enough (within 5km of cached location)
    const distance = Math.sqrt(
      Math.pow(parsed.location.lat - lat, 2) + Math.pow(parsed.location.lon - lon, 2)
    ) * 111; // rough km conversion

    if (distance > 5) {
      // Location changed significantly, invalidate cache
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
  const [gyms, setGyms] = useState<GymWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const loadGyms = useCallback(async (lat: number, lon: number, useCache = true) => {
    setLoading(true);
    setError(null);

    // Check cache first
    if (useCache) {
      const cached = getCache(lat, lon);
      if (cached) {
        // Add distance to cached gyms
        const gymsWithDistance = cached.data.map((gym) => ({
          ...gym,
          distance: calculateDistance(lat, lon, gym.latitude, gym.longitude),
        })).sort((a, b) => a.distance - b.distance);

        setGyms(gymsWithDistance);
        setLoading(false);
        return;
      }
    }

    // Fetch nearby gyms (FAST - only ~30-50 gyms instead of 2000)
    try {
      const data = await fetchNearbyGymsFromApi(lat, lon, 50, 50);

      // Add distance and sort
      const gymsWithDistance = data.map((gym) => ({
        ...gym,
        distance: calculateDistance(lat, lon, gym.latitude, gym.longitude),
      })).sort((a, b) => a.distance - b.distance);

      setGyms(gymsWithDistance);
      setCache(data, { lat, lon });
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
    // If context available and has gyms, find from cache
    if (context && context.gyms.length > 0) {
      const found = context.gyms.find((g) => g.clubId === clubId);
      if (found) {
        setGym(found);
        setLoading(false);
        return;
      }
    }

    // If context is still loading, wait
    if (context && context.loading) {
      return;
    }

    // Fallback: fetch single gym directly
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
