import { useApp } from '../contexts/AppContext';
import MovieCard from '../components/MovieCard';

export default function Favorites() {
  const { favorites } = useApp();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white">
          Mes Favoris
          {favorites.length > 0 && (
            <span className="ml-3 bg-netflix-red text-white text-base font-bold px-2.5 py-1 rounded-full">
              {favorites.length}
            </span>
          )}
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-6">♡</div>
          <h2 className="text-2xl font-bold text-white mb-3">Aucun favori</h2>
          <p className="text-netflix-gray max-w-sm">
            Ajoutez des films et séries à vos favoris en cliquant sur le cœur ♥ sur n'importe quelle affiche.
          </p>
        </div>
      ) : (
        <>
          <p className="text-netflix-gray mb-6 text-sm">
            ✅ {favorites.length} titre{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {favorites.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
