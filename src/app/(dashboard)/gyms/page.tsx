'use client';

import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import {
  fetchGymBusyness,
  formatDistance,
  type GymWithDistance,
  getNearbyGyms,
} from '@/lib/api/basic-fit';
import { useGyms } from '@/lib/context/gym-context';

const FAVORITES_KEY = 'basicshare_favorite_gyms';

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

export default function GymsPage() {
  const { gyms: allGyms, loading } = useGyms();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    setFavorites(getFavorites());
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { timeout: 5000 }
    );
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

  if (loading || locationLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-4 py-2 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
