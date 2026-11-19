// Trophy list rendering: one row per trophy, a checkbox to tick it off,
// and an expandable guide with its sources. The spoiler setting hides a
// story trophy's name and description until the reader has earned it.
import { filterTrophies, KIND_LABELS } from './filters.js';

// A story trophy the reader has not earned yet: show a placeholder in
// place of its name and description while spoilers are hidden.
export function isSpoilerHidden(trophy, earned, spoilersHidden) {
  return spoilersHidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

function gradeChip(grade) {
  const chip = document.createElement('span');
  chip.className = `grade grade-${grade}`;
  chip.textContent = grade;
  return chip;
}

function sourceList(sources, sourceDefs) {
  const list = document.createElement('ul');
  list.className = 'sources';
  for (const key of sources) {
    const def = sourceDefs[key];
    if (!def) continue;
    const item = document.createElement('li');
    if (def.url) {
      const link = document.createElement('a');
      link.href = def.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = def.name;
      item.append(link);
    } else {
      item.textContent = def.name;
    }
    list.append(item);
  }
  return list;
}

// One trophy row: checkbox, grade, name, description, kind tags and the
// expandable guide. onToggle is called with (id, checked) when ticked.
export function trophyRow(trophy, state, onToggle) {
  const { earned, spoilersHidden, sourceDefs } = state;
  const hidden = isSpoilerHidden(trophy, earned, spoilersHidden);
  const row = document.createElement('article');
  row.className = 'trophy';
  row.dataset.id = String(trophy.id);
  if (earned.has(trophy.id)) row.classList.add('earned');

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', hidden ? `Mark hidden story trophy ${trophy.id} as earned` : `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  head.append(box, gradeChip(trophy.grade));

  const title = document.createElement('h3');
  title.textContent = hidden ? `Hidden story trophy #${trophy.id}` : trophy.name;
  head.append(title);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = 'Guide';
  toggle.setAttribute('aria-expanded', 'false');
  head.append(toggle);
  row.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Hidden on PlayStation until earned. Turn spoilers on to reveal it, or tick it off once you have earned it.' : trophy.description;
  row.append(desc);

  const tags = document.createElement('p');
  tags.className = 'trophy-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag tag-missable';
    miss.textContent = 'Missable';
    tags.append(miss);
  }
  if (trophy.hidden) {
    const hid = document.createElement('span');
    hid.className = 'tag';
    hid.textContent = 'Hidden on PSN';
    tags.append(hid);
  }
  if (trophy.count != null) {
    const count = document.createElement('span');
    count.className = 'tag';
    count.textContent = `Count: ${trophy.count.toLocaleString('en-US')}`;
    tags.append(count);
  }
  row.append(tags);

  const detail = document.createElement('div');
  detail.className = 'trophy-guide';
  detail.hidden = true;
  if (!hidden) {
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    detail.append(guide);
    const label = document.createElement('p');
    label.className = 'sources-label';
    label.textContent = 'Sources:';
    detail.append(label, sourceList(trophy.sources, sourceDefs));
  } else {
    const note = document.createElement('p');
    note.textContent = 'The guide for this story trophy is hidden with its name. Earn it, or turn spoilers on, to read it.';
    detail.append(note);
  }
  row.append(detail);

  toggle.addEventListener('click', () => {
    detail.hidden = !detail.hidden;
    toggle.setAttribute('aria-expanded', String(!detail.hidden));
  });
  return row;
}

// Render the filtered list into a container, plus an empty-state message
// when a filter matches nothing (the online filter always does: the game
// has no online trophies at launch).
export function renderList(container, trophies, state) {
  const shown = filterTrophies(trophies, state);
  container.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent =
      state.kind === 'online'
        ? 'No online trophies — GTA VI has no online trophies at launch. Every one of the 55 is single-player.'
        : 'No trophies match these filters. Loosen the filters or clear the search.';
    container.append(empty);
    return;
  }
  for (const trophy of shown) {
    container.append(trophyRow(trophy, state, state.onToggle));
  }
}
