// Pure trophy filtering: no DOM access, so Node can import and test it.
// A trophy matches a kind filter when its kind equals it, or — for the
// missable filter — when its missable flag is set. The online filter
// always yields nothing: GTA VI has no online trophies at launch.
export const KIND_LABELS = {
  all: 'All trophies',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: 'Completion',
  platinum: 'Platinum',
  online: 'Online',
};

export const GRADE_LABELS = {
  all: 'All grades',
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return trophy.kind === kind;
}

export function gradeMatches(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function queryMatches(trophy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

// options: { kind, grade, earnedOnly, notEarnedOnly, query, earned }
// earned is a Set of trophy ids the reader has ticked.
export function filterTrophies(trophies, options) {
  const { kind = 'all', grade = 'all', earnedOnly = false, notEarnedOnly = false, query = '', earned = new Set() } = options;
  return trophies.filter((t) => {
    if (!kindMatches(t, kind)) return false;
    if (!gradeMatches(t, grade)) return false;
    if (!queryMatches(t, query)) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (notEarnedOnly && earned.has(t.id)) return false;
    return true;
  });
}

// Progress summary for the header: counts per grade and overall.
export function progressSummary(trophies, earned) {
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    byGrade[grade] = { done, total };
  }
  return { done: earned.size, total: trophies.length, byGrade };
}
