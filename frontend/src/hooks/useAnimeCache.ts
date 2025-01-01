interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function useAnimeCache<T>(cacheKey: string, ttl = 1000 * 60 * 5) {
  // 5 minutes TTL
  const getFromCache = (): T | null => {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    if (Date.now() - item.timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return item.data;
  };

  const setToCache = (data: T) => {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(item));
  };

  return { getFromCache, setToCache };
}
