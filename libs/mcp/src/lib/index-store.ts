import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildIndex } from './build-index.js';
import type { XuiComponent, XuiIndex } from './types.js';
import { resolveWorkspaceRoot } from './workspace.js';

/** Index generated at publish time, sitting next to the compiled sources. */
const BUNDLED_INDEX = new URL('../xui-index.json', import.meta.url);

/** This package's own manifest, one level above the compiled `src`. */
const OWN_MANIFEST = new URL('../../package.json', import.meta.url);

let cached: Promise<XuiIndex> | undefined;

/**
 * Resolve the index once per process.
 *
 * Inside an xUI checkout the index is extracted live, so an agent editing a component sees its own
 * change on the next `refresh`. Everywhere else the JSON generated at publish time is used, which
 * keeps the published package free of a `typescript` dependency.
 */
export function getIndex(): Promise<XuiIndex> {
  cached ??= loadIndex();

  return cached;
}

export async function refreshIndex(): Promise<XuiIndex> {
  cached = loadIndex();

  return cached;
}

async function loadIndex(): Promise<XuiIndex> {
  const workspaceRoot = resolveWorkspaceRoot();

  if (workspaceRoot) {
    return buildIndex(workspaceRoot);
  }

  const bundledPath = fileURLToPath(BUNDLED_INDEX);

  if (existsSync(bundledPath)) {
    const bundled = JSON.parse(readFileSync(bundledPath, 'utf8')) as XuiIndex;

    return { ...bundled, source: 'bundled', version: ownVersion() ?? bundled.version };
  }

  throw new Error(
    'No xUI component index available. Run the server from inside an xUI checkout, or set ' +
      'XUI_WORKSPACE_ROOT to one. A published @xui/mcp ships a pre-generated index instead.'
  );
}

/**
 * The version of the library this package was published alongside, or `undefined` when the manifest
 * cannot be read.
 *
 * A bundled index carries whatever `libs/core/package.json` said when it was generated, and
 * `nx release` generates it — through `preVersionCommand` — *before* it bumps the versions. The
 * stamp inside a published index is therefore always one release behind the package carrying it.
 * Our own manifest is rewritten by the release, so it is the authority here.
 *
 * This holds because the workspace releases under `projectsRelationship: 'fixed'`: `@xui/mcp` and
 * `@xui/core` always carry the same version. It applies to the bundled index only — in a checkout
 * the index is built from the tree as it stands, and its own stamp is already right.
 */
function ownVersion(): string | undefined {
  try {
    const manifest = JSON.parse(readFileSync(fileURLToPath(OWN_MANIFEST), 'utf8')) as { version?: string };

    return manifest.version;
  } catch {
    // A malformed or missing manifest is not worth failing the whole index over; the baked stamp is
    // stale by a release, not wrong in kind.
    return undefined;
  }
}

/** Accepts a folder name (`date-picker`), a package name (`@xui/date-picker`) or a selector. */
export function findComponent(index: XuiIndex, query: string): XuiComponent | undefined {
  const needle = query.trim().toLowerCase();

  return (
    index.components.find(component => component.name.toLowerCase() === needle) ??
    index.components.find(component => component.package.toLowerCase() === needle) ??
    index.components.find(component => `@xui/${component.name}`.toLowerCase() === needle) ??
    index.components.find(component =>
      component.symbols.some(
        symbol =>
          symbol.name.toLowerCase() === needle ||
          symbol.selector?.toLowerCase() === needle ||
          symbol.exportAs?.toLowerCase() === needle
      )
    )
  );
}

/**
 * Close matches for an unknown name, so a miss can suggest instead of just failing. Substring hits
 * come first, then near-misses by edit distance - a typo ("buttn") has to reach `button` too.
 */
export function suggestComponents(index: XuiIndex, query: string, limit = 8): string[] {
  const needle = query
    .trim()
    .toLowerCase()
    .replace(/^@xui\//, '');

  if (!needle) {
    return [];
  }

  return index.components
    .map(component => {
      const name = component.name;
      const contains = name.includes(needle) || needle.includes(name);
      const distance = editDistance(name, needle);

      return { name, contains, distance };
    })
    .filter(candidate => candidate.contains || candidate.distance <= Math.max(2, Math.floor(needle.length / 4)))
    .sort((a, b) => Number(b.contains) - Number(a.contains) || a.distance - b.distance)
    .slice(0, limit)
    .map(candidate => candidate.name);
}

/** Levenshtein distance, iterative single-row - the names compared are a handful of characters. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }

    previous = current;
  }

  return previous[b.length];
}

export interface ComponentMatch {
  name: string;
  package: string;
  score: number;
  matchedOn: string[];
}

/** Rank components by how well they answer a free-text need ("date range", "toast", "grid"). */
export function searchComponents(index: XuiIndex, query: string, limit = 10): ComponentMatch[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (!terms.length) {
    return [];
  }

  const matches: ComponentMatch[] = [];

  for (const component of index.components) {
    const matchedOn: string[] = [];
    let score = 0;

    for (const term of terms) {
      if (component.name.includes(term)) {
        score += 10;
        matchedOn.push(`name:${component.name}`);
      }

      for (const symbol of component.symbols) {
        if (symbol.selector?.toLowerCase().includes(term)) {
          score += 6;
          matchedOn.push(`selector:${symbol.selector}`);
        } else if (symbol.name.toLowerCase().includes(term)) {
          score += 4;
          matchedOn.push(`symbol:${symbol.name}`);
        }

        const docHit = symbol.docs?.toLowerCase().includes(term);

        if (docHit) {
          score += 2;
          matchedOn.push(`docs:${symbol.name}`);
        }

        for (const input of symbol.inputs) {
          if (input.name.toLowerCase() === term) {
            score += 2;
            matchedOn.push(`input:${symbol.name}.${input.name}`);
          }
        }
      }
    }

    if (score > 0) {
      matches.push({ name: component.name, package: component.package, score, matchedOn: [...new Set(matchedOn)] });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
