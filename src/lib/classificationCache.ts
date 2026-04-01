const cache = new Map<string, { mood: string; painIndex: number }>();

function cacheKey(title: string, artist: string): string {
  return `classify:${title.toLowerCase().trim()}:${artist.toLowerCase().trim()}`;
}

export function getCachedClassification(title: string, artist: string) {
  return cache.get(cacheKey(title, artist)) || null;
}

export function setCachedClassification(
  title: string,
  artist: string,
  mood: string,
  painIndex: number
) {
  cache.set(cacheKey(title, artist), { mood, painIndex });
}
