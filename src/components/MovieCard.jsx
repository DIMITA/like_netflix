import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getPosterUrl, getTitle, getReleaseYear, getMediaType, MOVIE_GENRES, TV_GENRES } from '../utils/tmdbApi';

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

  const posterUrl = getPosterUrl(movie.poster_path);
  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const rating = movie.vote_average?.toFixed(1) || '—';
  const mediaType = getMediaType(movie);
  const genreMap = mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const genres = (movie.genre_ids || []).slice(0, 2).map(id => genreMap[id]).filter(Boolean);
  const favorited = isFavorite(movie.id);

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
        {posterUrl && !imgError ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <div className="text-center p-2">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-xs line-clamp-2">{title}</div>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Heart button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            favorited ? 'bg-netflix-red text-white' : 'bg-black/60 text-white hover:bg-netflix-red'
          }`}
          aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {favorited ? '♥' : '♡'}
        </button>

        {/* Media type badge */}
        <div className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
          mediaType === 'tv' ? 'bg-blue-600' : 'bg-netflix-red'
        }`}>
          {mediaType === 'tv' ? 'SÉRIE' : 'FILM'}
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
          <div className="flex items-center justify-between">
            <StarRating rating={movie.vote_average} />
            <span className="text-netflix-gray text-xs">{year}</span>
          </div>
          {genres.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {genres.map(g => (
                <span key={g} className="text-xs text-gray-300 bg-white/10 px-1.5 py-0.5 rounded">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title below card */}
      <div className="p-2 bg-netflix-card">
        <p className="text-white text-xs font-medium truncate">{title}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-yellow-400 text-xs">★ {rating}</span>
          <span className="text-netflix-gray text-xs">{year}</span>
        </div>
      </div>
    </div>
  );
}
