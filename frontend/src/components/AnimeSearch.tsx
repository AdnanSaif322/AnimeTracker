import React, { useState, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useAnimeCache } from "../hooks/useAnimeCache";
import { LoadingSpinner } from "./LoadingSpinner";
import { useClickOutside } from "../hooks/useClickOutside";

interface AnimeSearchResult {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  genres: Array<{ name: string }>;
  score: number;
}

interface AnimeSearchProps {
  onSelect: (anime: AnimeSearchResult) => void;
}

const AnimeSearch: React.FC<AnimeSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const debouncedSearch = useDebounce(query, 500);
  const { getFromCache, setToCache } =
    useAnimeCache<AnimeSearchResult[]>("anime-search");

  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => {
    setIsOpen(false);
  });

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const searchAnime = async () => {
      if (debouncedSearch.length < 3) {
        setResults([]);
        return;
      }

      // Check cache first
      const cacheKey = `anime-search-${debouncedSearch}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        setResults(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
            debouncedSearch
          )}&limit=5`
        );

        if (response.status === 429) {
          setRateLimited(true);
          setError("Rate limited. Please wait a moment...");
          // Retry after 1 second
          timeoutId = setTimeout(searchAnime, 1000);
          return;
        }

        const data = await response.json();
        setResults(data.data || []);
        setToCache(cacheKey, data.data);
        setRateLimited(false);
      } catch (error) {
        console.error("Error searching anime:", error);
        setError("Failed to search anime. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    searchAnime();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [debouncedSearch]);

  const handleSelect = (anime: AnimeSearchResult) => {
    onSelect(anime);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search anime..."
          className="w-full p-2 border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-200">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {error && (
        <div className="absolute w-full mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-auto transition-all duration-200 animate-slide-down">
          {results.map((anime) => (
            <div
              key={anime.mal_id}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer transition-all duration-200"
              onClick={() => handleSelect(anime)}
            >
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-12 h-16 object-cover mr-2 rounded transition-transform duration-200 hover:scale-105"
              />
              <div className="flex-grow">
                <div className="font-semibold">{anime.title}</div>
                <div className="text-sm text-gray-600">
                  {anime.genres.map((g) => g.name).join(", ")}
                </div>
                <div className="text-sm text-yellow-500 flex items-center">
                  <span className="transform transition-transform duration-200 hover:scale-110">
                    ★
                  </span>
                  <span>{anime.score || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;
