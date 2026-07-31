import { expectClasses, render } from '@xui/testing';
import { XuiCodeBlockImports } from '../index';
import { codeBlockTokenClasses } from './code-block';
import { provideXuiCodeBlockConfig } from './code-block.token';
import type { XuiCodeLine, XuiCodeTab } from './code-block.types';

/** A two-line sample whose blank first and last lines the component is expected to drop. */
const SAMPLE = '\nconst x = 1;\nconst y = 2;\n';

const TOKENS: XuiCodeLine[] = [
  [
    { text: 'const', kind: 'keyword' },
    { text: ' x = ', kind: 'plain' },
    { text: '1', kind: 'number' }
  ]
];

/** The copy path awaits twice — the clipboard write, then the caller. Let both settle. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('XuiCodeBlock', () => {
  const clipboard = { writeText: jest.fn<Promise<void>, [string]>() };

  beforeEach(() => {
    clipboard.writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
  });

  it('renders one line per line and drops the blank ones around the sample', () => {
    const { queryAll } = render<{ code: string }>('<xui-code-block [code]="props().code" />', {
      imports: [XuiCodeBlockImports],
      props: { code: SAMPLE }
    });

    const lines = queryAll('pre code > span');

    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toBe('const x = 1;');
    expect(lines[1].textContent).toBe('const y = 2;');
  });

  it('colours a pre-tokenised line by kind, and renders the text as text', () => {
    const { queryAll } = render<{ tokens: XuiCodeLine[] }>('<xui-code-block [tokens]="props().tokens" />', {
      imports: [XuiCodeBlockImports],
      props: { tokens: TOKENS }
    });

    const spans = queryAll('pre code > span > span');

    expect(spans.map(span => span.textContent)).toEqual(['const', ' x = ', '1']);
    expectClasses(spans[0], ...codeBlockTokenClasses.keyword.split(' '));
    expectClasses(spans[2], ...codeBlockTokenClasses.number.split(' '));
  });

  it('marks the highlighted lines and leaves the others alone', () => {
    const { queryAll } = render<{ code: string; lines: number[] }>(
      '<xui-code-block [code]="props().code" [highlightLines]="props().lines" />',
      { imports: [XuiCodeBlockImports], props: { code: SAMPLE, lines: [2] } }
    );

    const lines = queryAll('pre code > span');

    expect(lines[0].className).not.toContain('bg-primary/10');
    expectClasses(lines[1], 'bg-primary/10');
  });

  it('shows the gutter only when asked, and sizes it to the widest number', () => {
    const { queryAll, query } = render<{ code: string }>('<xui-code-block [code]="props().code" showLineNumbers />', {
      imports: [XuiCodeBlockImports],
      props: { code: SAMPLE }
    });

    expect(queryAll('pre code > span > span[aria-hidden="true"]').map(el => el.textContent)).toEqual(['1', '2']);
    expect(query('pre').style.getPropertyValue('--xui-code-gutter')).toBe('3ch');
  });

  it('copies the trimmed sample and emits what it wrote', async () => {
    const copied: string[] = [];
    const { query, fixture } = render<{ code: string; onCopy: (code: string) => void }>(
      '<xui-code-block [code]="props().code" (copied)="props().onCopy($event)" />',
      { imports: [XuiCodeBlockImports], props: { code: SAMPLE, onCopy: code => copied.push(code) } }
    );

    query('button').click();
    await flush();
    fixture.detectChanges();

    expect(clipboard.writeText).toHaveBeenCalledWith('const x = 1;\nconst y = 2;');
    expect(copied).toEqual(['const x = 1;\nconst y = 2;']);
    expect(query('button').getAttribute('aria-label')).toBe('Copied');
  });

  it('copies the selected tab rather than the first one', async () => {
    const tabs: XuiCodeTab[] = [
      { label: 'a.ts', code: 'first' },
      { label: 'b.ts', code: 'second' }
    ];

    const { queryAll, click, query } = render<{ tabs: XuiCodeTab[] }>('<xui-code-block [tabs]="props().tabs" />', {
      imports: [XuiCodeBlockImports],
      props: { tabs }
    });

    click(queryAll('[role="tab"]')[1]);
    query('button[aria-label="Copy code"]').click();
    await flush();

    expect(clipboard.writeText).toHaveBeenCalledWith('second');
  });

  it('merges the class input instead of replacing the variant classes', () => {
    const { query } = render('<xui-code-block class="mt-4" />', { imports: [XuiCodeBlockImports] });

    expectClasses(query('xui-code-block'), 'mt-4', 'relative');
  });

  it('takes its defaults from the injected config', () => {
    const { queryAll } = render<{ code: string }>('<xui-code-block [code]="props().code" />', {
      imports: [XuiCodeBlockImports],
      props: { code: SAMPLE },
      providers: [provideXuiCodeBlockConfig({ showLineNumbers: true })]
    });

    expect(queryAll('pre code > span > span[aria-hidden="true"]')).toHaveLength(2);
  });

  it('wraps instead of scrolling when asked', () => {
    const { query } = render('<xui-code-block code="x" wrap />', { imports: [XuiCodeBlockImports] });

    expectClasses(query('pre'), 'whitespace-pre-wrap');
    expect(query('pre').className).not.toContain('overflow-x-auto');
  });
});
