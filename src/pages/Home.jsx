import { useApp } from '../contexts/AppContext';
import { useFetchMovies } from '../hooks/useFetchMovies';
import { useSourceSection } from '../hooks/useMultiFetch';
import { getPopularMovies, getPopularTV, getTopRatedMovies, getTrending } from '../utils/tmdbApi';
import { normalizeTMDB } from '../utils/normalizer';
import HeroBanner from '../components/HeroBanner';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

function useTMDBSection(fetchFn) {
  const { data, loading, error, retry } = useFetchMovies(fetchFn);
  return { data: data.map(normalizeTMDB), loading, error, retry };
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
  const archive = useSourceSection('archive', 'classics');

  const isTMDB = activeSources.includes('tmdb');
  const isArchive = activeSources.includes('archive');
  const isInitialLoading = isTMDB && popular.loading && popular.data.length === 0;

  // Use archive movies for hero if TMDB unavailable/not selected
  const heroMovies = isTMDB && popular.data.length > 0 && !popular.error
    ? popular.data
    : isArchive && archive.data.length > 0
    ? archive.data
    : null;

  if (isInitialLoading && !isTMDB && !popular.error) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      {heroMovies && <HeroBanner movies={heroMovies} />}

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

      <div className="pb-12 space-y-2">
        {/* Archive.org — films complets gratuits (high priority) */}
        {isArchive && (
          <div>
            {/* Section label */}
            {archive.data.length > 0 && !archive.loading && (
              <div className="px-4 md:px-8 pt-4 pb-1 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-purple-700/30 border border-purple-600/50 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                  📼 FILMS COMPLETS GRATUITS
                </span>
                <span className="text-netflix-gray text-xs">Domaine public — regardez directement, sans inscription</span>
              </div>
            )}
            <MovieGrid
              title="📼 Archive.org — Films complets du domaine public"
              movies={archive.data}
              loading={archive.loading}
              error={archive.error}
              onRetry={archive.retry}
            />
          </div>
        )}

        {/* TMDB sections — trailers + metadata */}
        {isTMDB && (
          <>
            {(trending.data.length > 0 || trending.loading) && (
              <div>
                {trending.data.length > 0 && !trending.loading && (
                  <div className="px-4 md:px-8 pt-4 pb-1 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-red-900/30 border border-red-700/50 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                      🎬 TRAILERS UNIQUEMENT
                    </span>
                    <span className="text-netflix-gray text-xs">TMDB fournit les métadonnées et trailers YouTube</span>
                  </div>
                )}
                <MovieGrid title="🔥 Tendances de la semaine" movies={trending.data} loading={trending.loading} error={trending.error} onRetry={trending.retry} />
              </div>
            )}
            <MovieGrid title="🎬 Films populaires" movies={popular.data} loading={popular.loading && popular.data.length === 0} error={popular.error} onRetry={popular.retry} />
            <MovieGrid title="📺 Séries populaires" movies={popularTV.data} loading={popularTV.loading} error={popularTV.error} onRetry={popularTV.retry} />
            <MovieGrid title="⭐ Top films notés" movies={topRated.data} loading={topRated.loading} error={topRated.error} onRetry={topRated.retry} />
          </>
        )}

        {/* RapidAPI */}
        <SourceSection sourceId="rapidapi" section="popular" title="⚡ RapidAPI — Films populaires" activeSources={activeSources} />

        {/* Pexels */}
        <SourceSection sourceId="pexels" section="cinematic" title="📸 Pexels — Vidéos cinématiques HD" activeSources={activeSources} />

        {/* Pixabay */}
        <SourceSection sourceId="pixabay" section="featured" title="🎞 Pixabay — Vidéos libres de droit" activeSources={activeSources} />

        {/* YouTube & OMDb notice */}
        {activeSources.includes('youtube') && (
          <div className="px-4 md:px-8 py-6 text-center text-netflix-gray text-sm">
            ▶ YouTube est actif — utilisez la <strong className="text-white">recherche</strong> pour trouver des vidéos.
          </div>
        )}
        {activeSources.includes('omdb') && (
          <div className="px-4 md:px-8 py-6 text-center text-netflix-gray text-sm">
            🏆 OMDb est actif — utilisez la <strong className="text-white">recherche</strong> pour trouver des films avec données IMDb.
          </div>
        )}
      </div>
    </div>
  );
}
