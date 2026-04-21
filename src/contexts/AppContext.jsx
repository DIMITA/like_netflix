import { createContext, useContext, useState, useCallback } from 'react';
import { getFavorites, saveFavorites } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [toasts, setToasts] = useState([]);

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

  return (
    <AppContext.Provider value={{
      selectedMovie, setSelectedMovie,
      favorites, toggleFavorite, isFavorite,
      toasts, addToast, removeToast,
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
