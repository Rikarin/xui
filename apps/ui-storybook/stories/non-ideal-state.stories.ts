import { NgIcon, provideIcons } from '@ng-icons/core';
import { matSearchOffRound } from '@ng-icons/material-icons/round';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiIcon } from '@xui/icon';
import { XuiNonIdealState, XuiNonIdealStateImports } from '@xui/non-ideal-state';

const meta: Meta<XuiNonIdealState> = {
  title: 'Feedback/Non-ideal state',
  component: XuiNonIdealState,
  args: { title: 'No results', description: 'Try a different search term.', layout: 'vertical' },
  argTypes: {
    layout: { options: ['vertical', 'horizontal'], control: { type: 'select' } }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiNonIdealStateImports, XuiButtonImports, NgIcon, XuiIcon],
      providers: [provideIcons({ matSearchOffRound })]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-non-ideal-state class="border-border rounded-lg border" [title]="title" [description]="description" [layout]="layout">
        <ng-icon visual xui size="xl" name="matSearchOffRound" />
        <button action xuiButton size="sm" variant="outline">Clear filters</button>
      </xui-non-ideal-state>
    `
  })
};

export default meta;
type Story = StoryObj<XuiNonIdealState>;

export const Default: Story = {};

export const Horizontal: Story = { args: { layout: 'horizontal' } };

/** The visual and action slots collapse when nothing is projected. */
export const TextOnly: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-non-ideal-state class="border-border rounded-lg border" [title]="title" [description]="description" />
    `
  })
};
