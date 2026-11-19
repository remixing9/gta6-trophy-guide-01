// Roadmap rendering: the six stages to the platinum, each with the
// trophies it covers and how many of them the reader has already earned.
import { progressSummary } from './filters.js';

// Build one stage card. byId maps trophy ids to their trophy objects so
// the stage can name its trophies and count the earned ones.
export function stageCard(stage, byId, earned) {
  const card = document.createElement('article');
  card.className = 'stage';
  const done = stage.trophyIds.filter((id) => earned.has(id)).length;

  const head = document.createElement('h3');
  const num = document.createElement('span');
  num.className = 'stage-num';
  num.textContent = `Stage ${stage.stage}`;
  head.append(num, document.createTextNode(` ${stage.title}`));
  card.append(head);

  const text = document.createElement('p');
  text.textContent = stage.text;
  card.append(text);

  const tip = document.createElement('p');
  tip.className = 'stage-tip';
  tip.textContent = `Tip: ${stage.tip}`;
  card.append(tip);

  const meta = document.createElement('p');
  meta.className = 'stage-meta';
  meta.textContent = `${done} of ${stage.trophyIds.length} earned`;
  card.append(meta);

  const list = document.createElement('ul');
  list.className = 'stage-trophies';
  for (const id of stage.trophyIds) {
    const trophy = byId.get(id);
    if (!trophy) continue;
    const item = document.createElement('li');
    item.className = earned.has(id) ? 'done' : '';
    item.textContent = trophy.name;
    list.append(item);
  }
  card.append(list);
  return card;
}

// Render the whole roadmap into a container element.
export function renderRoadmap(container, roadmap, trophies, earned) {
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.textContent = roadmap.intro;
  container.append(intro);

  const summary = progressSummary(trophies, earned);
  const overall = document.createElement('p');
  overall.className = 'roadmap-overall';
  overall.textContent = `${summary.done} of ${summary.total} trophies earned — ${summary.byGrade.platinum.done}/1 platinum, ${summary.byGrade.gold.done}/2 gold, ${summary.byGrade.silver.done}/6 silver, ${summary.byGrade.bronze.done}/46 bronze.`;
  container.append(overall);

  const byId = new Map(trophies.map((t) => [t.id, t]));
  const stages = document.createElement('div');
  stages.className = 'stages';
  for (const stage of roadmap.stages) {
    stages.append(stageCard(stage, byId, earned));
  }
  container.append(stages);
}
