import { useState, useEffect } from 'react';
import { getArchiveVideoUrl } from '../utils/archiveApi';
import LoadingSpinner from './LoadingSpinner';

function PlayerWrapper({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95">
      <div className="relative w-full max-w-5xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-3xl hover:text-netflix-red transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function AspectBox({ children }) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// YouTube embed
function YouTubePlayer({ videoKey, onClose }) {
  return (
    <PlayerWrapper onClose={onClose}>
      <AspectBox>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </AspectBox>
    </PlayerWrapper>
  );
}

// Direct MP4 player
function DirectVideoPlayer({ videoUrl, title, onClose }) {
  return (
    <PlayerWrapper onClose={onClose}>
      <AspectBox>
        <video
          className="w-full h-full bg-black"
          src={videoUrl}
          controls
          autoPlay
          title={title}
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </AspectBox>
    </PlayerWrapper>
  );
}

// Archive.org player — fetches direct URL first
function ArchivePlayer({ archiveId, title, onClose }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArchiveVideoUrl(archiveId)
      .then(u => {
        if (u) { setUrl(u); }
        else { setError('Fichier vidéo introuvable sur Archive.org'); }
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [archiveId]);

  if (loading) {
    return (
      <PlayerWrapper onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-300 text-sm">Chargement depuis Archive.org…</p>
        </div>
      </PlayerWrapper>
    );
  }

  if (error || !url) {
    return (
      <PlayerWrapper onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-400">{error || 'Impossible de charger la vidéo'}</p>
          <a
            href={`https://archive.org/details/${archiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline text-sm"
          >
            Ouvrir sur Archive.org →
          </a>
        </div>
      </PlayerWrapper>
    );
  }

  return <DirectVideoPlayer videoUrl={url} title={title} onClose={onClose} />;
}

export default function VideoPlayer({ item, videoKey, onClose }) {
  // Legacy usage: VideoPlayer videoKey={key}
  if (videoKey) {
    return <YouTubePlayer videoKey={videoKey} onClose={onClose} />;
  }

  if (!item) return null;

  if (item.videoKey) return <YouTubePlayer videoKey={item.videoKey} onClose={onClose} />;
  if (item.archiveId) return <ArchivePlayer archiveId={item.archiveId} title={item.title} onClose={onClose} />;
  if (item.videoUrl) return <DirectVideoPlayer videoUrl={item.videoUrl} title={item.title} onClose={onClose} />;

  return null;
}
