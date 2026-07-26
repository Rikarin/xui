import { signal } from '@angular/core';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCard, XuiCardImports } from '@xui/card';
import { XuiTextImports } from '@xui/text';

const meta: Meta<XuiCard> = {
  title: 'Data display/Card',
  component: XuiCard,
  args: { elevation: 0, interactive: false, selected: false, compact: false },
  argTypes: {
    elevation: { options: [0, 1, 2, 3, 4], control: { type: 'select' } },
    interactive: { control: { type: 'boolean' } },
    selected: { control: { type: 'boolean' } },
    compact: { control: { type: 'boolean' } }
  },
  decorators: [moduleMetadata({ imports: [XuiCardImports, XuiTextImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div xuiCard class="w-72" ${argsToTemplate(args)}>
        <h3 xuiHeading [level]="4">Quarterly report</h3>
        <p xuiText color="muted" size="sm">Updated 2 hours ago</p>
      </div>
    `
  })
};

export default meta;
type Story = StoryObj<XuiCard>;

export const Default: Story = {};

export const Elevations: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-6">
        ${[0, 1, 2, 3, 4]
          .map(e => `<div xuiCard [elevation]="${e}" class="w-32 text-center text-sm">elevation ${e}</div>`)
          .join('\n        ')}
      </div>
    `
  })
};

/**
 * An interactive card should be a real button or anchor, not a div with a handler — so it is
 * clickable, focusable and announced without any of that being rebuilt by hand. Pick one.
 */
export const Interactive: Story = {
  render: () => ({
    props: { plan: signal('weekly') },
    template: `
      <div class="flex gap-4">
        <button
          xuiCard
          interactive
          [selected]="plan() === 'weekly'"
          (click)="plan.set('weekly')"
          class="w-48 text-left"
        >
          <h3 xuiHeading [level]="5">Weekly</h3>
          <p xuiText color="muted" size="sm">A digest every Monday</p>
        </button>
        <button
          xuiCard
          interactive
          [selected]="plan() === 'daily'"
          (click)="plan.set('daily')"
          class="w-48 text-left"
        >
          <h3 xuiHeading [level]="5">Daily</h3>
          <p xuiText color="muted" size="sm">One email each morning</p>
        </button>
      </div>
    `
  })
};

export const Compact: Story = { args: { compact: true } };
