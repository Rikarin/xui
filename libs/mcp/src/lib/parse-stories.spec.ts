import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { parseStoryFile } from './parse-stories.js';

const STORY = `
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCallout, XuiCalloutImports } from '@xui/callout';

const meta: Meta<XuiCallout> = {
  title: 'Callout',
  component: XuiCallout,
  args: { color: 'none' },
  decorators: [moduleMetadata({ imports: [XuiCalloutImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: \`
      <xui-callout class="max-w-md">
        Saving will overwrite the draft.
      </xui-callout>
    \`
  })
};

export default meta;
type Story = StoryObj<XuiCallout>;

export const Default: Story = {};

export const Minimal: Story = { args: { minimal: true, color: 'warning' } };

export const Colors: Story = {
  render: () => ({
    template: \`
      <div class="flex flex-col">
        <xui-callout color="error">Boom</xui-callout>
      </div>
    \`
  })
};

const NotExported: Story = { args: { color: 'info' } };

@Component({
  selector: 'callout-story',
  template: \`
    <xui-callout [color]="color()">
      <button (click)="dismiss()">Dismiss</button>
    </xui-callout>
  \`
})
export class CalloutStory {}

export const Hosted: Story = {
  render: () => ({ moduleMetadata: { imports: [CalloutStory] }, template: '<callout-story />' })
};
`;

describe('parseStoryFile', () => {
  const parsed = parseStoryFile(ts, 'apps/ui-storybook/stories/callout.stories.ts', STORY);

  it('keeps only the @xui imports, which is what an example needs', () => {
    expect(parsed.imports).toEqual(["import { XuiCallout, XuiCalloutImports } from '@xui/callout';"]);
  });

  it('exports one example per exported story, skipping meta and locals', () => {
    expect(parsed.examples.map(example => example.name)).toEqual(['Default', 'Minimal', 'Colors', 'Hosted']);
  });

  it('renders a story that is only its own host component as what that component renders', () => {
    expect(parsed.examples[3].code).toBe(
      ['<xui-callout [color]="color()">', '  <button (click)="dismiss()">Dismiss</button>', '</xui-callout>'].join('\n')
    );
  });

  it('falls back to the meta template for stories that only set args', () => {
    expect(parsed.examples[0].code).toContain('<xui-callout class="max-w-md">');
    expect(parsed.examples[1].args).toBe("{ minimal: true, color: 'warning' }");
    expect(parsed.examples[1].code).toContain('<xui-callout class="max-w-md">');
  });

  it('prefers a story own template and dedents it', () => {
    expect(parsed.examples[2].code).toBe(
      ['<div class="flex flex-col">', '  <xui-callout color="error">Boom</xui-callout>', '</div>'].join('\n')
    );
  });
});
