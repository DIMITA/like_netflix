function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SOURCE_PRIORITY = {
  tmdb: 6, omdb: 5, rapidapi: 4, archive: 3, youtube: 2, pexels: 1, pixabay: 1,
};

function mergeItems(existing, incoming) {
  return {
    ...existing,
    // Enrich with missing data from incoming
    overview: existing.overview || incoming.overview,
    poster: existing.poster || incoming.poster,
    backdrop: existing.backdrop || incoming.backdrop,
    rating: existing.rating || incoming.rating,
    genres: existing.genres?.length ? existing.genres : incoming.genres,
    videoKey: existing.videoKey || incoming.videoKey,
    videoUrl: existing.videoUrl || incoming.videoUrl,
    duration: existing.duration || incoming.duration,
    alternativeSources: [
      ...(existing.alternativeSources || []),
      { source: incoming.source, id: incoming.sourceId },
    ],
  };
}

export function deduplicateMedia(items) {
  // Sort by source priority descending so highest-quality comes first
  const sorted = [...items].sort(
    (a, b) => (SOURCE_PRIORITY[b.source] || 0) - (SOURCE_PRIORITY[a.source] || 0)
  );

  const byKey = new Map();       // normalized title+year key
  const bySourceId = new Map();  // source_imdbID key for OMDb/TMDB cross-match

  for (const item of sorted) {
    if (!item.title) continue;

    const normTitle = normalizeTitle(item.title);
    const key = `${normTitle}__${item.year || ''}`;

    // Check for imdbID match (OMDb/TMDB cross source)
    const imdbKey = item.sourceId?.startsWith('tt') ? item.sourceId : null;
    if (imdbKey && bySourceId.has(imdbKey)) {
      const existing = bySourceId.get(imdbKey);
      const merged = mergeItems(existing, item);
      // Update in map
      byKey.set(key, merged);
      bySourceId.set(imdbKey, merged);
      continue;
    }

    if (byKey.has(key)) {
      const existing = byKey.get(key);
      const merged = mergeItems(existing, item);
      byKey.set(key, merged);
      if (imdbKey) bySourceId.set(imdbKey, merged);
    } else {
      const itemWithMeta = { ...item, alternativeSources: [] };
      byKey.set(key, itemWithMeta);
      if (imdbKey) bySourceId.set(imdbKey, itemWithMeta);
    }
  }

  return Array.from(byKey.values());
}
