// Progress store: the reader's ticks live in localStorage, and can be
// exported to a JSON file and imported back. The file format is a plain
// JSON array of trophy ids, so it stays readable outside this app.
export const PROGRESS_KEY = 'gta6-trophy-guide-progress-v1';
export const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';

// Read the saved ticks. Anything that is not a clean array of numbers is
// treated as no progress rather than crashing the page.
export function loadProgress(storage = localStorage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned, storage = localStorage) {
  storage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// The spoiler setting: true means story trophies stay hidden until earned.
export function loadSpoilerSetting(storage = localStorage) {
  return storage.getItem(SPOILER_KEY) !== 'off';
}

export function saveSpoilerSetting(hidden, storage = localStorage) {
  storage.setItem(SPOILER_KEY, hidden ? 'on' : 'off');
}

// Export: a downloadable JSON file with the ids, the game and a version.
export function exportProgress(earned) {
  const payload = {
    game: 'Grand Theft Auto VI',
    app: 'gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  return JSON.stringify(payload, null, 2);
}

// Import: accepts the exported format, or a bare array of ids. Unknown
// ids are dropped, so a file from another list cannot corrupt the ticks.
export function importProgress(text, knownIds) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const known = new Set(knownIds);
  const earned = new Set();
  for (const n of ids) {
    if (Number.isInteger(n) && known.has(n)) earned.add(n);
  }
  return earned;
}

// Trigger a browser download of text as a file.
export function downloadText(filename, text, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
