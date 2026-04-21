const API_KEY = () => import.meta.env.VITE_PIXABAY_API_KEY;
const BASE = 'https://pixabay.com/api/videos/';

async function request(params = {}, signal) {
  const key = API_KEY();
  if (!key || key === 'your_pixabay_api_key_here') throw new Error('Clé API Pixabay manquante');
  const url = new URL(BASE);
  url.searchParams.set('key', key);
  url.searchParams.set('per_page', '20');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
  return res.json();
}

export const searchPixabayVideos = (query, signal) =>
  request({ q: query, video_type: 'film' }, signal);

export const getFeaturedPixabayVideos = (signal) =>
  request({ q: 'cinema film movie', video_type: 'film', order: 'popular' }, signal);
