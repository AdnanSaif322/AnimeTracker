import React, { useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";
import { ImageErrorBoundary } from "./ImageErrorBoundary";
import { optimizeImageUrl } from "../utils/imageUtils";
import { AnimeItem } from "../types";

interface Props {
  anime: AnimeItem;
  onStatusChange?: (status: string) => void;
}

export const AnimeCard: React.FC<Props> = ({ anime, onStatusChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    watching: "bg-blue-500",
    completed: "bg-green-500",
    plan_to_watch: "bg-yellow-500",
    dropped: "bg-red-500",
  } as const;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageErrorBoundary>
          <div className="transform transition-transform duration-300 hover:scale-110">
            <ImageWithFallback
              src={optimizeImageUrl(anime.image_url, 300)}
              alt={anime.title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovered ? "scale-105 brightness-110" : ""
              }`}
            />
          </div>
          {anime.background_url && (
            <ImageWithFallback
              src={optimizeImageUrl(anime.background_url, 600)}
              alt={`${anime.title} background`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-40" : "opacity-30"
              }`}
            />
          )}
        </ImageErrorBoundary>
        <div
          className={`absolute top-2 right-2 ${
            statusColors[anime.status as keyof typeof statusColors]
          } text-white px-2 py-1 rounded text-sm z-10 transform transition-transform duration-300 ${
            isHovered ? "scale-105" : ""
          }`}
        >
          {anime.status.replace(/_/g, " ")}
        </div>

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? "opacity-20" : "opacity-0"
          }`}
        />
      </div>
      <div className="p-4 relative">
        <h3
          className={`text-xl font-semibold mb-2 line-clamp-1 transition-colors duration-300 ${
            isHovered ? "text-blue-600" : ""
          }`}
        >
          {anime.title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-yellow-500 transition-transform duration-300 ${
              isHovered ? "scale-125" : ""
            }`}
          >
            ★
          </span>
          <span className="transition-all duration-300 hover:font-semibold">
            {anime.vote_average?.toFixed(1) || "N/A"}
          </span>
        </div>

        {/* Action buttons that appear on hover */}
        <div
          className={`absolute right-4 bottom-4 flex gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <button
            onClick={() => onStatusChange?.(anime.status)}
            className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors duration-200"
          >
            Change Status
          </button>
        </div>
      </div>
    </div>
  );
};
