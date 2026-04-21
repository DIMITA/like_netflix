import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { getBackdropUrl, getTitle, getReleaseYear, getMediaType } from '../utils/tmdbApi';

export default function HeroBanner({ movies }) {
  const { setSelectedMovie, toggleFavorite, isFavorite, addToast } = useApp();
  const [imgLoaded, setImgLoaded] = useState(false);

  const hero = useMemo(() => {
    if (!movies?.length) return null;
    const filtered = movies.filter(m => m.backdrop_path && m.overview);
    const pool = filtered.length > 0 ? filtered : movies;
    return pool[Math.floor(Math.random() * Math.min(pool.length, 10))];
  }, [movies]);

  if (!hero) return null;

  const backdropUrl = getBackdropUrl(hero.backdrop_path);
  const title = getTitle(hero);
  const year = getReleaseYear(hero);
  const rating = hero.vote_average?.toFixed(1);
  const overview = hero.overview || '';
  const favorited = isFavorite(hero.id);

  const handleFavorite = () => {
    toggleFavorite(hero);
    addToast(
      favorited ? `"${title}" retiré des favoris` : `"${title}" ajouté aux favoris`,
      favorited ? 'info' : 'success'
    );
  };

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Backdrop image */}
      {backdropUrl && (
        <img
          src={backdropUrl}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      )}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-netflix-dark" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 max-w-3xl">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
            getMediaType(hero) === 'tv' ? 'bg-blue-600' : 'bg-netflix-red'
          }`}>
            {getMediaType(hero) === 'tv' ? 'Série' : 'Film'}
          </span>
          {year && <span className="text-netflix-gray text-sm">{year}</span>}
          {rating && (
            <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
              ★ {rating}/10
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-xl">
          {title}
        </h1>

        {/* Overview */}
        {overview && (
          <p className="text-gray-200 text-sm md:text-base lg:text-lg mb-6 line-clamp-3 max-w-2xl drop-shadow">
            {overview}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedMovie(hero)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold text-sm md:text-base hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <span className="text-lg">▶</span>
            Regarder
          </button>
          <button
            onClick={() => setSelectedMovie(hero)}
            className="flex items-center gap-2 bg-gray-500/70 text-white px-6 py-3 rounded font-bold text-sm md:text-base hover:bg-gray-500/90 transition-colors"
          >
            <span>ℹ</span>
            Plus d'infos
          </button>
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-4 py-3 rounded font-bold text-sm transition-all border ${
              favorited
                ? 'bg-netflix-red border-netflix-red text-white'
                : 'bg-transparent border-gray-400 text-white hover:border-white'
            }`}
          >
            {favorited ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  );
}
