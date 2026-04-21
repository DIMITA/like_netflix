import { useFetchMovies } from '../hooks/useFetchMovies';
import { getPopularMovies, getPopularTV, getTopRatedMovies, getTrending } from '../utils/tmdbApi';
import HeroBanner from '../components/HeroBanner';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const popular = useFetchMovies(getPopularMovies);
  const trending = useFetchMovies(getTrending);
  const popularTV = useFetchMovies(getPopularTV);
  const topRated = useFetchMovies(getTopRatedMovies);

  const isInitialLoading = popular.loading && popular.data.length === 0;

  if (isInitialLoading && !popular.error) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {popular.data.length > 0 && !popular.error && (
        <HeroBanner movies={popular.data} />
      )}

      {/* API key warning */}
      {popular.error && (
        <div className="pt-20 px-4 md:px-8">
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 max-w-2xl mx-auto text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-yellow-400 font-bold text-lg mb-2">Clé API TMDB requise</h2>
            <p className="text-yellow-200/80 text-sm mb-4">{popular.error}</p>
            <ol className="text-left text-sm text-gray-300 space-y-1 mb-4 inline-block">
              <li>1. Créez un compte sur <strong>themoviedb.org</strong></li>
              <li>2. Récupérez votre clé API gratuite</li>
              <li>3. Ajoutez-la dans <code className="bg-black/40 px-1 rounded">.env.local</code></li>
              <li>4. Redémarrez le serveur de dev</li>
            </ol>
            <div className="bg-black/40 rounded p-3 text-left text-sm font-mono text-green-400">
              VITE_TMDB_API_KEY=votre_clé_ici
            </div>
          </div>
        </div>
      )}

      {/* Content rows */}
      <div className="pb-12 space-y-2">
        <MovieGrid
          title="🔥 Tendances de la semaine"
          movies={trending.data}
          loading={trending.loading}
          error={trending.error}
          onRetry={trending.retry}
        />
        <MovieGrid
          title="🎬 Films populaires"
          movies={popular.data}
          loading={popular.loading && popular.data.length === 0}
          error={popular.error}
          onRetry={popular.retry}
        />
        <MovieGrid
          title="📺 Séries populaires"
          movies={popularTV.data}
          loading={popularTV.loading}
          error={popularTV.error}
          onRetry={popularTV.retry}
        />
        <MovieGrid
          title="⭐ Top films notés"
          movies={topRated.data}
          loading={topRated.loading}
          error={topRated.error}
          onRetry={topRated.retry}
        />
      </div>
    </div>
  );
}
