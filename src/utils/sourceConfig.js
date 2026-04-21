export const SOURCES = {
  tmdb: {
    id: 'tmdb', label: 'TMDB', icon: '🎬', color: '#01b4e4',
    description: 'Films & Séries', envKey: 'VITE_TMDB_API_KEY',
    hasBrowse: true, hasSearch: true, type: 'metadata',
  },
  omdb: {
    id: 'omdb', label: 'OMDb', icon: '🏆', color: '#f5c518',
    description: 'Base de données IMDb', envKey: 'VITE_OMDB_API_KEY',
    hasBrowse: false, hasSearch: true, type: 'metadata',
  },
  youtube: {
    id: 'youtube', label: 'YouTube', icon: '▶', color: '#ff0000',
    description: 'Trailers & Clips', envKey: 'VITE_YOUTUBE_API_KEY',
    hasBrowse: false, hasSearch: true, type: 'video',
  },
  rapidapi: {
    id: 'rapidapi', label: 'RapidAPI', icon: '⚡', color: '#0055ff',
    description: 'Movies Database', envKey: 'VITE_RAPIDAPI_KEY',
    hasBrowse: true, hasSearch: true, type: 'metadata',
  },
  pexels: {
    id: 'pexels', label: 'Pexels', icon: '📸', color: '#05a081',
    description: 'Vidéos HD libres', envKey: 'VITE_PEXELS_API_KEY',
    hasBrowse: true, hasSearch: true, type: 'video',
  },
  pixabay: {
    id: 'pixabay', label: 'Pixabay', icon: '🎞', color: '#2ec66e',
    description: 'Vidéos libres de droit', envKey: 'VITE_PIXABAY_API_KEY',
    hasBrowse: true, hasSearch: true, type: 'video',
  },
  archive: {
    id: 'archive', label: 'Archive.org', icon: '📼', color: '#9b59b6',
    description: 'Domaine public', envKey: null,
    hasBrowse: true, hasSearch: true, type: 'video',
  },
};

export const SOURCE_LIST = Object.values(SOURCES);
export const DEFAULT_ACTIVE_SOURCES = ['tmdb', 'archive'];

export const isSourceAvailable = (sourceId) => {
  const s = SOURCES[sourceId];
  if (!s || !s.envKey) return true; // no key needed (archive.org)
  const key = import.meta.env[s.envKey];
  return key && key !== `your_${s.envKey.toLowerCase().replace('vite_', '')}_here`;
};
