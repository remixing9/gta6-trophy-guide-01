// Tests for the GTA VI trophy guide data and pure filter logic.
// Run: node --test tests/trophies.test.mjs
// Written first, before the data and the app code (TDD): it fails until
// app/data/trophies.json, app/data/roadmap.json and lib/filters.js exist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(root, 'app', 'data', 'trophies.json');
const roadmapPath = join(root, 'app', 'data', 'roadmap.json');

function loadTrophies() {
  return JSON.parse(readFileSync(dataPath, 'utf8'));
}

test('trophy file exists and holds the official 55', () => {
  assert.ok(existsSync(dataPath), 'app/data/trophies.json must exist');
  const doc = loadTrophies();
  const list = doc.trophies ?? doc;
  assert.equal(list.length, 55, 'exactly 55 trophies');
});

test('grade split is 1 platinum, 2 gold, 6 silver, 46 bronze', () => {
  const list = loadTrophies().trophies;
  const count = (g) => list.filter((t) => t.grade === g).length;
  assert.equal(count('platinum'), 1);
  assert.equal(count('gold'), 2);
  assert.equal(count('silver'), 6);
  assert.equal(count('bronze'), 46);
});

test('every trophy has a unique official name, a description and a grade', () => {
  const list = loadTrophies().trophies;
  const names = new Set();
  for (const t of list) {
    assert.equal(typeof t.name, 'string');
    assert.ok(t.name.trim().length > 0, 'name must not be blank');
    assert.ok(!names.has(t.name), `duplicate name: ${t.name}`);
    names.add(t.name);
    assert.equal(typeof t.description, 'string');
    assert.ok(t.description.trim().length > 0, `${t.name}: description blank`);
    assert.ok(['platinum', 'gold', 'silver', 'bronze'].includes(t.grade), `${t.name}: bad grade`);
  }
  assert.ok(names.has('Vice Got a Price!'), 'platinum must be Vice Got a Price!');
  assert.ok(names.has('A Long Road'), 'gold A Long Road must be present');
  assert.ok(names.has('T**s Ass Drug Money'), 'asterisked chapter name must be present');
});

test('every trophy has a non-blank guide in our own words and a cited source', () => {
  const list = loadTrophies().trophies;
  for (const t of list) {
    assert.equal(typeof t.guide, 'string', `${t.name}: guide must be text`);
    assert.ok(t.guide.trim().length > 20, `${t.name}: guide too short`);
    assert.notEqual(t.guide.trim(), t.description.trim(), `${t.name}: guide must not repeat the description`);
    assert.ok(Array.isArray(t.sources) && t.sources.length > 0, `${t.name}: guide must cite at least one source`);
  }
});

test('every trophy has a valid kind and the missable flag is honest', () => {
  const list = loadTrophies().trophies;
  const kinds = new Set(['story', 'missable', 'collectibles', 'activities', 'completion', 'platinum', 'online']);
  for (const t of list) {
    assert.ok(kinds.has(t.kind), `${t.name}: unknown kind ${t.kind}`);
    assert.equal(typeof t.missable, 'boolean', `${t.name}: missable must be a boolean`);
  }
  const missable = list.filter((t) => t.missable);
  assert.ok(missable.length >= 1, 'at least one missable trophy must be flagged');
  assert.ok(missable.some((t) => t.name === 'Positive Mental Attitude'), 'Positive Mental Attitude must be flagged missable');
  assert.equal(list.filter((t) => t.kind === 'story').length, 17, '17 story trophies');
  assert.equal(list.filter((t) => t.kind === 'online').length, 0, 'no online trophies at launch');
});

test('roadmap exists, covers the platinum path and names its stages', () => {
  assert.ok(existsSync(roadmapPath), 'app/data/roadmap.json must exist');
  const road = JSON.parse(readFileSync(roadmapPath, 'utf8'));
  assert.ok(Array.isArray(road.stages) && road.stages.length >= 4, 'roadmap needs at least 4 stages');
  for (const s of road.stages) {
    assert.ok(s.title && s.title.trim().length > 0, 'stage needs a title');
    assert.ok(s.text && s.text.trim().length > 0, 'stage needs text');
    assert.ok(Array.isArray(s.trophyIds) && s.trophyIds.length > 0, 'stage needs trophy ids');
  }
  const covered = new Set(road.stages.flatMap((s) => s.trophyIds));
  assert.equal(covered.size, 55, 'roadmap must cover all 55 trophies');
});

test('pure filter logic: kind, grade, earned and search', async () => {
  const { filterTrophies } = await import('../app/lib/filters.js');
  const list = loadTrophies().trophies;
  const earned = new Set([1, 2]);
  assert.equal(filterTrophies(list, { kind: 'story', earned }).length, 17);
  assert.equal(filterTrophies(list, { kind: 'missable', earned }).length, 1);
  assert.equal(filterTrophies(list, { kind: 'online', earned }).length, 0);
  assert.equal(filterTrophies(list, { kind: 'all', grade: 'gold', earned }).length, 2);
  assert.equal(filterTrophies(list, { kind: 'all', earnedOnly: true, earned }).length, 2);
  assert.equal(filterTrophies(list, { kind: 'all', query: 'meditate', earned }).length, 2);
  assert.equal(filterTrophies(list, { kind: 'all', query: 'VICE', earned }).length, 4);
});
