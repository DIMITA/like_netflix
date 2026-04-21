import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  getMovieDetails, getTVDetails, getMovieVideos, getTVVideos, findTrailer,
} from '../utils/tmdbApi';
import { getOMDbById } from '../utils/omdbApi';
import SourceBadge from './SourceBadge';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';

function StarRating({ rating }) {
  const stars = Math.round((rating || 0) / 2);
  return (
    <div className="flex gap-0.5 items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-xl ${i < stars ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
      ))}
      {rating > 0 && <span className="ml-2 text-netflix-gray text-sm">{Number(rating).toFixed(1)}/10</span>}
    </div>
  );
}

// Fetch extra data for a normalized movie based on its source
async function fetchDetails(movie, signal) {
  const source = movie.source || 'tmdb';

  if (source === 'tmdb') {
    const mediaType = movie.mediaType === 'tv' ? 'tv' : 'movie';
    const tmdbId = movie.sourceId || movie.id?.replace('tmdb_', '');
    const detailFn = mediaType === 'movie' ? getMovieDetails : getTVDetails;
    const videoFn = mediaType === 'movie' ? getMovieVideos : getTVVideos;
    const [details, videos] = await Promise.all([
      detailFn(tmdbId, signal),
      videoFn(tmdbId, signal),
    ]);
    const trailer = findTrailer(videos.results);
    return {
      overview: details.overview || movie.overview,
      poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : movie.poster,
      backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : movie.backdrop,
      genres: (details.genres || []).map(g => g.name),
      runtime: details.runtime,
      seasons: details.number_of_seasons,
      episodes: details.number_of_episodes,
      videoItem: trailer ? { videoKey: trailer.key } : null,
      cast: (details.credits?.cast || []).slice(0, 5).map(a => a.name),
    };
  }

  if (source === 'omdb') {
    try {
      const d = await getOMDbById(movie.sourceId, signal);
      return {
        overview: d.Plot !== 'N/A' ? d.Plot : movie.overview,
        poster: d.Poster !== 'N/A' ? d.Poster : movie.poster,
        backdrop: movie.backdrop,
        genres: (d.Genre || '').split(',').map(g => g.trim()).filter(Boolean),
        runtime: d.Runtime ? parseInt(d.Runtime) : null,
        seasons: null, episodes: null,
        videoItem: null,
        cast: (d.Actors || '').split(',').map(a => a.trim()).filter(Boolean),
        imdbRating: d.imdbRating,
        director: d.Director,
        awards: d.Awards !== 'N/A' ? d.Awards : null,
      };
    } catch { return null; }
  }

  // For youtube, pexels, pixabay, archive, rapidapi — data is already complete
  return null;
}

export default function MovieModal() {
  const { selectedMovie, setSelectedMovie, toggleFavorite, isFavorite, addToast } = useApp();
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [expandOverview, setExpandOverview] = useState(false);

  const movie = selectedMovie;

  const close = useCallback(() => {
    setSelectedMovie(null);
    setExtra(null);
    setShowPlayer(false);
    setExpandOverview(false);
  }, [setSelectedMovie]);

  useEffect(() => {
    if (!movie) return;
    const controller = new AbortController();

    const source = movie.source || 'tmdb';
    // Only fetch extra data for sources that need it
    if (source === 'tmdb' || source === 'omdb') {
      setLoading(true);
      setExtra(null);
      fetchDetails(movie, controller.signal)
        .then(d => { setExtra(d); setLoading(false); })
        .catch(err => { if (err.name !== 'AbortError') setLoading(false); });
    } else {
      setExtra(null);
      setLoading(false);
    }

    return () => controller.abort();
  }, [movie]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = movie ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [movie]);

  if (!movie) return null;

  // Resolve display values (prefer extra over movie base data)
  const title = movie.title || movie.name || 'Sans titre';
  const year = movie.year || (movie.release_date || movie.first_air_date || '').substring(0, 4);
  const overview = extra?.overview || movie.overview || '';
  const poster = extra?.poster || movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);
  const backdrop = extra?.backdrop || movie.backdrop || (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null);
  const genres = extra?.genres || movie.genres || (movie.genre_ids ? [] : []);
  const runtime = extra?.runtime;
  const seasons = extra?.seasons;
  const episodes = extra?.episodes;
  const cast = extra?.cast || [];
  const director = extra?.director;
  const awards = extra?.awards;
  const imdbRating = extra?.imdbRating;
  const source = movie.source || 'tmdb';
  const mediaType = movie.mediaType || (movie.name !== undefined ? 'tv' : 'movie');
  const rating = movie.rating ?? movie.vote_average ?? 0;

  // Video availability
  const videoItem = extra?.videoItem || (movie.videoKey || movie.videoUrl || movie.archiveId ? movie : null);
  const hasVideo = !!(videoItem || movie.archiveId || movie.videoKey || movie.videoUrl);

  const favorited = isFavorite(movie.id);

  const handleFavorite = () => {
    toggleFavorite(movie);
    addToast(
      favorited ? `"${title}" retiré des favoris` : `"${title}" ajouté aux favoris`,
      favorited ? 'info' : 'success'
    );
  };

  const handleWatch = () => setShowPlayer(true);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative bg-netflix-card rounded-xl overflow-hidden w-full max-w-3xl shadow-2xl my-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white text-2xl transition-colors leading-none"
          >
            ×
          </button>

          {/* Hero */}
          <div className="relative h-52 md:h-72 overflow-hidden">
            {backdrop ? (
              <img src={backdrop} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-netflix-dark flex items-center justify-center text-6xl">
                {source === 'archive' ? '📼' : source === 'youtube' ? '▶' : '🎬'}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-card via-netflix-card/50 to-transparent" />

            {/* Play overlay */}
            {hasVideo && (
              <button
                onClick={handleWatch}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl transition-all group-hover:scale-110 border-2 border-white/50">
                  ▶
                </div>
              </button>
            )}

            {/* Source badge on backdrop */}
            <div className="absolute bottom-4 left-4">
              <SourceBadge source={source} />
            </div>
          </div>

          {/* Body */}
          <div className="p-5 md:p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex gap-4">
                {/* Poster */}
                {poster && (
                  <img
                    src={poster}
                    alt={title}
                    className="hidden sm:block w-24 md:w-32 rounded-lg shrink-0 object-cover self-start"
                  />
                )}

                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">{title}</h2>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      mediaType === 'tv' ? 'bg-blue-600' : 'bg-netflix-red'
                    }`}>
                      {mediaType === 'tv' ? 'Série' : mediaType === 'video' ? 'Vidéo' : 'Film'}
                    </span>
                    {year && <span className="text-netflix-gray">{year}</span>}
                    {runtime && (
                      <span className="text-netflix-gray">
                        ⏱ {Math.floor(runtime / 60)}h{runtime % 60 > 0 ? ` ${runtime % 60}min` : ''}
                      </span>
                    )}
                    {seasons && (
                      <span className="text-netflix-gray">
                        📺 {seasons} saison{seasons > 1 ? 's' : ''} · {episodes} ép.
                      </span>
                    )}
                    {imdbRating && imdbRating !== 'N/A' && (
                      <span className="text-yellow-400 font-medium">IMDb: {imdbRating}</span>
                    )}
                  </div>

                  {/* Rating */}
                  {rating > 0 && (
                    <div className="mb-3">
                      <StarRating rating={rating} />
                    </div>
                  )}

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {genres.map((g, i) => (
                        <span key={i} className="text-xs bg-gray-700 text-gray-200 px-2 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Director */}
                  {director && director !== 'N/A' && (
                    <p className="text-xs text-netflix-gray mb-2">🎬 Réalisateur : <span className="text-gray-300">{director}</span></p>
                  )}

                  {/* Cast */}
                  {cast.length > 0 && (
                    <p className="text-xs text-netflix-gray mb-3">
                      🎭 Casting : <span className="text-gray-300">{cast.join(', ')}</span>
                    </p>
                  )}

                  {/* Awards */}
                  {awards && (
                    <p className="text-xs text-yellow-500/80 mb-3">🏆 {awards}</p>
                  )}

                  {/* Overview */}
                  {overview && (
                    <div className="mb-4">
                      <p className={`text-gray-300 text-sm leading-relaxed ${expandOverview ? '' : 'line-clamp-3'}`}>
                        {overview}
                      </p>
                      {overview.length > 180 && (
                        <button
                          onClick={() => setExpandOverview(o => !o)}
                          className="text-netflix-gray text-xs mt-1 hover:text-white transition-colors"
                        >
                          {expandOverview ? 'Voir moins ▲' : 'Lire la suite… ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Alternative sources */}
                  {movie.alternativeSources?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                      <span className="text-xs text-gray-500">Aussi sur :</span>
                      {movie.alternativeSources.map((alt, i) => (
                        <SourceBadge key={i} source={alt.source} small />
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {hasVideo ? (
                      <button
                        onClick={handleWatch}
                        className="flex items-center gap-2 bg-netflix-red text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-red-700 transition-colors"
                      >
                        ▶ {source === 'archive' ? 'Regarder' : source === 'youtube' ? 'Lire la vidéo' : 'Voir le trailer'}
                      </button>
                    ) : (
                      <button disabled className="flex items-center gap-2 bg-gray-700 text-gray-400 px-5 py-2.5 rounded font-bold text-sm cursor-not-allowed">
                        🎬 Pas de vidéo
                      </button>
                    )}
                    <button
                      onClick={handleFavorite}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm transition-all border ${
                        favorited
                          ? 'bg-netflix-red border-netflix-red text-white'
                          : 'bg-transparent border-gray-600 text-white hover:border-white hover:bg-white/5'
                      }`}
                    >
                      {favorited ? '♥ Favoris' : '♡ Ajouter'}
                    </button>

                    {/* Archive.org link */}
                    {movie.archiveId && (
                      <a
                        href={`https://archive.org/details/${movie.archiveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded font-bold text-sm border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"
                      >
                        📼 Archive.org
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video player */}
      {showPlayer && (
        <VideoPlayer
          item={videoItem || movie}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}
