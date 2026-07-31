import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiProseImports } from '@xui/prose';
import { XuiToc, XuiTocImports, type XuiTocEntry } from '@xui/toc';

const ENTRIES: XuiTocEntry[] = [
  { id: 'what-it-is', label: 'What it is', level: 2 },
  { id: 'what-it-is-for', label: 'What it is for', level: 2 },
  { id: 'using-it', label: 'Using it', level: 2 },
  { id: 'the-first-call', label: 'The first call', level: 3 },
  { id: 'the-next-three', label: 'The next three things', level: 3 },
  { id: 'examples', label: 'Examples', level: 2 },
  { id: 'internals', label: 'Internals', level: 4 }
];

/**
 * The in-page outline: a list of the document's headings, with the one being read marked. The links
 * are plain fragment hrefs, so it needs no router and works on a prerendered page with no
 * JavaScript; what JavaScript adds is the highlight, from an `IntersectionObserver` over the real
 * headings.
 */
const meta: Meta<XuiToc> = {
  title: 'Navigation/Table of contents',
  component: XuiToc,
  args: {
    entries: ENTRIES,
    size: 'md',
    minLevel: 2,
    maxLevel: 3,
    label: 'On this page',
    scrollSpy: false
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    minLevel: { control: { type: 'number' } },
    maxLevel: { control: { type: 'number' } },
    scrollSpy: { control: { type: 'boolean' } },
    entries: { control: false }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiTocImports, XuiProseImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<xui-toc ${argsToTemplate(args)} class="w-56" />`
  })
};

export default meta;
type Story = StoryObj<XuiToc>;

export const Default: Story = {};

export const WithAnActiveEntry: Story = {
  args: { activeId: 'using-it' }
};

/** `maxLevel` decides how deep the outline goes; past `<h3>` it is longer than the page. */
export const DeeperLevels: Story = {
  args: { maxLevel: 4 }
};

export const NoHeading: Story = {
  args: { label: null }
};

/** Scroll the panel: the observer moves the highlight to whichever section is at the top. */
export const ScrollSpy: Story = {
  args: { scrollSpy: true },
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex gap-8">
        <article xuiProse class="h-96 flex-1 overflow-y-auto">
          <h2 xuiProseAnchor="what-it-is">What it is</h2>
          <p class="h-64">Scroll me.</p>
          <h2 xuiProseAnchor="what-it-is-for">What it is for</h2>
          <p class="h-64">Keep going.</p>
          <h2 xuiProseAnchor="using-it">Using it</h2>
          <p class="h-64">Nearly there.</p>
          <h2 xuiProseAnchor="examples">Examples</h2>
          <p class="h-64">The end.</p>
        </article>
        <xui-toc ${argsToTemplate(args)} class="w-56 shrink-0 self-start" />
      </div>
    `
  })
};
