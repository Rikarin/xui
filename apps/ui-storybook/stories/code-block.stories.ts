import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiCodeBlock, XuiCodeBlockImports, type XuiCodeLine, type XuiCodeTab } from '@xui/code-block';

const SAMPLE = `import { signal } from '@angular/core';

const count = signal(0);
count.update(value => value + 1);
`;

const LONG_LINE =
  'const message = "a single very long line that has nowhere to go but sideways, unless the block is told to wrap it, which is what this story is for";';

/**
 * What a build-time classifier hands over: one entry per line, each a run of
 * text plus what that run *is*. No colours — the package owns those.
 */
const TOKENS: XuiCodeLine[] = [
  [
    { text: 'import', kind: 'keyword' },
    { text: ' { ', kind: 'punctuation' },
    { text: 'signal', kind: 'function' },
    { text: ' } ', kind: 'punctuation' },
    { text: 'from', kind: 'keyword' },
    { text: ' ', kind: 'plain' },
    { text: "'@angular/core'", kind: 'string' },
    { text: ';', kind: 'punctuation' }
  ],
  [],
  [
    { text: 'const', kind: 'keyword' },
    { text: ' count ', kind: 'variable' },
    { text: '=', kind: 'operator' },
    { text: ' ', kind: 'plain' },
    { text: 'signal', kind: 'function' },
    { text: '(', kind: 'punctuation' },
    { text: '0', kind: 'number' },
    { text: ');', kind: 'punctuation' }
  ],
  [{ text: '// and then some', kind: 'comment' }]
];

const TABS: XuiCodeTab[] = [
  { label: 'counter.ts', code: SAMPLE, language: 'ts' },
  { label: 'counter.html', code: '<button (click)="count.set(count() + 1)">{{ count() }}</button>', language: 'html' },
  { label: 'install.sh', code: 'pnpm add @xui/code-block', language: 'bash' }
];

/**
 * A code sample: pre-tokenised, copyable, optionally numbered, wrapped and tabbed. It never
 * tokenises — highlighting arrives already classified, from whatever knows the language, and each
 * run renders as a text node under a class this package chose, so no grammar ships to the browser
 * and a highlighted sample still follows the active theme.
 */
const meta: Meta<XuiCodeBlock> = {
  title: 'Foundations/Code block',
  component: XuiCodeBlock,
  // The sample rides in on `props` rather than `args`: an arg has to survive being written out as an
  // attribute, and a multi-line one cannot. Everything the controls should reach stays an arg.
  args: {
    size: 'md',
    showLineNumbers: false,
    wrap: false,
    copyable: true
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    showLineNumbers: { control: { type: 'boolean' } },
    wrap: { control: { type: 'boolean' } },
    copyable: { control: { type: 'boolean' } },
    code: { control: false },
    tokens: { control: false },
    tabs: { control: false }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiCodeBlockImports, XuiButtonImports]
    })
  ],
  render: ({ ...args }) => ({
    props: { ...args, sample: SAMPLE },
    template: `<xui-code-block [code]="sample" ${argsToTemplate(args)} />`
  })
};

export default meta;
type Story = StoryObj<XuiCodeBlock>;

export const Default: Story = {};

export const WithFilename: Story = {
  args: { filename: 'counter.ts', language: 'ts' }
};

export const LineNumbersAndHighlights: Story = {
  render: ({ ...args }) => ({
    props: { ...args, sample: SAMPLE, lines: [3, 4] },
    template: `<xui-code-block [code]="sample" [highlightLines]="lines" showLineNumbers ${argsToTemplate(args, {
      exclude: ['showLineNumbers']
    })} />`
  })
};

/** The path the documentation site takes: spans classified by the real compiler, coloured here. */
export const PreTokenised: Story = {
  render: ({ ...args }) => ({
    props: { ...args, sample: SAMPLE, tokens: TOKENS },
    template: `<xui-code-block [code]="sample" [tokens]="tokens" filename="counter.ts" showLineNumbers />`
  })
};

export const Wrapped: Story = {
  render: ({ ...args }) => ({
    props: { ...args, sample: LONG_LINE },
    template: `<xui-code-block [code]="sample" wrap ${argsToTemplate(args, { exclude: ['wrap'] })} />`
  })
};

export const Tabs: Story = {
  render: ({ ...args }) => ({
    props: { ...args, tabs: TABS },
    template: `<xui-code-block [tabs]="tabs" ${argsToTemplate(args)} />`
  })
};

export const Sizes: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['size'] });

    return {
      props: { ...args, sample: SAMPLE },
      template: `
        <div class="flex flex-col gap-4">
          <xui-code-block size="sm" [code]="sample" ${rest} />
          <xui-code-block size="md" [code]="sample" ${rest} />
          <xui-code-block size="lg" [code]="sample" ${rest} />
        </div>
      `
    };
  }
};

/** The copy control is a slot: replace it and it still copies the visible sample. */
export const CustomCopyAction: Story = {
  render: ({ ...args }) => ({
    props: { ...args, sample: SAMPLE },
    template: `
      <xui-code-block [code]="sample" ${argsToTemplate(args)}>
        <ng-template xuiCodeBlockCopy let-copy let-copied="copied">
          <button xuiButton size="sm" variant="outline" class="absolute end-2 top-2" (click)="copy()">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </ng-template>
      </xui-code-block>
    `
  })
};
