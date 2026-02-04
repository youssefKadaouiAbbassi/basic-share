'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchGymByClubId, fetchGyms, type Gym } from '@/lib/api/basic-fit';

const CACHE_KEY = 'basicshare_gyms_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: Gym[];
  timestamp: number;
}

interface GymContextValue {
  gyms: Gym[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const GymContext = createContext<GymContextValue | null>(null);

function getCache(): CacheData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CacheData;
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

function setCache(data: Gym[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage quota exceeded - ignore
  }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGyms = useCallback(async (useCache = true) => {
    setLoading(true);
    setError(null);

    // Check cache first
    if (useCache) {
      const cached = getCache();
      if (cached) {
        setGyms(cached.data);
        setLoading(false);
        return;
      }
    }

    // Fetch fresh data
    try {
      const data = await fetchGyms();
      setGyms(data);
      setCache(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gyms'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await loadGyms(false);
  }, [loadGyms]);

  useEffect(() => {
    loadGyms();
  }, [loadGyms]);

  const value = useMemo(
    () => ({ gyms, loading, error, refetch }),
    [gyms, loading, error, refetch]
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
