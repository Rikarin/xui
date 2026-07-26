import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiRichTextEditor, XuiRichTextEditorImports } from '@xui/rich-text-editor';

/**
 * A WYSIWYG editor whose value is source text: the user formats content, the
 * binding is the Markdown or BBCode you store.
 *
 * The toolbar is the format's capabilities — Markdown gets headings, a divider
 * and inline code; BBCode gets underline instead. `</>` swaps the formatted
 * view for the source text, editable, and back.
 */
const meta: Meta<XuiRichTextEditor> = {
  title: 'Forms/Rich text editor',
  component: XuiRichTextEditor,
  decorators: [moduleMetadata({ imports: [XuiRichTextEditorImports] })]
};

export default meta;
type Story = StoryObj<XuiRichTextEditor>;

const MARKDOWN = [
  '## Release notes',
  '',
  'The editor round-trips **bold**, *italic*, ~~strikethrough~~, `code` and [links](https://xuijs.org).',
  '',
  '- Lists survive the trip',
  '- So do quotes and code blocks',
  '',
  '> Everything you see is stored as Markdown.'
].join('\n');

const BBCODE = [
  'BBCode has [u]underline[/u], which Markdown cannot express — so the toolbar shows it here and hides it there.',
  '',
  '[quote]The format decides what the toolbar offers.[/quote]',
  '',
  '[list]',
  '[*]bold, italic, underline, strike',
  '[*]links, quotes, lists, code',
  '[/list]'
].join('\n');

// The `<pre>` under each editor echoes the binding as you type, so the example shows the source
// text it stores rather than only the formatted view. Written out per story rather than shared
// through a helper: the docs extractor reads `template` as a literal, and a call expression there
// leaves the example with no markup at all.

/** The value beneath the editor is the actual binding, updating as you type. */
export const Markdown: Story = {
  render: () => ({
    props: { value: MARKDOWN },
    template: `
      <div class="max-w-2xl space-y-3">
        <xui-rich-text-editor [(value)]="value" placeholder="Say something…" />
        <pre class="bg-surface-sunken text-foreground-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{{ value || '(empty)' }}</pre>
      </div>
    `
  })
};

export const BBCode: Story = {
  render: () => ({
    props: { value: BBCODE },
    template: `
      <div class="max-w-2xl space-y-3">
        <xui-rich-text-editor [(value)]="value" format="bbcode" />
        <pre class="bg-surface-sunken text-foreground-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{{ value || '(empty)' }}</pre>
      </div>
    `
  })
};

/** Nothing to write yet: the placeholder sits behind the caret until you type. */
export const Empty: Story = {
  render: () => ({
    props: { value: '' },
    template: `
      <div class="max-w-2xl space-y-3">
        <xui-rich-text-editor [(value)]="value" placeholder="Write a comment…" />
        <pre class="bg-surface-sunken text-foreground-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{{ value || '(empty)' }}</pre>
      </div>
    `
  })
};

/** Start on the source text; the toggle moves between the two views. */
export const SourceView: Story = {
  render: () => ({
    props: { value: MARKDOWN, source: true },
    template: `
      <div class="max-w-2xl space-y-3">
        <xui-rich-text-editor [(value)]="value" [(source)]="source" />
        <pre class="bg-surface-sunken text-foreground-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{{ value || '(empty)' }}</pre>
      </div>
    `
  })
};

export const Disabled: Story = {
  render: () => ({
    props: { value: MARKDOWN },
    template: `<div class="max-w-2xl"><xui-rich-text-editor [value]="value" disabled /></div>`
  })
};
