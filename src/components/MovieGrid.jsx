import MovieCard from './MovieCard';
import LoadingSpinner from './LoadingSpinner';

export default function MovieGrid({ title, movies, loading, error, onRetry }) {
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="px-4 md:px-8 py-6">
        {title && <h2 className="text-xl font-bold text-white mb-4">{title}</h2>}
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-red-300 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-netflix-red text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="px-4 md:px-8 py-6">
        {title && <h2 className="text-xl font-bold text-white mb-4">{title}</h2>}
        <p className="text-netflix-gray text-center py-8">Aucun contenu disponible</p>
      </div>
    );
  }

  return (
    <section className="px-4 md:px-8 py-4">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          {title}
          <span className="text-netflix-gray text-sm font-normal">({movies.length})</span>
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {movies.map(movie => (
          <MovieCard key={`${movie.id}-${movie.title || movie.name}`} movie={movie} />
        ))}
      </div>
    </section>
  );
}
