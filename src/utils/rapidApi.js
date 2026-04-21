const API_KEY = () => import.meta.env.VITE_RAPIDAPI_KEY;
// Using "Movies Database" on RapidAPI (free tier, moviesdatabase.p.rapidapi.com)
const HOST = 'moviesdatabase.p.rapidapi.com';
const BASE = `https://${HOST}`;

async function request(endpoint, params = {}, signal) {
  const key = API_KEY();
  if (!key || key === 'your_rapidapi_key_here') throw new Error('Clé RapidAPI manquante');
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('info', 'base_info');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    signal,
    headers: {
      'x-rapidapi-host': HOST,
      'x-rapidapi-key': key,
    },
  });
  if (!res.ok) throw new Error(`RapidAPI error: ${res.status}`);
  return res.json();
}

export const searchRapidAPI = (query, signal) =>
  request('/titles/search/title/' + encodeURIComponent(query), { limit: 20 }, signal);

export const getRapidAPITrending = (signal) =>
  request('/titles', { list: 'top_boxoffice_200_rank', limit: 20 }, signal);

export const getRapidAPIPopular = (signal) =>
  request('/titles', { list: 'most_pop_movies', limit: 20 }, signal);
