import { useState, useEffect } from 'react';
import { searchMovies, searchTV } from '../utils/tmdbApi';

export function useSearch(query) {
  const [results, setResults] = useState({ movies: [], tvShows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ movies: [], tvShows: [] });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      searchMovies(debouncedQuery, controller.signal),
      searchTV(debouncedQuery, controller.signal),
    ])
      .then(([moviesData, tvData]) => {
        setResults({
          movies: (moviesData.results || []).slice(0, 20),
          tvShows: (tvData.results || []).slice(0, 20),
        });
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return { results, loading, error };
}
