import { createContext, useContext, useState, useCallback } from 'react';
import { getFavorites, saveFavorites } from '../utils/storage';
import { DEFAULT_ACTIVE_SOURCES } from '../utils/sourceConfig';

const AppContext = createContext(null);

const SOURCES_STORAGE_KEY = 'netflix_clone_active_sources';

function loadActiveSources() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOURCES_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return DEFAULT_ACTIVE_SOURCES;
}

export function AppProvider({ children }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [toasts, setToasts] = useState([]);
  const [activeSources, setActiveSources] = useState(() => loadActiveSources());

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === movie.id);
      const next = exists ? prev.filter(f => f.id !== movie.id) : [...prev, movie];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => favorites.some(f => f.id === id), [favorites]);

  const toggleSource = useCallback((sourceId) => {
    setActiveSources(prev => {
      const next = prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId];
      // Always keep at least one source
      const result = next.length === 0 ? [sourceId] : next;
      localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(result));
      return result;
    });
  }, []);

  const setOnlySource = useCallback((sourceId) => {
    setActiveSources([sourceId]);
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify([sourceId]));
  }, []);

  return (
    <AppContext.Provider value={{
      selectedMovie, setSelectedMovie,
      favorites, toggleFavorite, isFavorite,
      toasts, addToast, removeToast,
      activeSources, toggleSource, setOnlySource,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
