/**
 * What a token is, semantically. The palette lives in this package, so a
 * producer classifies and never picks a colour — which is the only way a
 * highlighted sample can follow the active theme.
 *
 * The set is the intersection of what real classifiers emit: Roslyn's
 * classified spans, TextMate scopes and hand-written lexers all map onto it.
 * Anything a producer cannot classify is `plain`.
 */
export type XuiCodeTokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'type'
  | 'function'
  | 'variable'
  | 'property'
  | 'operator'
  | 'punctuation'
  | 'tag'
  | 'attribute'
  | 'constant'
  | 'namespace'
  | 'regex'
  | 'invalid';

/** One classified run of text within a line. */
export interface XuiCodeToken {
  /** The text itself. Rendered as a text node, never as markup. */
  text: string;

  /** What the run is. Defaults to `plain`, which takes the body colour. */
  kind?: XuiCodeTokenKind;

  /**
   * Classes for this run, replacing the ones {@link XuiCodeToken.kind} would
   * have chosen. The escape hatch for a producer with a palette of its own; the
   * kinds are the supported path.
   */
  class?: string;
}

/** One line of a sample: the tokens it is made of, in order. */
export type XuiCodeLine = readonly XuiCodeToken[];

/** One tab of a multi-file sample. */
export interface XuiCodeTab {
  /** The tab-strip label — usually the file name. */
  label: string;

  /** The sample's text. Also what the copy button writes, whether or not `tokens` is set. */
  code: string;

  /** Pre-tokenised lines, as in {@link XuiCodeBlock.tokens}. */
  tokens?: readonly XuiCodeLine[];

  /** Language badge for this tab. Falls back to the block's own `language`. */
  language?: string;
}
