import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabase-client";
import AnimeSearch from "../components/AnimeSearch";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { AnimeCardSkeleton } from "../components/AnimeCardSkeleton";

interface AnimeItem {
  id: string;
  title: string;
  genres: string[];
  rating: number;
  status: "watching" | "completed" | "plan_to_watch" | "dropped";
  image_url: string;
  background_url?: string;
}

const Dashboard = () => {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeList();
  }, []);

  const fetchAnimeList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/anime/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAnimeList(data);
    } catch (error) {
      console.error("Error fetching anime list:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimeList =
    filter === "all"
      ? animeList
      : animeList.filter((anime) => anime.status === filter);

  const statusColors = {
    watching: "bg-blue-500",
    completed: "bg-green-500",
    plan_to_watch: "bg-yellow-500",
    dropped: "bg-red-500",
  };

  const handleAnimeSelect = async (animeData: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/anime/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: animeData.title,
          image_url: animeData.images.jpg.image_url,
          vote_average: animeData.score,
          status: "watched",
        }),
      });

      if (!response.ok) throw new Error("Failed to add anime");

      // Refresh the list
      fetchAnimeList();
    } catch (error) {
      console.error("Error adding anime:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Anime List</h1>
          <div className="flex gap-4 items-center">
            <div className="w-64">
              <AnimeSearch onSelect={handleAnimeSelect} />
            </div>
            <select
              className="p-2 rounded border"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimeList.map((anime) => (
              <div
                key={anime.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={anime.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                  {anime.background_url && (
                    <ImageWithFallback
                      src={anime.background_url}
                      alt={`${anime.title} background`}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div
                    className={`absolute top-2 right-2 ${
                      statusColors[anime.status]
                    } text-white px-2 py-1 rounded text-sm z-10`}
                  >
                    {anime.status.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {anime.genres?.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 px-2 py-1 rounded text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span>{anime.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
