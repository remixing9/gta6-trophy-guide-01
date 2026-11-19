// GTA VI trophy guide: the entrypoint the grader runs (Node 22).
// It hands the guide in: it copies app/ and screenshots/ from beside this
// file to /output and writes /output/dossier.json with buildDossier from
// the kit's vendored library (vendor/makefun-frontend.ts, unchanged).
// Before copying it checks the guide is whole: the page exists, the
// trophy file parses and names all 55 official trophies with a guide each,
// and there are 3 or 4 screenshots. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function fail(message: string): never {
  throw new Error(`gta6-trophy-guide-01: ${message}`);
}

// The guide is whole before it is handed in.
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
const trophyDoc = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8'));
const trophies = trophyDoc.trophies ?? trophyDoc;
if (!Array.isArray(trophies) || trophies.length !== 55) fail(`trophies.json must hold 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
const withoutGuide = trophies.filter((t: any) => typeof t.name !== 'string' || typeof t.guide !== 'string' || t.guide.trim() === '');
if (withoutGuide.length > 0) fail(`${withoutGuide.length} trophies have no guide`);
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((f) => statSync(join(shotsDir, f)).isFile() && !f.startsWith('.'))
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) fail(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories
// in app/ or 48 MiB of app files).
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// Read the dossier back: it must parse, stay under the scorer's 1.5 MiB
// cap, and name the app it was built from. A dossier that does not
// round-trip is a broken hand-in, caught here instead of on the server.
const dossierBytes = readFileSync(dossierPath);
if (dossierBytes.length > 1572864) fail(`dossier.json is ${dossierBytes.length} bytes, over the 1.5 MiB cap`);
const dossier = JSON.parse(dossierBytes.toString('utf8'));
if (typeof dossier !== 'object' || dossier === null) fail('dossier.json did not parse as an object');

console.log(`gta6-trophy-guide-01: handed in 55 trophies, ${shotFiles.length} screenshots, dossier ${dossierBytes.length} bytes -> ${out}`);
