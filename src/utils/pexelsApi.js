const API_KEY = () => import.meta.env.VITE_PEXELS_API_KEY;
const BASE = 'https://api.pexels.com/videos';

async function request(endpoint, params = {}, signal) {
  const key = API_KEY();
  if (!key || key === 'your_pexels_api_key_here') throw new Error('Clé API Pexels manquante');
  const url = new URL(`${BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    signal,
    headers: { Authorization: key },
  });
  if (!res.ok) throw new Error(`Pexels error: ${res.status}`);
  return res.json();
}

export const searchPexelsVideos = (query, signal) =>
  request('/search', { query, per_page: 20, orientation: 'landscape' }, signal);

export const getFeaturedPexelsVideos = (signal) =>
  request('/popular', { per_page: 20, min_duration: 30 }, signal);

export const getCinematicPexels = (signal) =>
  request('/search', { query: 'cinematic film cinema', per_page: 20, orientation: 'landscape' }, signal);
