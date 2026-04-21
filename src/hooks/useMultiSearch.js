import { useState, useEffect, useCallback } from 'react';
import { searchMovies, searchTV } from '../utils/tmdbApi';
import { searchOMDb } from '../utils/omdbApi';
import { searchYouTube } from '../utils/youtubeApi';
import { searchRapidAPI } from '../utils/rapidApi';
import { searchPexelsVideos } from '../utils/pexelsApi';
import { searchPixabayVideos } from '../utils/pixabayApi';
import { searchArchiveMovies } from '../utils/archiveApi';
import { normalizeTMDB, normalizeOMDb, normalizeYouTube, normalizeRapidAPI, normalizePexels, normalizePixabay, normalizeArchive } from '../utils/normalizer';
import { deduplicateMedia } from '../utils/deduplicator';

const FETCHERS = {
  tmdb: async (q, signal) => {
    const [movies, tv] = await Promise.all([
      searchMovies(q, signal),
      searchTV(q, signal),
    ]);
    return [
      ...(movies.results || []).slice(0, 20).map(normalizeTMDB),
      ...(tv.results || []).slice(0, 20).map(normalizeTMDB),
    ];
  },
  omdb: async (q, signal) => {
    const data = await searchOMDb(q, signal);
    return (data.Search || []).slice(0, 20).map(normalizeOMDb);
  },
  youtube: async (q, signal) => {
    const data = await searchYouTube(q, signal);
    return (data.items || []).slice(0, 20).map(normalizeYouTube);
  },
  rapidapi: async (q, signal) => {
    const data = await searchRapidAPI(q, signal);
    return (data.results || []).slice(0, 20).map(normalizeRapidAPI);
  },
  pexels: async (q, signal) => {
    const data = await searchPexelsVideos(q, signal);
    return (data.videos || []).slice(0, 20).map(normalizePexels);
  },
  pixabay: async (q, signal) => {
    const data = await searchPixabayVideos(q, signal);
    return (data.hits || []).slice(0, 20).map(normalizePixabay);
  },
  archive: async (q, signal) => {
    const items = await searchArchiveMovies(q, signal);
    return items.slice(0, 20).map(normalizeArchive);
  },
};

export function useMultiSearch(query, activeSources) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceErrors, setSourceErrors] = useState({});
  const [sourceLoading, setSourceLoading] = useState({});
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  const search = useCallback((q, sources) => {
    if (!q?.trim()) {
      setResults([]);
      setLoading(false);
      return () => {};
    }

    const controller = new AbortController();
    setLoading(true);
    setSourceErrors({});
    setResults([]);

    const initialLoading = {};
    sources.forEach(s => { initialLoading[s] = true; });
    setSourceLoading(initialLoading);

    const allResults = [];
    let pending = sources.length;

    if (pending === 0) {
      setLoading(false);
      return () => {};
    }

    sources.forEach(sourceId => {
      const fetcher = FETCHERS[sourceId];
      if (!fetcher) {
        pending--;
        setSourceLoading(prev => ({ ...prev, [sourceId]: false }));
        if (pending === 0) setLoading(false);
        return;
      }

      fetcher(q, controller.signal)
        .then(items => {
          allResults.push(...items);
          setSourceLoading(prev => ({ ...prev, [sourceId]: false }));
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setSourceErrors(prev => ({ ...prev, [sourceId]: err.message }));
          }
          setSourceLoading(prev => ({ ...prev, [sourceId]: false }));
        })
        .finally(() => {
          pending--;
          // Update results incrementally as each source completes
          setResults(deduplicateMedia([...allResults]));
          if (pending === 0) setLoading(false);
        });
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = search(debouncedQuery, activeSources);
    return cleanup;
  }, [debouncedQuery, activeSources, search]);

  return { results, loading, sourceErrors, sourceLoading };
}
