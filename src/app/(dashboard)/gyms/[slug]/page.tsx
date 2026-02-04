'use client';

import { ArrowLeft, Bookmark, Heart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { Spinner } from '@/components/ui/spinner';
import { fetchGymBusyness } from '@/lib/api/basic-fit';
import { useGym } from '@/lib/context/gym-context';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FAVORITES_KEY = 'basicshare_favorite_gyms';
const DEFAULT_GYM_KEY = 'basicshare_default_gym';

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

function getDefaultGym(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DEFAULT_GYM_KEY);
  } catch {
    return null;
  }
}

function setDefaultGym(clubId: string | null) {
  if (typeof window === 'undefined') return;
  if (clubId === null) {
    localStorage.removeItem(DEFAULT_GYM_KEY);
  } else {
    localStorage.setItem(DEFAULT_GYM_KEY, clubId);
  }
}

function getBusynessLevel(percentage: number) {
  if (percentage < 30) return { label: 'Quiet', color: 'text-emerald-400' };
  if (percentage < 70) return { label: 'Moderate', color: 'text-amber-400' };
  return { label: 'Busy', color: 'text-rose-400' };
}

export default function GymDetailPage() {
  const { slug } = useParams();
  const { gym, loading } = useGym(slug as string);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [defaultGym, setDefaultGymState] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const currentDay = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const currentHour = new Date().getHours();

  useEffect(() => {
    setFavorites(getFavorites());
    setDefaultGymState(getDefaultGym());
  }, []);

  const toggleFavorite = () => {
    if (!gym) return;
    setFavorites((prev) => {
      const newFavs = prev.includes(gym.clubId)
        ? prev.filter((id) => id !== gym.clubId)
        : [...prev, gym.clubId];
      saveFavorites(newFavs);
      return newFavs;
    });
  };

  const toggleDefaultGym = () => {
    if (!gym) return;
    const newDefault = defaultGym === gym.clubId ? null : gym.clubId;
    setDefaultGym(newDefault);
    setDefaultGymState(newDefault);
  };

  const isFavorite = gym ? favorites.includes(gym.clubId) : false;
  const isDefault = gym ? defaultGym === gym.clubId : false;

  // Only show spinner if we have no gym data at all
  // If we have gym data (from prefetch or cache), show it even while loading updates
  if (loading && !gym) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-zinc-500 mb-4">Gym not found</p>
        <a href="/gyms" className="text-orange-500 text-sm">Back</a>
      </div>
    );
  }

  const busyness = fetchGymBusyness(gym.busynessData);
  const fullDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = busyness?.hourlyData?.[fullDays[selectedDay]] || [];
  const currentBusyness = hours[currentHour] || 0;
  const busynessInfo = getBusynessLevel(currentBusyness);

  // Chart data
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: hours[i] || 0,
  }));

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <OfflineBanner />
      {/* Back */}
      <div className="px-6 pt-6 pb-3">
        <a href="/gyms" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
      </div>

      {/* Header */}
      <div className="px-6 pb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white mb-1">{gym.name.replace(/^Basic-Fit\s*/i, '')}</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleDefaultGym}
              className="p-2 -mr-1 -mt-1"
              title={isDefault ? 'Remove as default gym' : 'Set as default gym'}
            >
              <Bookmark
                className={`w-5 h-5 transition-colors ${
                  isDefault ? 'fill-orange-500 text-orange-500' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={toggleFavorite}
              className="p-2 -mr-2 -mt-1"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isFavorite ? 'fill-orange-500 text-orange-500' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              />
            </button>
          </div>
        </div>
        <p className="text-zinc-400 text-sm">{gym.address}, {gym.city}</p>
      </div>

      {/* Current Status */}
      <div className="px-6 pb-6">
        <div className="flex items-baseline gap-3">
          <span className={`text-5xl font-bold ${busynessInfo.color}`}>{currentBusyness}%</span>
          <span className={`text-lg font-medium ${busynessInfo.color}`}>{busynessInfo.label}</span>
        </div>
        <p className="text-zinc-500 text-xs mt-2">Current occupancy</p>
      </div>

      {/* Day Selector */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          {DAYS.map((day, i) => {
            const isToday = i === currentDay;
            const isSelected = i === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(i)}
                className={`relative flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {isToday && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
                  </span>
                )}
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-6 pb-8">
        <div className="h-56 w-full bg-zinc-900/30 rounded-xl p-4 outline-none focus:outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                ticks={[0, 6, 12, 18, 23]}
                tickFormatter={(v) => `${v}h`}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
                itemStyle={{ color: '#f97316', fontWeight: 600 }}
                formatter={(value) => [`${value ?? 0}%`, 'Busyness']}
                labelFormatter={(hour) => `${hour}:00`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#colorValue)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
