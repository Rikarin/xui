import {
  escapeHtml,
  sanitizeUrl,
  serializeHtml,
  type XuiRichTextFeature,
  type XuiRichTextSyntax,
  type XuiRichTextWriter
} from './rich-text-syntax';

/**
 * The BBCode this syntax reads and writes.
 *
 * The tags every forum agrees on. BBCode has underline, which Markdown lacks;
 * it has no headings and no thematic break, so the toolbar drops those — the
 * format decides what the toolbar offers, not the other way round.
 */
const FEATURES: readonly XuiRichTextFeature[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'bulletList',
  'orderedList',
  'quote',
  'codeBlock'
];

const writer: XuiRichTextWriter = {
  // BBCode has no escape character. A stray `[` is only ambiguous next to a tag
  // name, so that is the one case worth neutralising.
  escape: text => text.replace(/\[(?=\/?[a-z*]+[\]=])/gi, '&#91;'),
  mark: (kind, inner, href) => {
    switch (kind) {
      case 'bold':
        return `[b]${inner}[/b]`;
      case 'italic':
        return `[i]${inner}[/i]`;
      case 'underline':
        return `[u]${inner}[/u]`;
      case 'strike':
        return `[s]${inner}[/s]`;
      case 'link':
        return href ? `[url=${href}]${inner}[/url]` : inner;
      // No inline-code tag in BBCode: `[code]` is a block everywhere.
      default:
        return inner;
    }
  },
  block: (kind, inner) => {
    switch (kind) {
      case 'quote':
        return `[quote]${inner}[/quote]`;
      // Headings degrade to plain paragraphs rather than to a `[size]` guess.
      default:
        return inner;
    }
  },
  list: (items, ordered) =>
    [ordered ? '[list=1]' : '[list]', ...items.map(item => `[*]${item}`), '[/list]'].join('\n'),
  codeBlock: text => `[code]\n${text.replace(/\n$/, '')}\n[/code]`,
  rule: () => ''
};

/** BBCode ⇄ the editor's HTML. */
export const bbcodeSyntax: XuiRichTextSyntax = {
  name: 'bbcode',
  features: FEATURES,
  fromHtml: root => serializeHtml(root, writer),
  toHtml: source => bbcodeToHtml(source)
};

/** `[tag]…[/tag]` → HTML element, innermost pair first. */
const PAIRS: [RegExp, string][] = [
  [/\[b]([\s\S]*?)\[\/b]/gi, '<strong>$1</strong>'],
  [/\[i]([\s\S]*?)\[\/i]/gi, '<em>$1</em>'],
  [/\[u]([\s\S]*?)\[\/u]/gi, '<u>$1</u>'],
  [/\[s]([\s\S]*?)\[\/s]/gi, '<s>$1</s>']
];

function bbcodeToHtml(source: string): string {
  const blocks = splitBlocks(source.replace(/\r\n?/g, '\n'));

  return blocks.join('');
}

/**
 * Block tags first — they own whole lines and may hold inline markup — then
 * whatever is left becomes paragraphs.
 */
function splitBlocks(source: string): string[] {
  const html: string[] = [];
  const pattern = /\[(code|quote|list)(=1)?]([\s\S]*?)\[\/\1]/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    html.push(...paragraphs(source.slice(cursor, match.index)));
    cursor = match.index + match[0].length;

    const [, tag, ordered, body] = match;

    if (tag.toLowerCase() === 'code') {
      html.push(`<pre>${escapeHtml(body.replace(/^\n|\n$/g, ''))}</pre>`);
      continue;
    }

    if (tag.toLowerCase() === 'quote') {
      html.push(`<blockquote>${paragraphs(body).join('') || '<p></p>'}</blockquote>`);
      continue;
    }

    const items = body
      .split(/\[\*]/)
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => `<li>${inlineToHtml(item)}</li>`)
      .join('');

    html.push(ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`);
  }

  html.push(...paragraphs(source.slice(cursor)));

  return html;
}

function paragraphs(source: string): string[] {
  return source
    .split(/\n{2,}/)
    .map(block => block.replace(/^\n+|\n+$/g, ''))
    .filter(block => block.trim())
    .map(block => `<p>${block.split('\n').map(inlineToHtml).join('<br>')}</p>`);
}

function inlineToHtml(text: string): string {
  let out = escapeHtml(text).replace(/\[url(?:=([^\]]+))?]([\s\S]*?)\[\/url]/gi, (match, href: string, label: string) => {
    const url = sanitizeUrl(href ?? label);

    return url ? `<a href="${escapeHtml(url)}">${label || escapeHtml(url)}</a>` : match;
  });

  for (const [pattern, replacement] of PAIRS) {
    // Non-greedy matches close the innermost pair first, so repeating until the
    // text settles unwraps nested tags from the inside out.
    let previous: string;

    do {
      previous = out;
      out = out.replace(pattern, replacement);
    } while (out !== previous);
  }

  return out;
}
