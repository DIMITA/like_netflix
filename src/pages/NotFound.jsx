import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-netflix-red mb-4">404</div>
      <h1 className="text-3xl font-bold text-white mb-3">Page introuvable</h1>
      <p className="text-netflix-gray mb-8 max-w-sm">
        Cette page n'existe pas. Retournez à l'accueil pour continuer à regarder.
      </p>
      <Link
        to="/"
        className="bg-netflix-red text-white px-8 py-3 rounded font-bold hover:bg-red-700 transition-colors"
      >
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
