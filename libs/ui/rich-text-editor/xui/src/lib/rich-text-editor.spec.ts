import { render, type RenderResult } from '@xui/testing';
import { XuiRichTextEditorImports, provideXuiRichTextSyntax, type XuiRichTextSyntax } from '../index';

const IMPORTS = [XuiRichTextEditorImports];

const surface = (result: RenderResult<never>) => result.query('[role="textbox"]');
const toolbar = (result: RenderResult<never>) =>
  result.queryAll('[role="toolbar"] button').map(button => button.getAttribute('aria-label'));

/** Types into the surface the way the browser does: DOM first, then `input`. */
function type(result: RenderResult<never>, html: string): void {
  surface(result).innerHTML = html;
  surface(result).dispatchEvent(new Event('input', { bubbles: true }));
  result.detect();
}

describe('XuiRichTextEditor', () => {
  it('renders the bound source text as formatted content', () => {
    const result = render(`<xui-rich-text-editor [value]="props().value" />`, {
      imports: IMPORTS,
      props: { value: '# Title\n\nSome **bold** text.' }
    });

    expect(surface(result as RenderResult<never>).innerHTML).toBe(
      '<h1>Title</h1><p>Some <strong>bold</strong> text.</p>'
    );
  });

  it('gives back source text, not HTML, when the content changes', () => {
    const result = render<{ value: string }>(`<xui-rich-text-editor [(value)]="props().value" />`, {
      imports: IMPORTS,
      props: { value: '' }
    });

    type(result as RenderResult<never>, '<p>A <em>quiet</em> word</p>');

    expect(result.fixture.componentInstance.props().value).toBe('A *quiet* word');
  });

  it('re-renders when the value is replaced from outside', () => {
    const result = render<{ value: string }>(`<xui-rich-text-editor [value]="props().value" />`, {
      imports: IMPORTS,
      props: { value: '- one' }
    });

    result.setProps({ value: '- one\n- two' });

    expect(surface(result as RenderResult<never>).innerHTML).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  describe('the toolbar follows the format', () => {
    it('offers headings and a divider for Markdown, but no underline', () => {
      const result = render(`<xui-rich-text-editor format="markdown" [sourceView]="false" />`, { imports: IMPORTS });
      const tools = toolbar(result);

      expect(tools).toContain('Heading 1');
      expect(tools).toContain('Divider');
      expect(tools).toContain('Inline code');
      expect(tools).not.toContain('Underline');
    });

    it('offers underline for BBCode, but no headings', () => {
      const result = render(`<xui-rich-text-editor format="bbcode" [sourceView]="false" />`, { imports: IMPORTS });
      const tools = toolbar(result);

      expect(tools).toContain('Underline');
      expect(tools).not.toContain('Heading 1');
      expect(tools).not.toContain('Divider');
      expect(tools).not.toContain('Inline code');
    });

    it('keeps the content and rewrites the value when the format changes', () => {
      const result = render<{ format: string; value: string }>(
        `<xui-rich-text-editor [format]="props().format" [(value)]="props().value" />`,
        { imports: IMPORTS, props: { format: 'markdown', value: '**bold** and *italic*' } }
      );

      result.setProps({ format: 'bbcode' });

      expect(result.fixture.componentInstance.props().value).toBe('[b]bold[/b] and [i]italic[/i]');
      expect(surface(result as RenderResult<never>).innerHTML).toBe('<p><strong>bold</strong> and <em>italic</em></p>');
    });

    it('says so when the format is unknown', () => {
      expect(() => render(`<xui-rich-text-editor format="rst" />`, { imports: IMPORTS })).toThrow(
        /unknown format "rst"/
      );
    });
  });

  describe('source view', () => {
    const SOURCE = `<xui-rich-text-editor [(value)]="props().value" [(source)]="props().source" />`;

    it('shows the source text itself', () => {
      const result = render<{ value: string; source: boolean }>(SOURCE, {
        imports: IMPORTS,
        props: { value: '# Title', source: true }
      });

      expect(result.query<HTMLTextAreaElement>('textarea').value).toBe('# Title');
    });

    it('feeds edits in the source view back into the value', () => {
      const result = render<{ value: string; source: boolean }>(SOURCE, {
        imports: IMPORTS,
        props: { value: '', source: true }
      });

      result.type('textarea', '> quoted');

      expect(result.fixture.componentInstance.props().value).toBe('> quoted');
    });

    it('carries the edit back into the formatted view', () => {
      const result = render<{ value: string; source: boolean }>(SOURCE, {
        imports: IMPORTS,
        props: { value: '', source: true }
      });

      result.type('textarea', '> quoted');
      result.setProps({ source: false });

      expect(surface(result as RenderResult<never>).innerHTML).toBe('<blockquote><p>quoted</p></blockquote>');
    });

    it('can be left out', () => {
      const result = render(`<xui-rich-text-editor [sourceView]="false" />`, { imports: IMPORTS });

      expect(toolbar(result)).not.toContain('Source');
    });
  });

  it('keeps hold of what a link is meant to wrap while the URL field has focus', () => {
    const result = render(`<xui-rich-text-editor [value]="props().value" />`, {
      imports: IMPORTS,
      props: { value: 'one two' }
    });
    const text = surface(result as RenderResult<never>).querySelector('p')!.firstChild!;
    const range = document.createRange();
    const selection = getSelection()!;

    range.setStart(text, 4);
    range.setEnd(text, 7);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(selection.toString()).toBe('two');

    result.click('[aria-label="Link"]');

    expect(result.query('[aria-label="Link URL"]')).toBeTruthy();

    // Focusing the URL field is what takes the selection away in a browser.
    selection.removeAllRanges();
    result.click('[aria-label="Link URL"] ~ button');

    expect(selection.toString()).toBe('two');
  });

  describe('disabled', () => {
    it('stops the surface being editable and greys the toolbar', () => {
      const result = render(`<xui-rich-text-editor disabled />`, { imports: IMPORTS });

      expect(surface(result).getAttribute('contenteditable')).toBeNull();
      expect(surface(result).getAttribute('aria-disabled')).toBe('true');
      expect(result.queryAll<HTMLButtonElement>('[role="toolbar"] button').every(button => button.disabled)).toBe(true);
    });
  });

  it('shows the placeholder only while empty', () => {
    const result = render<{ value: string }>(
      `<xui-rich-text-editor [value]="props().value" placeholder="Say something" />`,
      { imports: IMPORTS, props: { value: '' } }
    );

    expect(result.host.textContent).toContain('Say something');

    result.setProps({ value: 'Something' });

    expect(result.host.textContent).not.toContain('Say something');
  });

  it('takes a syntax the app registered itself', () => {
    const shouty: XuiRichTextSyntax = {
      name: 'shouty',
      features: ['bold'],
      toHtml: source => `<p>${source.toUpperCase()}</p>`,
      fromHtml: root => root.textContent ?? ''
    };

    const result = render(`<xui-rich-text-editor format="shouty" [value]="props().value" [sourceView]="false" />`, {
      imports: IMPORTS,
      providers: [provideXuiRichTextSyntax(shouty)],
      props: { value: 'hello' }
    });

    expect(surface(result as RenderResult<never>).innerHTML).toBe('<p>HELLO</p>');
    expect(toolbar(result as RenderResult<never>)).toEqual(['Bold']);
  });
});
