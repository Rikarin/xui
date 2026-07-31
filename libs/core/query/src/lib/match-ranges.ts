/** A half-open `[start, end)` slice of a string that matched the query. */
export type XMatchRange = readonly [start: number, end: number];

/** One run of a label, flagged with whether it matched. */
export interface XMatchSegment {
  text: string;
  /** Whether this run is part of a match — what a `<mark>` wraps. */
  match: boolean;
}

/**
 * Where `query` occurs in `text`, case-insensitively.
 *
 * The query is split on whitespace and every term is matched independently, so
 * "mesh render" highlights both words of `MeshRenderer` — which is the search a
 * person actually typed, rather than the literal string. Overlapping and
 * adjacent hits are merged, and the result is sorted, so a caller can walk it
 * once.
 *
 * Positions, not markup: nothing here produces HTML, so a label with `<` in it
 * cannot become an element. See {@link splitXMatchRanges}.
 */
export function matchXRanges(text: string, query: string): XMatchRange[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0);

  if (!terms.length || !text) {
    return [];
  }

  const haystack = text.toLowerCase();
  const found: XMatchRange[] = [];

  for (const term of terms) {
    let from = haystack.indexOf(term);

    while (from !== -1) {
      found.push([from, from + term.length]);
      from = haystack.indexOf(term, from + term.length);
    }
  }

  return mergeRanges(found);
}

/**
 * Cut `text` into alternating unmatched and matched runs.
 *
 * The segments always re-join to exactly the input, so rendering them as text
 * nodes reproduces the label without a highlighter ever touching markup.
 */
export function splitXMatchRanges(text: string, ranges: readonly XMatchRange[]): XMatchSegment[] {
  const merged = mergeRanges([...ranges]);

  if (!merged.length) {
    return text ? [{ text, match: false }] : [];
  }

  const segments: XMatchSegment[] = [];
  let cursor = 0;

  for (const [start, end] of merged) {
    // A range past the end of the text — from a stale query — is skipped rather
    // than allowed to produce an empty or reversed slice.
    if (start >= text.length || end <= cursor) {
      continue;
    }

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), match: false });
    }

    segments.push({ text: text.slice(Math.max(start, cursor), Math.min(end, text.length)), match: true });
    cursor = Math.min(end, text.length);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
}

/** Sort by start and fold anything overlapping or touching into one range. */
function mergeRanges(ranges: XMatchRange[]): XMatchRange[] {
  const sorted = ranges.filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: XMatchRange[] = [];

  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];

    if (last && start <= last[1]) {
      merged[merged.length - 1] = [last[0], Math.max(last[1], end)];
      continue;
    }

    merged.push([start, end]);
  }

  return merged;
}
