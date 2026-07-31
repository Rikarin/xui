/**
 * One heading in a table of contents.
 *
 * The shape a markdown renderer already produces when it collects headings, so
 * a page hands its outline over without reshaping it.
 */
export interface XuiTocEntry {
  /** The heading's `id` — the fragment the link points at, and what scroll-spy observes. */
  id: string;

  /** The text shown in the outline. */
  label: string;

  /** Heading depth, `1` for `<h1>`. Drives both the indent and the `minLevel`/`maxLevel` filter. */
  level: number;
}
