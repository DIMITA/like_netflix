import { useState, useEffect } from 'react';

export function useFetchMovies(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    fetchFn(controller.signal)
      .then(res => {
        setData(res.results || []);
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
  }, []);

  return { data, loading, error, retry: load };
}
