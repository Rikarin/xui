import {
  escapeHtml,
  sanitizeUrl,
  serializeHtml,
  type XuiRichTextFeature,
  type XuiRichTextSyntax,
  type XuiRichTextWriter
} from './rich-text-syntax';

/**
 * The Markdown this syntax reads and writes.
 *
 * A deliberately small, portable subset — what a comment box needs and what
 * every Markdown renderer agrees on. No tables, footnotes, images or HTML
 * passthrough; no underline, which Markdown has no syntax for.
 */
const FEATURES: readonly XuiRichTextFeature[] = [
  'bold',
  'italic',
  'strike',
  'code',
  'link',
  'heading1',
  'heading2',
  'heading3',
  'bulletList',
  'orderedList',
  'quote',
  'codeBlock',
  'rule'
];

const writer: XuiRichTextWriter = {
  escape: text => text.replace(/([\\`*_[\]#>~])/g, '\\$1'),
  mark: (kind, inner, href) => {
    switch (kind) {
      case 'bold':
        return `**${inner}**`;
      case 'italic':
        return `*${inner}*`;
      case 'strike':
        return `~~${inner}~~`;
      case 'code':
        // Code spans are verbatim, so the backslashes `escape` added are noise.
        return `\`${inner.replace(/\\([\\`*_[\]#>~])/g, '$1')}\``;
      case 'link':
        return href ? `[${inner}](${href})` : inner;
      // Markdown cannot underline. Rather than invent `<u>`, the text stays put.
      default:
        return inner;
    }
  },
  block: (kind, inner) => {
    switch (kind) {
      case 'heading1':
        return `# ${inner}`;
      case 'heading2':
        return `## ${inner}`;
      case 'heading3':
        return `### ${inner}`;
      case 'quote':
        return inner
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n');
      default:
        return inner;
    }
  },
  list: (items, ordered) =>
    items.map((item, index) => (ordered ? `${index + 1}. ${item}` : `- ${item}`)).join('\n'),
  codeBlock: text => `\`\`\`\n${text.replace(/\n$/, '')}\n\`\`\``,
  rule: () => '---'
};

/** Markdown ⇄ the editor's HTML. */
export const markdownSyntax: XuiRichTextSyntax = {
  name: 'markdown',
  features: FEATURES,
  fromHtml: root => serializeHtml(root, writer),
  toHtml: source => blocksToHtml(source)
};

function blocksToHtml(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    // Fenced code: verbatim until the closing fence, or the end of the input.
    if (/^```/.test(line)) {
      const code: string[] = [];

      index++;

      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index++]);
      }

      index++;
      html.push(`<pre>${escapeHtml(code.join('\n'))}</pre>`);
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);

    if (heading) {
      const level = heading[1].length;

      html.push(`<h${level}>${inlineToHtml(heading[2])}</h${level}>`);
      index++;
      continue;
    }

    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      html.push('<hr>');
      index++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoted.push(lines[index++].replace(/^>\s?/, ''));
      }

      html.push(`<blockquote>${quoted.map(text => `<p>${inlineToHtml(text)}</p>`).join('')}</blockquote>`);
      continue;
    }

    const bullet = /^\s*[-*+]\s+/;
    const ordered = /^\s*\d+[.)]\s+/;

    if (bullet.test(line) || ordered.test(line)) {
      const isOrdered = ordered.test(line);
      const marker = isOrdered ? ordered : bullet;
      const items: string[] = [];

      while (index < lines.length && marker.test(lines[index])) {
        items.push(`<li>${inlineToHtml(lines[index++].replace(marker, ''))}</li>`);
      }

      html.push(isOrdered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    // Anything else runs on as a paragraph until a blank line or a new block.
    const paragraph: string[] = [];

    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) {
      paragraph.push(lines[index++]);
    }

    html.push(`<p>${paragraph.map(inlineToHtml).join('<br>')}</p>`);
  }

  return html.join('');
}

function startsBlock(line: string): boolean {
  return /^(```|#{1,3}\s|>|\s*[-*+]\s|\s*\d+[.)]\s)/.test(line) || /^(\s*[-*_]){3,}\s*$/.test(line);
}

/**
 * Stand-ins for the two things that must sit out the emphasis passes: a code
 * span, and a backslash-escaped character. Private-use codepoints, so nothing a
 * user can type collides with them.
 */
const SPAN = String.fromCharCode(0xe000);
const ESCAPED = String.fromCharCode(0xe001);

/**
 * Inline Markdown → HTML.
 *
 * Code spans and escapes are lifted out first and put back last. That is what
 * keeps `**` inside a code span from turning bold, and `\*` from being read as
 * emphasis at all — both are invisible to the passes in between.
 */
function inlineToHtml(text: string): string {
  const codeSpans: string[] = [];
  const escapes: string[] = [];

  let out = escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code: string) => {
      codeSpans.push(code);

      return `${SPAN}${codeSpans.length - 1}${SPAN}`;
    })
    .replace(/\\([\\`*_[\]#>~])/g, (_, char: string) => {
      escapes.push(char);

      return `${ESCAPED}${escapes.length - 1}${ESCAPED}`;
    });

  out = out
    .replace(/\[([^\]]+)]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
      const url = sanitizeUrl(href);

      return url ? `<a href="${escapeHtml(url)}">${label}</a>` : match;
    })
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
    .replace(/(?<![*\w])\*(?=\S)([^*]*?\S)\*(?![*\w])/g, '<em>$1</em>')
    .replace(/(?<![_\w])_(?=\S)([^_]*?\S)_(?![_\w])/g, '<em>$1</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<s>$1</s>');

  return out
    .replace(new RegExp(`${ESCAPED}(\\d+)${ESCAPED}`, 'g'), (_, index: string) => escapes[Number(index)])
    .replace(
      new RegExp(`${SPAN}(\\d+)${SPAN}`, 'g'),
      (_, index: string) => `<code>${codeSpans[Number(index)]}</code>`
    );
}
