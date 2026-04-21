export default function VideoPlayer({ videoKey, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95">
      <div className="relative w-full max-w-5xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-3xl hover:text-netflix-red transition-colors"
          aria-label="Fermer le lecteur"
        >
          ✕
        </button>
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title="Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
