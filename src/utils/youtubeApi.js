const API_KEY = () => import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE = 'https://www.googleapis.com/youtube/v3';

async function request(endpoint, params, signal) {
  const key = API_KEY();
  if (!key || key === 'your_youtube_api_key_here') throw new Error('Clé API YouTube manquante');
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('key', key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
}

export const searchYouTube = (query, signal) =>
  request('/search', {
    q: query + ' official trailer',
    part: 'snippet',
    type: 'video',
    maxResults: 20,
    videoCategoryId: '1', // Film & Animation
    relevanceLanguage: 'fr',
  }, signal);

export const getYouTubeDetails = (videoId, signal) =>
  request('/videos', {
    id: videoId,
    part: 'snippet,contentDetails,statistics',
  }, signal);
