import React, { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = "/default-anime.jpg",
  className = "",
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse-soft" />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`transition-all duration-300 ${
          loading ? "opacity-0 scale-95" : "opacity-100 scale-100"
        } ${className}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        loading="lazy"
      />
    </div>
  );
};
