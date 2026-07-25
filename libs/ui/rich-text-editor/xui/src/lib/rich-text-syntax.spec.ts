import { bbcodeSyntax } from './bbcode-syntax';
import { markdownSyntax } from './markdown-syntax';
import type { XuiRichTextSyntax } from './rich-text-syntax';

/** Source → HTML → source, which is the trip every keystroke in the editor makes. */
const roundTrip = (syntax: XuiRichTextSyntax, source: string): string => syntax.fromHtml(render(syntax, source));

function render(syntax: XuiRichTextSyntax, source: string): HTMLElement {
  const host = document.createElement('div');

  host.innerHTML = syntax.toHtml(source);

  return host;
}

describe('markdownSyntax', () => {
  it.each([
    ['**bold**'],
    ['*italic*'],
    ['~~struck~~'],
    ['`code()`'],
    ['[xui](https://xuijs.org)'],
    ['# Heading'],
    ['## Heading'],
    ['### Heading'],
    ['- one\n- two'],
    ['1. one\n2. two'],
    ['> quoted'],
    ['---'],
    ['A paragraph.'],
    ['First.\n\nSecond.'],
    ['Mixed **bold** and *italic* and `code`.']
  ])('round-trips %s', source => {
    expect(roundTrip(markdownSyntax, source)).toBe(source);
  });

  it('renders marks as the tags the editor works on', () => {
    expect(markdownSyntax.toHtml('**b** *i* ~~s~~ `c`')).toBe(
      '<p><strong>b</strong> <em>i</em> <s>s</s> <code>c</code></p>'
    );
  });

  it('keeps a fenced block verbatim', () => {
    const source = '```\nconst x = **not bold**;\n```';

    expect(markdownSyntax.toHtml(source)).toBe('<pre>const x = **not bold**;</pre>');
    expect(roundTrip(markdownSyntax, source)).toBe(source);
  });

  it('leaves punctuation inside a code span alone', () => {
    expect(markdownSyntax.toHtml('`a * b`')).toBe('<p><code>a * b</code></p>');
  });

  it('escapes markup a user typed as text', () => {
    const host = document.createElement('div');

    host.innerHTML = '<p>2 * 3 * 4 and _underscores_</p>';

    const source = markdownSyntax.fromHtml(host);

    expect(source).toBe('2 \\* 3 \\* 4 and \\_underscores\\_');
    expect(markdownSyntax.toHtml(source)).toBe('<p>2 * 3 * 4 and _underscores_</p>');
  });

  it('refuses a link that would run script', () => {
    expect(markdownSyntax.toHtml('[x](javascript:alert(1))')).not.toContain('href');
  });

  it('has no underline to offer', () => {
    expect(markdownSyntax.features).not.toContain('underline');
  });
});

describe('bbcodeSyntax', () => {
  it.each([
    ['[b]bold[/b]'],
    ['[i]italic[/i]'],
    ['[u]underlined[/u]'],
    ['[s]struck[/s]'],
    ['[url=https://xuijs.org]xui[/url]'],
    ['[quote]quoted[/quote]'],
    ['A paragraph.'],
    ['First.\n\nSecond.']
  ])('round-trips %s', source => {
    expect(roundTrip(bbcodeSyntax, source)).toBe(source);
  });

  it('round-trips a list', () => {
    expect(roundTrip(bbcodeSyntax, '[list]\n[*]one\n[*]two\n[/list]')).toBe('[list]\n[*]one\n[*]two\n[/list]');
  });

  it('round-trips a numbered list', () => {
    expect(roundTrip(bbcodeSyntax, '[list=1]\n[*]one\n[/list]')).toBe('[list=1]\n[*]one\n[/list]');
  });

  it('round-trips a code block', () => {
    expect(roundTrip(bbcodeSyntax, '[code]\nconst x = 1;\n[/code]')).toBe('[code]\nconst x = 1;\n[/code]');
  });

  it('unwraps nested tags from the inside out', () => {
    expect(bbcodeSyntax.toHtml('[b]bold [i]and italic[/i][/b]')).toBe(
      '<p><strong>bold <em>and italic</em></strong></p>'
    );
  });

  it('takes a bare [url] as its own label', () => {
    expect(bbcodeSyntax.toHtml('[url]https://xuijs.org[/url]')).toContain('href="https://xuijs.org"');
  });

  it('refuses a link that would run script', () => {
    expect(bbcodeSyntax.toHtml('[url=javascript:alert(1)]x[/url]')).not.toContain('href');
  });

  it('has underline but no headings', () => {
    expect(bbcodeSyntax.features).toContain('underline');
    expect(bbcodeSyntax.features).not.toContain('heading1');
  });

  it('degrades a heading it cannot express to a paragraph', () => {
    const host = document.createElement('div');

    host.innerHTML = '<h1>Title</h1><p>Body</p>';

    expect(bbcodeSyntax.fromHtml(host)).toBe('Title\n\nBody');
  });
});
