import { IMAGE_BASE, BACKDROP_BASE, MOVIE_GENRES, TV_GENRES } from './tmdbApi';

function safeStr(v) {
  if (Array.isArray(v)) return v[0] || '';
  return String(v || '');
}

export function normalizeTMDB(item) {
  const isTV = item.title === undefined && item.name !== undefined;
  const genreMap = isTV ? TV_GENRES : MOVIE_GENRES;
  return {
    id: `tmdb_${item.id}`,
    sourceId: String(item.id),
    source: 'tmdb',
    title: item.title || item.name || '',
    overview: item.overview || '',
    poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${BACKDROP_BASE}${item.backdrop_path}` : null,
    year: (item.release_date || item.first_air_date || '').substring(0, 4),
    rating: item.vote_average || 0,
    genres: (item.genre_ids || []).map(id => genreMap[id]).filter(Boolean),
    mediaType: isTV ? 'tv' : 'movie',
    videoKey: null,
    videoUrl: null,
    archiveId: null,
    duration: item.runtime || null,
    originalData: item,
  };
}

export function normalizeOMDb(item) {
  const rating = parseFloat(item.imdbRating);
  return {
    id: `omdb_${item.imdbID}`,
    sourceId: item.imdbID || '',
    source: 'omdb',
    title: item.Title || '',
    overview: item.Plot && item.Plot !== 'N/A' ? item.Plot : '',
    poster: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
    backdrop: null,
    year: safeStr(item.Year).substring(0, 4),
    rating: isNaN(rating) ? 0 : rating,
    genres: (item.Genre || '').split(',').map(g => g.trim()).filter(Boolean),
    mediaType: item.Type === 'series' ? 'tv' : 'movie',
    videoKey: null,
    videoUrl: null,
    archiveId: null,
    duration: item.Runtime ? parseInt(item.Runtime) || null : null,
    originalData: item,
  };
}

export function normalizeYouTube(item) {
  const id = item.id?.videoId || item.id;
  const snippet = item.snippet || {};
  return {
    id: `youtube_${id}`,
    sourceId: id,
    source: 'youtube',
    title: snippet.title || '',
    overview: snippet.description || '',
    poster: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || null,
    backdrop: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || null,
    year: (snippet.publishedAt || '').substring(0, 4),
    rating: 0,
    genres: [],
    mediaType: 'video',
    videoKey: id,
    videoUrl: `https://www.youtube.com/embed/${id}`,
    archiveId: null,
    duration: null,
    originalData: item,
  };
}

export function normalizeRapidAPI(item) {
  const img = item.primaryImage?.url || item.image?.url || null;
  const titleText = item.titleText?.text || item.title?.text || item.originalTitleText?.text || '';
  return {
    id: `rapidapi_${item.id}`,
    sourceId: item.id || '',
    source: 'rapidapi',
    title: titleText,
    overview: item.plot?.plotText?.plainText || item.description || '',
    poster: img,
    backdrop: img,
    year: String(item.releaseYear?.year || item.releaseDate?.year || ''),
    rating: item.ratingsSummary?.aggregateRating || 0,
    genres: (item.genres?.genres || []).map(g => g.text || g).filter(Boolean),
    mediaType: item.titleType?.text === 'tvSeries' ? 'tv' : 'movie',
    videoKey: null,
    videoUrl: null,
    archiveId: null,
    duration: item.runtime?.seconds ? Math.floor(item.runtime.seconds / 60) : null,
    originalData: item,
  };
}

export function normalizePexels(item) {
  const bestFile = (item.video_files || [])
    .filter(f => f.file_type === 'video/mp4')
    .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
  return {
    id: `pexels_${item.id}`,
    sourceId: String(item.id),
    source: 'pexels',
    title: `Pexels — ${item.user?.name || 'Video'} #${item.id}`,
    overview: item.url ? `Voir sur Pexels : ${item.url}` : '',
    poster: item.image || null,
    backdrop: item.image || null,
    year: '',
    rating: 0,
    genres: [],
    mediaType: 'video',
    videoKey: null,
    videoUrl: bestFile?.link || null,
    archiveId: null,
    duration: item.duration ? Math.round(item.duration / 60) : null,
    originalData: item,
  };
}

export function normalizePixabay(item) {
  const video = item.videos?.large || item.videos?.medium || item.videos?.small || {};
  const thumb = item.picture_id
    ? `https://i.vimeocdn.com/video/${item.picture_id}_640x360.jpg`
    : null;
  const tagList = (item.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  return {
    id: `pixabay_${item.id}`,
    sourceId: String(item.id),
    source: 'pixabay',
    title: tagList.slice(0, 3).join(', ') || `Pixabay #${item.id}`,
    overview: `Tags: ${item.tags || ''}`,
    poster: thumb,
    backdrop: item.picture_id
      ? `https://i.vimeocdn.com/video/${item.picture_id}_1280x720.jpg`
      : null,
    year: '',
    rating: 0,
    genres: tagList,
    mediaType: 'video',
    videoKey: null,
    videoUrl: video.url || null,
    archiveId: null,
    duration: item.duration ? Math.round(item.duration / 60) : null,
    originalData: item,
  };
}

export function normalizeArchive(item) {
  return {
    id: `archive_${item.identifier}`,
    sourceId: item.identifier,
    source: 'archive',
    title: safeStr(item.title) || item.identifier,
    overview: safeStr(item.description),
    poster: `https://archive.org/services/img/${item.identifier}`,
    backdrop: `https://archive.org/services/img/${item.identifier}`,
    year: safeStr(item.year).substring(0, 4),
    rating: 0,
    genres: Array.isArray(item.subject)
      ? item.subject.slice(0, 3)
      : (item.subject || '').split(';').map(s => s.trim()).slice(0, 3).filter(Boolean),
    mediaType: 'movie',
    videoKey: null,
    videoUrl: null,
    archiveId: item.identifier,
    duration: null,
    originalData: item,
  };
}
