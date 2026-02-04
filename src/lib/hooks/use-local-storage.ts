import { useEffect, useState } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Simple localStorage hook with SSR safety
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  // Hydration: read from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (_error) {
      // Ignore parse errors
    }
  }, [key]);

  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (mounted) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (_error) {
      // Ignore storage errors (quota exceeded, etc.)
    }
  };

  return [storedValue, setValue];
}
