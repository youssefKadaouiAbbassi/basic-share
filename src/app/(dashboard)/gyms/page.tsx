'use client';

import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import {
  fetchGymBusyness,
  fetchGyms,
  formatDistance,
  type GymWithDistance,
  getNearbyGyms,
} from '@/lib/api/basic-fit';

export default function GymsPage() {
  const [gyms, setGyms] = useState<GymWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGyms = useCallback(async (lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const allGyms = await fetchGyms();
      if (lat && lon) {
        setGyms(getNearbyGyms(allGyms, lat, lon, 50).slice(0, 30));
      } else {
        setGyms(
          allGyms
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 30)
            .map((g) => ({ ...g, distance: 0 }))
        );
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => loadGyms(pos.coords.latitude, pos.coords.longitude),
      () => loadGyms(),
      { timeout: 5000 }
    );
  }, [loadGyms]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-4 py-2 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {gyms.map((gym) => {
          const busyness = fetchGymBusyness(gym.busynessData);
          const level = busyness?.currentLevel || 0;
          return (
            <a
              key={gym.id}
              href={`/gyms/${gym.clubId}`}
              className="flex items-center justify-between py-3 px-3 mb-2 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">{gym.name}</p>
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
