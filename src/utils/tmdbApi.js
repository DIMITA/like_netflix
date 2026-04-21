const BASE_URL = import.meta.env.VITE_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE = import.meta.env.VITE_BACKDROP_BASE_URL || 'https://image.tmdb.org/t/p/original';

export const MOVIE_GENRES = {
  28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie',
  80: 'Crime', 99: 'Documentaire', 18: 'Drame', 10751: 'Famille',
  14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique',
  9648: 'Mystère', 10749: 'Romance', 878: 'Science-Fiction',
  10770: 'Téléfilm', 53: 'Thriller', 10752: 'Guerre', 37: 'Western',
};

export const TV_GENRES = {
  10759: 'Action & Aventure', 16: 'Animation', 35: 'Comédie',
  80: 'Crime', 99: 'Documentaire', 18: 'Drame', 10751: 'Famille',
  10762: 'Kids', 9648: 'Mystère', 10763: 'News', 10764: 'Réalité',
  10765: 'Sci-Fi & Fantastique', 10766: 'Soap', 10767: 'Talk',
  10768: 'Guerre & Politique', 37: 'Western',
};

async function request(endpoint, params = {}, signal) {
  if (!API_KEY || API_KEY === 'your_tmdb_api_key_here') {
    throw new Error('Clé API TMDB manquante. Ajoutez VITE_TMDB_API_KEY dans .env.local');
  }
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'fr-FR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Erreur API TMDB: ${res.status} ${res.statusText}`);
  return res.json();
}

export const getPopularMovies = (signal) => request('/movie/popular', { page: 1 }, signal);
export const getPopularTV = (signal) => request('/tv/popular', { page: 1 }, signal);
export const getTopRatedMovies = (signal) => request('/movie/top_rated', { page: 1 }, signal);
export const getTrending = (signal) => request('/trending/all/week', {}, signal);
export const searchMovies = (query, signal) => request('/search/movie', { query, page: 1 }, signal);
export const searchTV = (query, signal) => request('/search/tv', { query, page: 1 }, signal);
export const getMovieDetails = (id, signal) => request(`/movie/${id}`, { append_to_response: 'credits' }, signal);
export const getTVDetails = (id, signal) => request(`/tv/${id}`, { append_to_response: 'credits' }, signal);
export const getMovieVideos = (id, signal) => request(`/movie/${id}/videos`, { language: 'en-US' }, signal);
export const getTVVideos = (id, signal) => request(`/tv/${id}/videos`, { language: 'en-US' }, signal);

export const getMediaType = (item) => (item.title !== undefined ? 'movie' : 'tv');
export const getTitle = (item) => item.title || item.name || 'Sans titre';
export const getReleaseYear = (item) => {
  const date = item.release_date || item.first_air_date || '';
  return date.substring(0, 4) || '—';
};
export const getPosterUrl = (path) => path ? `${IMAGE_BASE}${path}` : null;
export const getBackdropUrl = (path) => path ? `${BACKDROP_BASE}${path}` : null;
export const findTrailer = (videos) =>
  videos?.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
  videos?.find(v => v.type === 'Teaser' && v.site === 'YouTube') ||
  videos?.find(v => v.site === 'YouTube') ||
  null;
