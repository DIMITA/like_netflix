import { useState, useEffect } from 'react';
import { getPopularMovies, getPopularTV, getTopRatedMovies, getTrending } from '../utils/tmdbApi';
import { getRapidAPIPopular } from '../utils/rapidApi';
import { getFeaturedPexelsVideos, getCinematicPexels } from '../utils/pexelsApi';
import { getFeaturedPixabayVideos } from '../utils/pixabayApi';
import { searchArchiveMovies } from '../utils/archiveApi';
import { normalizeTMDB, normalizeRapidAPI, normalizePexels, normalizePixabay, normalizeArchive } from '../utils/normalizer';
import { deduplicateMedia } from '../utils/deduplicator';

const BROWSE_FETCHERS = {
  tmdb: {
    trending: async (s) => {
      const d = await getTrending(s);
      return (d.results || []).map(normalizeTMDB);
    },
    popular: async (s) => {
      const d = await getPopularMovies(s);
      return (d.results || []).map(normalizeTMDB);
    },
    tv: async (s) => {
      const d = await getPopularTV(s);
      return (d.results || []).map(normalizeTMDB);
    },
    topRated: async (s) => {
      const d = await getTopRatedMovies(s);
      return (d.results || []).map(normalizeTMDB);
    },
  },
  rapidapi: {
    popular: async (s) => {
      const d = await getRapidAPIPopular(s);
      return (d.results || []).map(normalizeRapidAPI);
    },
  },
  pexels: {
    cinematic: async (s) => {
      const d = await getCinematicPexels(s);
      return (d.videos || []).map(normalizePexels);
    },
    featured: async (s) => {
      const d = await getFeaturedPexelsVideos(s);
      return (d.videos || []).map(normalizePexels);
    },
  },
  pixabay: {
    featured: async (s) => {
      const d = await getFeaturedPixabayVideos(s);
      return (d.hits || []).map(normalizePixabay);
    },
  },
  archive: {
    classics: async (s) => {
      const items = await searchArchiveMovies('', s);
      return items.map(normalizeArchive);
    },
  },
};

export function useSourceSection(sourceId, section) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    const fetcher = BROWSE_FETCHERS[sourceId]?.[section];
    if (!fetcher) { setLoading(false); return () => {}; }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then(items => {
        setData(items);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  };

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [sourceId, section]);

  return { data, loading, error, retry: load };
}
