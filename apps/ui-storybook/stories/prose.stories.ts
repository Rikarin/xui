import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiProse, XuiProseImports } from '@xui/prose';

/** The shape a markdown renderer actually emits — every block, no classes on any of it. */
const DOCUMENT = `
  <h1>Entity queries</h1>
  <p>Iterating the entities that have a given set of components. A query is
     <strong>declarative</strong>: you describe the shape, the world finds the matches.</p>
  <h2>What it is for</h2>
  <p>Reach for one when a system has to touch every entity with a
     <code>Position</code> and a <code>Velocity</code>, and for nothing else. See
     <a href="#chunks">chunks</a> for what that costs.</p>
  <ul>
    <li>Matching is by archetype, not by entity.</li>
    <li>The result is stable for the frame.
      <ul><li>Structural changes are deferred to the barrier.</li></ul>
    </li>
  </ul>
  <h3>Example</h3>
  <pre><code>var moving = new QueryDescription().WithAll&lt;Position, Velocity&gt;();</code></pre>
  <blockquote><p>A query that matches nothing is not an error — it is a frame with no work.</p></blockquote>
  <table>
    <thead><tr><th>Method</th><th>Returns</th></tr></thead>
    <tbody>
      <tr><td><code>WithAll</code></td><td>The same query</td></tr>
      <tr><td><code>Count</code></td><td>Matching entity count</td></tr>
    </tbody>
  </table>
  <hr />
  <p>Press <kbd>F5</kbd> to re-run the scene.</p>
`;

/**
 * Typography for rendered markdown: styles the raw HTML a renderer produced, with no per-element
 * classes to add. Every rule resolves to a semantic token rather than a grey of its own, and they
 * are descendant selectors, so they reach content that arrived as a string just as readily as
 * content written in a template.
 */
const meta: Meta<XuiProse> = {
  title: 'Foundations/Prose',
  component: XuiProse,
  args: {
    size: 'md',
    density: 'comfortable'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    density: {
      options: ['comfortable', 'compact'],
      control: { type: 'select' }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiProseImports]
    })
  ],
  render: ({ ...args }) => ({
    props: { ...args, document: DOCUMENT },
    template: `<article xuiProse ${argsToTemplate(args)} [innerHTML]="document" class="max-w-2xl"></article>`
  })
};

export default meta;
type Story = StoryObj<XuiProse>;

export const Default: Story = {};

export const Compact: Story = {
  args: { density: 'compact' }
};

export const Sizes: Story = {
  render: ({ ...args }) => {
    const rest = argsToTemplate(args, { exclude: ['size'] });

    return {
      props: { ...args, document: '<h2>Heading</h2><p>The same document at three scales.</p>' },
      template: `
        <div class="flex flex-col gap-8">
          <article xuiProse size="sm" ${rest} [innerHTML]="document"></article>
          <article xuiProse size="md" ${rest} [innerHTML]="document"></article>
          <article xuiProse size="lg" ${rest} [innerHTML]="document"></article>
        </div>
      `
    };
  }
};

/** Headings that link to themselves — hover one to see the anchor appear. */
export const HeadingAnchors: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <article xuiProse ${argsToTemplate(args)} class="max-w-2xl">
        <h2 xuiProseAnchor="install">Install</h2>
        <p>Every heading carries its own id, so a link to it is a link to the section.</p>
        <h3 xuiProseAnchor="peer-dependencies">Peer dependencies</h3>
        <p>And the id is the one the link points at, because they are the same input.</p>
      </article>
    `
  })
};
