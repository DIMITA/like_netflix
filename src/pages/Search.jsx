import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useMultiSearch } from '../hooks/useMultiSearch';
import MovieGrid from '../components/MovieGrid';
import SourceBadge from '../components/SourceBadge';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { activeSources } = useApp();
  const { results, loading, sourceErrors, sourceLoading } = useMultiSearch(query, activeSources);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const hasResults = results.length > 0;
  const searched = query.trim().length > 0;
  const anyLoading = Object.values(sourceLoading).some(Boolean);
  const hasSourceErrors = Object.keys(sourceErrors).length > 0;

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Search input */}
      <div className="px-4 md:px-8 mb-4">
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

      {/* Per-source loading indicators */}
      {searched && anyLoading && (
        <div className="px-4 md:px-8 mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-netflix-gray text-xs">Recherche en cours :</span>
          {Object.entries(sourceLoading).map(([sourceId, isLoading]) =>
            isLoading ? (
              <span key={sourceId} className="flex items-center gap-1">
                <SourceBadge source={sourceId} small />
                <span className="w-3 h-3 border-2 border-netflix-red border-t-transparent rounded-full animate-spin inline-block" />
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Per-source errors */}
      {searched && hasSourceErrors && (
        <div className="px-4 md:px-8 mb-4 flex flex-wrap gap-2">
          {Object.entries(sourceErrors).map(([sourceId, err]) => (
            <div key={sourceId} className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded px-2 py-1">
              <SourceBadge source={sourceId} small />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !anyLoading && searched && !hasResults && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Aucun résultat pour "{query}"</h2>
          <p className="text-netflix-gray">Essayez avec un autre terme de recherche</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">Recherchez votre film</h2>
          <p className="text-netflix-gray">Tapez un titre, un acteur, un genre...</p>
          {activeSources.length === 0 && (
            <p className="text-yellow-500 text-sm mt-2">⚠ Aucune plateforme sélectionnée — activez-en une dans la barre ci-dessus.</p>
          )}
        </div>
      )}

      {/* Results */}
      {searched && hasResults && (
        <MovieGrid
          title={`Résultats pour "${query}" (${results.length})`}
          movies={results}
          loading={false}
        />
      )}
    </div>
  );
}
