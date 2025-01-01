import React from "react";
import { AnimeSearchResult } from "../types/anime";

interface Props {
  anime: AnimeSearchResult;
  onSelect: (anime: AnimeSearchResult) => void;
}

export const AnimeSearchResultItem: React.FC<Props> = ({ anime, onSelect }) => (
  <div
    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
    onClick={() => onSelect(anime)}
  >
    <img
      src={anime.images.jpg.image_url}
      alt={anime.title}
      className="w-12 h-16 object-cover mr-2 rounded"
    />
    <div className="flex-grow">
      <div className="font-semibold">{anime.title}</div>
      <div className="text-sm text-gray-600 line-clamp-1">
        {anime.genres.map((g) => g.name).join(", ")}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-yellow-500 flex items-center">
          <span className="mr-1">★</span>
          {anime.score || "N/A"}
        </span>
        <span className="text-gray-500">
          Episodes: {anime.episodes || "Unknown"}
        </span>
        <span className="text-gray-500 capitalize">
          {anime.status.toLowerCase()}
        </span>
      </div>
    </div>
  </div>
);
