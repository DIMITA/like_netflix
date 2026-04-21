import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import SourceBadge from './SourceBadge';

function StarRating({ rating }) {
  const stars = Math.round((rating || 0) / 2);
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-sm ${i < stars ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
      ))}
    </div>
  );
}

export default function MovieCard({ movie }) {
  const { setSelectedMovie, toggleFavorite, isFavorite, addToast } = useApp();
  const [imgError, setImgError] = useState(false);

  const id = movie.id;
  const title = movie.title || movie.name || 'Sans titre';
  const year = movie.year || (movie.release_date || movie.first_air_date || '').substring(0, 4);
  const poster = movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);
  const rating = movie.rating ?? movie.vote_average ?? 0;
  const genres = movie.genres || [];
  const source = movie.source || 'tmdb';

  const hasFullVideo = !!(movie.videoUrl || movie.archiveId);
  const hasTrailer = !!(movie.videoKey) && !hasFullVideo;
  const isMetadataOnly = !hasFullVideo && !hasTrailer && (source === 'tmdb' || source === 'omdb' || source === 'rapidapi');

  const videoLabel = movie.archiveId
    ? '📼 Film complet'
    : movie.videoUrl
    ? '▶ Vidéo'
    : hasTrailer
    ? '🎬 Trailer'
    : null;

  const favorited = isFavorite(id);

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
    addToast(
      favorited ? `"${title}" retiré des favoris` : `"${title}" ajouté aux favoris`,
      favorited ? 'info' : 'success'
    );
  };

  return (
    <div
      className="group relative cursor-pointer rounded overflow-hidden bg-netflix-card transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl"
      onClick={() => setSelectedMovie(movie)}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <div className="text-center p-2">
              <div className="text-4xl mb-2">
                {source === 'archive' ? '📼' : source === 'youtube' ? '▶' : source === 'pexels' ? '📸' : '🎬'}
              </div>
              <div className="text-xs line-clamp-3 text-gray-400">{title}</div>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Heart button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            favorited ? 'bg-netflix-red text-white' : 'bg-black/60 text-white hover:bg-netflix-red'
          }`}
        >
          {favorited ? '♥' : '♡'}
        </button>

        {/* Full video badge — always visible for archive */}
        {movie.archiveId && (
          <div className="absolute top-2 left-2 bg-purple-700/90 rounded px-1.5 py-0.5 text-white text-[10px] font-bold">
            📼 GRATUIT
          </div>
        )}

        {/* Video indicator on hover */}
        {videoLabel && !movie.archiveId && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded px-1.5 py-0.5 text-white text-xs flex items-center gap-1">
            {videoLabel}
          </div>
        )}

        {/* TMDB/metadata "trailer only" hint */}
        {isMetadataOnly && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded px-1.5 py-0.5 text-gray-300 text-xs">
            🎬 Trailer
          </div>
        )}

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-xs line-clamp-2 mb-1">{title}</h3>
          <div className="flex items-center justify-between mb-1">
            <StarRating rating={rating} />
            <span className="text-netflix-gray text-xs">{year}</span>
          </div>
          {genres.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {genres.slice(0, 2).map(g => (
                <span key={g} className="text-[10px] text-gray-300 bg-white/10 px-1 py-0.5 rounded">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="p-2 bg-netflix-card flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {rating > 0 && <span className="text-yellow-400 text-xs">★ {Number(rating).toFixed(1)}</span>}
            {year && <span className="text-netflix-gray text-xs">{year}</span>}
            {hasFullVideo && <span className="text-purple-400 text-[10px] font-bold">COMPLET</span>}
          </div>
        </div>
        <SourceBadge source={source} small />
      </div>
    </div>
  );
}
