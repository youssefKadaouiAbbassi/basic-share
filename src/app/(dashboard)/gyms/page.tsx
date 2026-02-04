'use client';

import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { Spinner } from '@/components/ui/spinner';
import {
  fetchGymBusyness,
  fetchGymByClubId,
  formatDistance,
  type GymWithDistance,
  getNearbyGyms,
} from '@/lib/api/basic-fit';
import { useGyms } from '@/lib/context/gym-context';

const FAVORITES_KEY = 'basicshare_favorite_gyms';
const DEFAULT_GYM_KEY = 'basicshare_default_gym';
const PREFETCH_KEY = 'basicshare_prefetched_gym';

function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getDefaultGymSync(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DEFAULT_GYM_KEY);
  } catch {
    return null;
  }
}

// Simple redirect component that doesn't trigger gym fetching
function RedirectToDefaultGym({ gymId }: { gymId: string }) {
  useEffect(() => {
    // Prefetch gym data before redirecting
    const prefetchAndRedirect = async () => {
      try {
        const gymData = await fetchGymByClubId(gymId);
        if (gymData) {
          // Store prefetched data for the detail page to use
          localStorage.setItem(
            PREFETCH_KEY,
            JSON.stringify({
              data: gymData,
              timestamp: Date.now(),
            })
          );
        }
      } catch (error) {
        // Ignore prefetch errors, redirect anyway
        console.error('Prefetch failed:', error);
      } finally {
        // Redirect after prefetch (or on error)
        window.location.href = `/gyms/${gymId}`;
      }
    };

    prefetchAndRedirect();
  }, [gymId]);

  return (
    <div className="h-full flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// Main component that uses the gym context
function GymsListContent() {
  const { gyms: allGyms, loading } = useGyms();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());

    // Clean up old prefetch data on mount
    try {
      localStorage.removeItem(PREFETCH_KEY);
    } catch {
      // Ignore
    }

    // Online/offline detection
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { timeout: 5000 }
    );

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Process gyms with distance
  const gyms: GymWithDistance[] = useMemo(() => {
    if (allGyms.length === 0) return [];

    if (userLocation) {
      return getNearbyGyms(allGyms, userLocation.lat, userLocation.lon, 50).slice(0, 30);
    }

    return allGyms
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 30)
      .map((g) => ({ ...g, distance: 0 }));
  }, [allGyms, userLocation]);

  const toggleFavorite = (clubId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavs = prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId];
      saveFavorites(newFavs);
      return newFavs;
    });
  };

  // Sort: favorites first, then by distance
  const sortedGyms = useMemo(() => {
    return [...gyms].sort((a, b) => {
      const aFav = favorites.includes(a.clubId);
      const bFav = favorites.includes(b.clubId);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.distance - b.distance;
    });
  }, [gyms, favorites]);

  // Show content immediately if we have gyms (even if location is still loading)
  // Location loading will update distances in the background
  const showSpinner = loading && gyms.length === 0;

  if (showSpinner) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <OfflineBanner />
      {isOffline && gyms.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-zinc-500 text-sm text-center">Gyms will appear when you&apos;re back online</p>
        </div>
      )}
      {(!isOffline || gyms.length > 0) && (
        <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="pt-2 pb-3">
          <h2 className="text-zinc-400 text-sm font-medium">All Gyms</h2>
        </div>
        {sortedGyms.map((gym) => {
          const busyness = fetchGymBusyness(gym.busynessData);
          const level = busyness?.currentLevel || 0;
          const isFavorite = favorites.includes(gym.clubId);
          return (
            <a
              key={gym.id}
              href={`/gyms/${gym.clubId}`}
              className={`flex items-center justify-between py-3 px-3 mb-2 rounded-lg border ${
                isFavorite
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <button
                type="button"
                onClick={(e) => toggleFavorite(gym.clubId, e)}
                className="mr-3 p-1 -ml-1"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? 'fill-orange-500 text-orange-500' : 'text-zinc-600'
                  }`}
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">{gym.name.replace(/^Basic-Fit\s*/i, '')}</p>
                <p className="text-zinc-400 text-sm">{gym.city}</p>
              </div>
              <div className="flex items-center gap-3 ml-3">
                {level > 0 && (
                  <span className={`text-sm font-bold ${level < 40 ? 'text-green-500' : level < 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {level}%
                  </span>
                )}
                {gym.distance > 0 && (
                  <span className="text-orange-500 text-sm font-medium">{formatDistance(gym.distance)}</span>
                )}
              </div>
            </a>
          );
        })}
        </div>
      )}
    </div>
  );
}

// Wrapper component that checks for default gym before rendering list
export default function GymsPage() {
  const searchParams = useSearchParams();
  const [defaultGym] = useState(() => getDefaultGymSync());

  // Check if user explicitly wants to see the list
  const showList = searchParams.get('list') === 'true';

  // If there's a default gym AND user didn't explicitly request the list, redirect
  if (defaultGym && !showList) {
    return <RedirectToDefaultGym gymId={defaultGym} />;
  }

  // Only NOW use the context that triggers fetching
  return <GymsListContent />;
}
