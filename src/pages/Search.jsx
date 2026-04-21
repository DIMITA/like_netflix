import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { results, loading, error } = useSearch(query);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const hasResults = results.movies.length > 0 || results.tvShows.length > 0;
  const searched = query.trim().length > 0;

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Search input */}
      <div className="px-4 md:px-8 mb-6">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un film, une série..."
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 focus:border-netflix-red text-white placeholder-gray-500 px-5 py-4 pr-12 rounded-lg text-lg outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 md:px-8">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && searched && !hasResults && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Aucun résultat pour "{query}"</h2>
          <p className="text-netflix-gray">Essayez avec un autre terme de recherche</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">Recherchez votre film</h2>
          <p className="text-netflix-gray">Tapez un titre, un acteur, un genre...</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-2">
          {results.movies.length > 0 && (
            <MovieGrid
              title={`🎬 Films (${results.movies.length})`}
              movies={results.movies}
            />
          )}
          {results.tvShows.length > 0 && (
            <MovieGrid
              title={`📺 Séries (${results.tvShows.length})`}
              movies={results.tvShows}
            />
          )}
        </div>
      )}
    </div>
  );
}
