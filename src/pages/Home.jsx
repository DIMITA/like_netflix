import { useApp } from '../contexts/AppContext';
import { useFetchMovies } from '../hooks/useFetchMovies';
import { useSourceSection } from '../hooks/useMultiFetch';
import { getPopularMovies, getPopularTV, getTopRatedMovies, getTrending } from '../utils/tmdbApi';
import { normalizeTMDB } from '../utils/normalizer';
import HeroBanner from '../components/HeroBanner';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

// Wrap legacy TMDB hook to return normalized data
function useTMDBSection(fetchFn) {
  const { data, loading, error, retry } = useFetchMovies(fetchFn);
  return {
    data: data.map(normalizeTMDB),
    loading,
    error,
    retry,
  };
}

function ConditionalSection({ sourceId, activeSources, children }) {
  if (!activeSources.includes(sourceId)) return null;
  return children;
}

function SourceSection({ sourceId, section, title, activeSources }) {
  const { data, loading, error, retry } = useSourceSection(sourceId, section);
  if (!activeSources.includes(sourceId)) return null;
  return (
    <MovieGrid title={title} movies={data} loading={loading} error={error} onRetry={retry} />
  );
}

export default function Home() {
  const { activeSources } = useApp();

  const popular = useTMDBSection(getPopularMovies);
  const trending = useTMDBSection(getTrending);
  const popularTV = useTMDBSection(getPopularTV);
  const topRated = useTMDBSection(getTopRatedMovies);

  const isTMDB = activeSources.includes('tmdb');
  const isInitialLoading = isTMDB && popular.loading && popular.data.length === 0;

  if (isInitialLoading && !popular.error) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen">
      {/* Hero — from TMDB popular if active */}
      {isTMDB && popular.data.length > 0 && !popular.error && (
        <HeroBanner movies={popular.data} />
      )}

      {/* TMDB key warning */}
      {isTMDB && popular.error && (
        <div className="pt-24 px-4 md:px-8">
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 max-w-2xl mx-auto text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-yellow-400 font-bold text-lg mb-2">Clé API TMDB requise</h2>
            <p className="text-yellow-200/80 text-sm mb-4">{popular.error}</p>
            <ol className="text-left text-sm text-gray-300 space-y-1 mb-4 inline-block">
              <li>1. Créez un compte sur <strong>themoviedb.org</strong></li>
              <li>2. Récupérez votre clé API gratuite (Paramètres → API)</li>
              <li>3. Ajoutez dans <code className="bg-black/40 px-1 rounded">.env.local</code> :</li>
            </ol>
            <div className="bg-black/40 rounded p-3 text-left text-sm font-mono text-green-400">
              VITE_TMDB_API_KEY=votre_clé_ici
            </div>
          </div>
        </div>
      )}

      {/* No source selected */}
      {activeSources.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Aucune plateforme sélectionnée</h2>
          <p className="text-netflix-gray">Activez au moins une plateforme dans la barre de sélection.</p>
        </div>
      )}

      {/* Content sections */}
      <div className="pb-12 space-y-2">
        {/* TMDB sections */}
        {isTMDB && (
          <>
            <MovieGrid title="🔥 Tendances de la semaine" movies={trending.data} loading={trending.loading} error={trending.error} onRetry={trending.retry} />
            <MovieGrid title="🎬 Films populaires" movies={popular.data} loading={popular.loading && popular.data.length === 0} error={popular.error} onRetry={popular.retry} />
            <MovieGrid title="📺 Séries populaires" movies={popularTV.data} loading={popularTV.loading} error={popularTV.error} onRetry={popularTV.retry} />
            <MovieGrid title="⭐ Top films notés" movies={topRated.data} loading={topRated.loading} error={topRated.error} onRetry={topRated.retry} />
          </>
        )}

        {/* RapidAPI section */}
        <SourceSection sourceId="rapidapi" section="popular" title="⚡ RapidAPI — Films populaires" activeSources={activeSources} />

        {/* Archive.org section */}
        <SourceSection sourceId="archive" section="classics" title="📼 Domaine public — Classiques Archive.org" activeSources={activeSources} />

        {/* Pexels section */}
        <SourceSection sourceId="pexels" section="cinematic" title="📸 Pexels — Vidéos cinématiques" activeSources={activeSources} />

        {/* Pixabay section */}
        <SourceSection sourceId="pixabay" section="featured" title="🎞 Pixabay — Vidéos libres" activeSources={activeSources} />

        {/* YouTube & OMDb notice */}
        {activeSources.includes('youtube') && !activeSources.includes('tmdb') && (
          <div className="px-4 md:px-8 py-6 text-center text-netflix-gray text-sm">
            ▶ YouTube est actif — utilisez la <strong className="text-white">recherche</strong> pour trouver des trailers.
          </div>
        )}
        {activeSources.includes('omdb') && !activeSources.includes('tmdb') && (
          <div className="px-4 md:px-8 py-6 text-center text-netflix-gray text-sm">
            🏆 OMDb est actif — utilisez la <strong className="text-white">recherche</strong> pour trouver des films.
          </div>
        )}
      </div>
    </div>
  );
}
