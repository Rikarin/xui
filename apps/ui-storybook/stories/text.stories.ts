import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiText, XuiTextImports } from '@xui/text';

const meta: Meta<XuiText> = {
  title: 'Foundations/Typography',
  component: XuiText,
  args: {
    ellipsize: false
  },
  argTypes: {
    color: {
      options: ['default', 'muted', 'subtle', 'primary', 'success', 'error', 'warning', 'info'],
      control: { type: 'select' }
    },
    size: {
      options: ['xs', 'sm', 'md', 'base', 'lg'],
      control: { type: 'select' }
    },
    weight: {
      options: ['normal', 'medium', 'semibold', 'bold'],
      control: { type: 'select' }
    },
    ellipsize: { control: { type: 'boolean' } }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiTextImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<p xuiText ${argsToTemplate(args)}>The quick brown fox jumps over the lazy dog.</p>`
  })
};

export default meta;
type Story = StoryObj<XuiText>;

export const Default: Story = {};

/** The visual size follows the element's own level, keeping the outline honest. */
export const Headings: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <h1 xuiHeading>Heading level 1</h1>
        <h2 xuiHeading>Heading level 2</h2>
        <h3 xuiHeading>Heading level 3</h3>
        <h4 xuiHeading>Heading level 4</h4>
        <h5 xuiHeading>Heading level 5</h5>
        <h6 xuiHeading>Heading level 6</h6>
        <h2 xuiHeading [level]="5">Still an h2 in the outline, sized like an h5</h2>
      </div>
    `
  })
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-1">
        <p xuiText color="default">default — primary body copy</p>
        <p xuiText color="muted">muted — secondary copy</p>
        <p xuiText color="subtle">subtle — hints and placeholders</p>
        <p xuiText color="primary">primary</p>
        <p xuiText color="success">success</p>
        <p xuiText color="error">error</p>
        <p xuiText color="warning">warning</p>
        <p xuiText color="info">info</p>
      </div>
    `
  })
};

/**
 * Truncated text gains a `title` holding its own content — but only while it
 * actually overflows, so a tooltip never just repeats what is on screen.
 */
export const Ellipsize: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <div class="border-border w-48 rounded border p-2">
          <span xuiText ellipsize>Short enough</span>
        </div>
        <div class="border-border w-48 rounded border p-2">
          <span xuiText ellipsize>A considerably longer value that will not fit inside this box</span>
        </div>
      </div>
    `
  })
};

export const HtmlElements: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-prose flex-col gap-2">
        <p xuiText>Install it with <code xuiCode>pnpm i @xui/text</code>, then import the directives.</p>

        <blockquote xuiBlockquote>
          A directive on the native element keeps the semantics in the markup.
        </blockquote>

        <pre xuiCodeBlock><code>&lt;h1 xuiHeading&gt;Title&lt;/h1&gt;
&lt;p xuiText color="muted"&gt;Body&lt;/p&gt;</code></pre>

        <ul xuiList>
          <li>Unordered item</li>
          <li>
            Nested list
            <ul xuiList>
              <li>Inner item</li>
            </ul>
          </li>
        </ul>

        <ol xuiList>
          <li>Ordered item</li>
          <li>Second item</li>
        </ol>
      </div>
    `
  })
};
