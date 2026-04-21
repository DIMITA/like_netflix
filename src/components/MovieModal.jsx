import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  getMovieDetails, getTVDetails, getMovieVideos, getTVVideos,
  getBackdropUrl, getPosterUrl, getTitle, getReleaseYear, getMediaType, findTrailer,
} from '../utils/tmdbApi';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';

function StarRating({ rating }) {
  const stars = Math.round((rating || 0) / 2);
  return (
    <div className="flex gap-0.5 items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-lg ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
      ))}
      <span className="ml-2 text-netflix-gray text-sm">{rating?.toFixed(1)}/10</span>
    </div>
  );
}

export default function MovieModal() {
  const { selectedMovie, setSelectedMovie, toggleFavorite, isFavorite, addToast } = useApp();
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [expandOverview, setExpandOverview] = useState(false);

  const movie = selectedMovie;

  const close = useCallback(() => {
    setSelectedMovie(null);
    setDetails(null);
    setTrailer(null);
    setShowTrailer(false);
    setExpandOverview(false);
    setError(null);
  }, [setSelectedMovie]);

  useEffect(() => {
    if (!movie) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setDetails(null);
    setTrailer(null);

    const mediaType = getMediaType(movie);
    const detailFn = mediaType === 'movie' ? getMovieDetails : getTVDetails;
    const videoFn = mediaType === 'movie' ? getMovieVideos : getTVVideos;

    Promise.all([
      detailFn(movie.id, controller.signal),
      videoFn(movie.id, controller.signal),
    ])
      .then(([d, v]) => {
        setDetails(d);
        setTrailer(findTrailer(v.results));
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [movie]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = movie ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [movie]);

  if (!movie) return null;

  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const mediaType = getMediaType(movie);
  const favorited = isFavorite(movie.id);
  const backdropUrl = getBackdropUrl(details?.backdrop_path || movie.backdrop_path);
  const posterUrl = getPosterUrl(details?.poster_path || movie.poster_path);
  const overview = details?.overview || movie.overview || '';
  const genres = details?.genres || [];
  const runtime = details?.runtime;
  const seasons = details?.number_of_seasons;
  const episodes = details?.number_of_episodes;

  const handleFavorite = () => {
    toggleFavorite(movie);
    addToast(
      favorited ? `"${title}" retiré des favoris` : `"${title}" ajouté aux favoris`,
      favorited ? 'info' : 'success'
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative bg-netflix-card rounded-xl overflow-hidden w-full max-w-3xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white text-xl transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>

          {/* Hero image */}
          <div className="relative h-56 md:h-80 overflow-hidden">
            {backdropUrl ? (
              <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-netflix-dark flex items-center justify-center text-6xl">
                🎬
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-card via-netflix-card/40 to-transparent" />

            {/* Play trailer button overlay */}
            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl transition-all group-hover:scale-110 border-2 border-white/60">
                  ▶
                </div>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-5 md:p-6">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-400 mb-2">⚠️ {error}</p>
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Poster thumbnail */}
                {posterUrl && (
                  <img
                    src={posterUrl}
                    alt={title}
                    className="hidden sm:block w-28 rounded-lg shrink-0 object-cover"
                  />
                )}

                <div className="flex-1 min-w-0">
                  {/* Title + meta */}
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{title}</h2>

                  <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      mediaType === 'tv' ? 'bg-blue-600' : 'bg-netflix-red'
                    }`}>
                      {mediaType === 'tv' ? 'Série' : 'Film'}
                    </span>
                    {year && <span className="text-netflix-gray">{year}</span>}
                    {runtime && (
                      <span className="text-netflix-gray">
                        ⏱ {Math.floor(runtime / 60)}h{runtime % 60 > 0 ? ` ${runtime % 60}min` : ''}
                      </span>
                    )}
                    {seasons && (
                      <span className="text-netflix-gray">
                        📺 {seasons} saison{seasons > 1 ? 's' : ''} • {episodes} épisodes
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <StarRating rating={movie.vote_average} />
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {genres.map(g => (
                        <span key={g.id} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {overview && (
                    <div className="mb-4">
                      <p className={`text-gray-300 text-sm leading-relaxed ${expandOverview ? '' : 'line-clamp-3'}`}>
                        {overview}
                      </p>
                      {overview.length > 200 && (
                        <button
                          onClick={() => setExpandOverview(o => !o)}
                          className="text-netflix-gray text-xs mt-1 hover:text-white transition-colors"
                        >
                          {expandOverview ? 'Voir moins ▲' : 'Lire la suite... ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {trailer ? (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 bg-netflix-red text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-red-700 transition-colors"
                      >
                        ▶ Voir le trailer
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-2 bg-gray-700 text-gray-400 px-5 py-2.5 rounded font-bold text-sm cursor-not-allowed"
                      >
                        🎬 Pas de trailer
                      </button>
                    )}
                    <button
                      onClick={handleFavorite}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm transition-all border ${
                        favorited
                          ? 'bg-netflix-red border-netflix-red text-white'
                          : 'bg-transparent border-gray-500 text-white hover:border-white hover:bg-white/10'
                      }`}
                    >
                      {favorited ? '♥ Dans les favoris' : '♡ Ajouter aux favoris'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer player */}
      {showTrailer && trailer && (
        <VideoPlayer videoKey={trailer.key} onClose={() => setShowTrailer(false)} />
      )}
    </>
  );
}
