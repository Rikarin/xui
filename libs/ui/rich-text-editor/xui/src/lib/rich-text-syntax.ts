/**
 * A formatting feature. The editor's toolbar offers exactly the features the
 * active syntax declares, so nothing can be applied that the format cannot
 * express — Markdown has no underline, BBCode has no headings.
 */
export type XuiRichTextMark = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link';

export type XuiRichTextBlock =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'quote'
  | 'codeBlock'
  | 'rule';

export type XuiRichTextFeature = XuiRichTextMark | XuiRichTextBlock;

/**
 * Turns the editor's HTML into source text.
 *
 * The editor edits one canonical HTML subset — `p`, `h1`–`h3`, `ul`/`ol`,
 * `blockquote`, `pre`, `hr` and the inline marks — and a syntax is only the
 * translation at each end. Implement one to teach the editor a new format;
 * nothing else changes.
 */
export interface XuiRichTextWriter {
  /** Escape text so the syntax's own punctuation is not read as markup. */
  escape(text: string): string;
  /** Wrap `inner` in a mark, or return it untouched when the syntax lacks one. */
  mark(kind: XuiRichTextMark, inner: string, href?: string): string;
  /** Wrap a block's already-serialised inline content. */
  block(kind: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'quote', inner: string): string;
  /** A whole list, given its already-serialised items. */
  list(items: string[], ordered: boolean): string;
  /** Verbatim text — never escaped, never marked up. */
  codeBlock(text: string): string;
  /** A thematic break. */
  rule(): string;
}

/** Both directions of one text format. */
export interface XuiRichTextSyntax {
  /** How the format is named in the `format` input — `'markdown'`, `'bbcode'`, … */
  readonly name: string;
  /** What this format can express. Anything absent is left out of the toolbar. */
  readonly features: readonly XuiRichTextFeature[];
  /** Source text → the editor's HTML subset. Must return markup it produced itself. */
  toHtml(source: string): string;
  /** The editor's HTML → source text. */
  fromHtml(root: HTMLElement): string;
}

const MARK_TAGS: Record<string, XuiRichTextMark> = {
  STRONG: 'bold',
  B: 'bold',
  EM: 'italic',
  I: 'italic',
  U: 'underline',
  S: 'strike',
  STRIKE: 'strike',
  DEL: 'strike',
  CODE: 'code',
  A: 'link'
};

/**
 * Walks the editor's HTML and hands each piece to `writer`.
 *
 * Shared by every syntax so they only describe *what* their markup looks like,
 * never how to traverse a DOM — and so a new syntax cannot get the traversal
 * subtly wrong.
 */
export function serializeHtml(root: HTMLElement, writer: XuiRichTextWriter): string {
  const blocks: string[] = [];

  for (const node of Array.from(root.childNodes)) {
    const block = serializeBlock(node, writer);

    if (block !== null) {
      blocks.push(block);
    }
  }

  return blocks.filter(block => block !== '').join('\n\n');
}

function serializeBlock(node: Node, writer: XuiRichTextWriter): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';

    // Loose text between blocks — browsers leave it there after some edits.
    return text.trim() ? writer.block('paragraph', writer.escape(text)) : null;
  }

  if (!(node instanceof Element)) {
    return null;
  }

  switch (node.tagName) {
    case 'H1':
      return writer.block('heading1', serializeInline(node, writer));
    case 'H2':
      return writer.block('heading2', serializeInline(node, writer));
    case 'H3':
      return writer.block('heading3', serializeInline(node, writer));
    case 'BLOCKQUOTE':
      return writer.block('quote', quoteContent(node as HTMLElement, writer));
    case 'PRE':
      return writer.codeBlock(node.textContent ?? '');
    case 'HR':
      return writer.rule();
    case 'UL':
    case 'OL':
      return writer.list(
        Array.from(node.children)
          .filter(child => child.tagName === 'LI')
          .map(item => serializeInline(item, writer)),
        node.tagName === 'OL'
      );
    case 'BR':
      return null;
    default:
      // `p`, `div` (what some browsers still produce on Enter), and anything
      // else that reached the top level: treat as a paragraph.
      return writer.block('paragraph', serializeInline(node, writer));
  }
}

/** A quote may hold blocks of its own; flatten them to lines. */
function quoteContent(node: HTMLElement, writer: XuiRichTextWriter): string {
  const hasBlocks = Array.from(node.children).some(child => /^(P|DIV|H[1-3])$/.test(child.tagName));

  if (!hasBlocks) {
    return serializeInline(node, writer);
  }

  return Array.from(node.children)
    .map(child => serializeInline(child, writer))
    .filter(Boolean)
    .join('\n');
}

function serializeInline(node: Node, writer: XuiRichTextWriter): string {
  let out = '';

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += writer.escape(child.textContent ?? '');
      continue;
    }

    if (!(child instanceof Element)) {
      continue;
    }

    if (child.tagName === 'BR') {
      out += '\n';
      continue;
    }

    const mark = MARK_TAGS[child.tagName];
    const inner = child.tagName === 'CODE' ? writer.escape(child.textContent ?? '') : serializeInline(child, writer);

    out += mark ? writer.mark(mark, inner, child.getAttribute('href') ?? undefined) : inner;
  }

  return out;
}

/** Escapes text for insertion into the editor's HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Keeps `javascript:` and friends out of an `href`.
 *
 * Source text is user input as far as this package is concerned — a comment, a
 * forum post — so a link is only ever emitted when its scheme is one that can
 * do nothing but navigate.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  return /^(https?:|mailto:|tel:|\/|#|\.)/i.test(trimmed) ? trimmed : '';
}
