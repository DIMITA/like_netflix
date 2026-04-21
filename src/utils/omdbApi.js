const API_KEY = () => import.meta.env.VITE_OMDB_API_KEY;
const BASE = 'https://www.omdbapi.com/';

async function request(params, signal) {
  const key = API_KEY();
  if (!key || key === 'your_omdb_api_key_here') throw new Error('Clé API OMDb manquante');
  const url = new URL(BASE);
  url.searchParams.set('apikey', key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`);
  const data = await res.json();
  if (data.Response === 'False') throw new Error(data.Error || 'OMDb error');
  return data;
}

export const searchOMDb = (query, signal) => request({ s: query, type: 'movie' }, signal);
export const getOMDbById = (imdbId, signal) => request({ i: imdbId, plot: 'full' }, signal);
export const getOMDbByTitle = (title, signal) => request({ t: title, plot: 'full' }, signal);
