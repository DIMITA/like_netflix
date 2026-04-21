const BASE = 'https://archive.org';

// Search public domain films
export async function searchArchiveMovies(query = '', signal) {
  const searchQuery = query
    ? `(title:"${query}" OR subject:"${query}") AND mediatype:movies AND -subject:sports`
    : `mediatype:movies AND (subject:"feature film" OR subject:"silent film" OR subject:"animation" OR collection:feature_films OR collection:silent_films) AND year:[1900 TO 1970]`;

  const url = new URL(`${BASE}/advancedsearch.php`);
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('fl[]', 'identifier');
  url.searchParams.append('fl[]', 'title');
  url.searchParams.append('fl[]', 'description');
  url.searchParams.append('fl[]', 'year');
  url.searchParams.append('fl[]', 'subject');
  url.searchParams.append('fl[]', 'creator');
  url.searchParams.append('fl[]', 'runtime');
  url.searchParams.set('rows', '20');
  url.searchParams.set('page', '1');
  url.searchParams.set('output', 'json');
  url.searchParams.set('sort[]', 'downloads desc');

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Archive.org error: ${res.status}`);
  const data = await res.json();
  return data.response?.docs || [];
}

// Get best video file URL for an Archive identifier
export async function getArchiveVideoUrl(identifier, signal) {
  const url = `${BASE}/metadata/${identifier}/files`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const files = data.result || [];

    // Prefer MPEG4/H.264 MP4
    const mp4 = files
      .filter(f => f.format && (
        f.format.toLowerCase().includes('mpeg4') ||
        f.format.toLowerCase().includes('h.264') ||
        f.format.toLowerCase().includes('mp4')
      ) && f.name?.endsWith('.mp4'))
      .sort((a, b) => Number(b.size || 0) - Number(a.size || 0))[0];

    if (mp4) return `${BASE}/download/${identifier}/${mp4.name}`;

    // Fallback: any .mp4
    const anyMp4 = files.find(f => f.name?.endsWith('.mp4'));
    if (anyMp4) return `${BASE}/download/${identifier}/${anyMp4.name}`;

    return null;
  } catch {
    return null;
  }
}
