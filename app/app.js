// GTA VI trophy guide: bootstrap. Loads the trophy list and the roadmap,
// wires the filters, the spoiler setting, the checklist and export/import,
// and keeps the progress header honest.
import { filterTrophies, progressSummary } from './lib/filters.js';
import { loadProgress, saveProgress, loadSpoilerSetting, saveSpoilerSetting, exportProgress, importProgress, downloadText } from './lib/store.js';
import { renderList } from './lib/render.js';
import { renderRoadmap } from './lib/roadmap.js';

const listEl = document.getElementById('trophy-list');
const roadmapEl = document.getElementById('roadmap');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const listCount = document.getElementById('list-count');
const kindFilter = document.getElementById('kind-filter');
const gradeFilter = document.getElementById('grade-filter');
const earnedFilter = document.getElementById('earned-filter');
const searchInput = document.getElementById('search');
const spoilerToggle = document.getElementById('spoiler-toggle');
const exportButton = document.getElementById('export-btn');
const importInput = document.getElementById('import-file');
const importStatus = document.getElementById('import-status');
const resetButton = document.getElementById('reset-btn');
const sourcesList = document.getElementById('sources-list');

const doc = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;
const sourceDefs = doc.sources;

let earned = loadProgress();
let spoilersHidden = loadSpoilerSetting();

function currentState() {
  return {
    kind: kindFilter.value,
    grade: gradeFilter.value,
    earnedOnly: earnedFilter.value === 'earned',
    notEarnedOnly: earnedFilter.value === 'not-earned',
    query: searchInput.value,
    earned,
    spoilersHidden,
    sourceDefs,
    onToggle,
  };
}

function renderProgress() {
  const summary = progressSummary(trophies, earned);
  progressText.textContent = `${summary.done} of ${summary.total} earned — ${summary.byGrade.platinum.done}/1 platinum, ${summary.byGrade.gold.done}/2 gold, ${summary.byGrade.silver.done}/6 silver, ${summary.byGrade.bronze.done}/46 bronze`;
  progressFill.style.width = `${(summary.done / summary.total) * 100}%`;
}

function renderAll() {
  renderProgress();
  renderList(listEl, trophies, currentState());
  renderRoadmap(roadmapEl, roadmap, trophies, earned);
  const shown = filterTrophies(trophies, currentState()).length;
  listCount.textContent = `Showing ${shown} of ${trophies.length} trophies`;
}

function onToggle(id, checked) {
  if (checked) earned.add(id);
  else earned.delete(id);
  saveProgress(earned);
  renderAll();
}

for (const control of [kindFilter, gradeFilter, earnedFilter]) {
  control.addEventListener('change', renderAll);
}
searchInput.addEventListener('input', renderAll);

spoilerToggle.checked = spoilersHidden;
spoilerToggle.addEventListener('change', () => {
  spoilersHidden = spoilerToggle.checked;
  saveSpoilerSetting(spoilersHidden);
  renderAll();
});

exportButton.addEventListener('click', () => {
  downloadText('gta6-trophy-progress.json', exportProgress(earned));
  importStatus.textContent = 'Progress exported.';
});

importInput.addEventListener('change', async () => {
  const file = importInput.files[0];
  if (!file) return;
  try {
    earned = importProgress(await file.text(), trophies.map((t) => t.id));
    saveProgress(earned);
    importStatus.textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  } catch {
    importStatus.textContent = 'That file is not a progress file. Export one first, then import it back.';
  }
  importInput.value = '';
  renderAll();
});

resetButton.addEventListener('click', () => {
  earned = new Set();
  saveProgress(earned);
  importStatus.textContent = 'Progress cleared.';
  renderAll();
});

for (const [key, def] of Object.entries(sourceDefs)) {
  const item = document.createElement('li');
  if (def.url) {
    const link = document.createElement('a');
    link.href = def.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = def.name;
    item.append(link);
  } else {
    item.textContent = `${def.name} (official list, no public link)`;
  }
  item.dataset.source = key;
  sourcesList.append(item);
}

renderAll();
