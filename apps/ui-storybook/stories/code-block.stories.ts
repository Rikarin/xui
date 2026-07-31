import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiCodeBlock, XuiCodeBlockImports, type XuiCodeLine, type XuiCodeTab } from '@xui/code-block';

const SAMPLE = `import { signal } from '@angular/core';

const count = signal(0);
count.update(value => value + 1);
`;

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
  args: {
    code: SAMPLE,
    language: 'ts',
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
    tokens: { control: false },
    tabs: { control: false }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiCodeBlockImports, XuiButtonImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<xui-code-block ${argsToTemplate(args)} />`
  })
};

export default meta;
type Story = StoryObj<XuiCodeBlock>;

export const Default: Story = {};

export const WithFilename: Story = {
  args: { filename: 'counter.ts' }
};

export const LineNumbersAndHighlights: Story = {
  args: { showLineNumbers: true, highlightLines: [3, 4] }
};

/** The path the documentation site takes: spans classified by the real compiler, coloured here. */
export const PreTokenised: Story = {
  args: { tokens: TOKENS, filename: 'counter.ts', showLineNumbers: true }
};

export const Wrapped: Story = {
  args: {
    wrap: true,
    code: 'const message = "a single very long line that has nowhere to go but sideways, unless the block is told to wrap it, which is what this story is for";'
  }
};

export const Tabs: Story = {
  args: { tabs: TABS }
};

export const Sizes: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['size'] });

    return {
      props: args,
      template: `
        <div class="flex flex-col gap-4">
          <xui-code-block size="sm" ${rest} />
          <xui-code-block size="md" ${rest} />
          <xui-code-block size="lg" ${rest} />
        </div>
      `
    };
  }
};

/** The copy control is a slot: replace it and it still copies the visible sample. */
export const CustomCopyAction: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-code-block ${argsToTemplate(args)}>
        <ng-template xuiCodeBlockCopy let-copy let-copied="copied">
          <button xuiButton size="sm" variant="outline" class="absolute end-2 top-2" (click)="copy()">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </ng-template>
      </xui-code-block>
    `
  })
};
