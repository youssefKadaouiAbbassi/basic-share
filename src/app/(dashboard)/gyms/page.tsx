'use client';

import { Clock, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { Spinner } from '@/components/ui/spinner';
import {
  fetchGymBusyness,
  formatDistance,
  type GymWithDistance,
  getNearbyGyms,
} from '@/lib/api/basic-fit';
import { useGyms } from '@/lib/context/gym-context';

const FAVORITES_KEY = 'basicshare_favorite_gyms';
const RECENT_KEY = 'basicshare_recent_gyms';

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

function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function GymsPage() {
  const { gyms: allGyms, loading } = useGyms();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setRecent(getRecent());

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

  // Get recent gyms that exist in current list
  const recentGyms = useMemo(() => {
    return recent
      .map((id) => gyms.find((g) => g.clubId === id))
      .filter((g): g is GymWithDistance => g !== undefined)
      .slice(0, 3);
  }, [gyms, recent]);

  // Sort: favorites first, then by distance (excluding recent which are shown separately)
  const sortedGyms = useMemo(() => {
    const recentIds = new Set(recentGyms.map((g) => g.clubId));
    return [...gyms]
      .filter((g) => !recentIds.has(g.clubId))
      .sort((a, b) => {
        const aFav = favorites.includes(a.clubId);
        const bFav = favorites.includes(b.clubId);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.distance - b.distance;
      });
  }, [gyms, favorites, recentGyms]);

  if (loading || locationLoading) {
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
        {recentGyms.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 mt-1">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h2 className="text-zinc-400 text-sm font-medium">Recent</h2>
            </div>
            {recentGyms.map((gym) => {
              const busyness = fetchGymBusyness(gym.busynessData);
              const level = busyness?.currentLevel || 0;
              const isFavorite = favorites.includes(gym.clubId);
              return (
                <a
                  key={gym.id}
                  href={`/gyms/${gym.clubId}`}
                  className="flex items-center justify-between py-3 px-3 mb-2 rounded-lg border bg-zinc-900 border-zinc-800"
                >
                  <Clock className="w-5 h-5 text-zinc-600 mr-3 -ml-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{gym.name.replace(/^Basic-Fit\s*/i, '')}</p>
                    <p className="text-zinc-400 text-sm">{gym.city}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    {isFavorite && <Heart className="w-4 h-4 fill-orange-500 text-orange-500" />}
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
            <div className="h-4 border-b border-zinc-800/50 mb-4" />
          </>
        )}
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
