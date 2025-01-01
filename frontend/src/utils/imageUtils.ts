export const optimizeImageUrl = (url: string, width: number = 300): string => {
  // If it's a MyAnimeList image, use their sizing parameters
  if (url.includes("myanimelist.net")) {
    return url.replace("/r/50x70/", `/r/${width}x${Math.floor(width * 1.4)}/`);
  }
  return url;
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};
