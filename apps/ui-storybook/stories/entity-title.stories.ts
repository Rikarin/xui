import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDescriptionRound } from '@ng-icons/material-icons/round';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiEntityTitle, XuiEntityTitleImports } from '@xui/entity-title';
import { XuiIcon } from '@xui/icon';
import { XuiTagImports } from '@xui/tag';

const meta: Meta<XuiEntityTitle> = {
  title: 'Data display/Entity title',
  component: XuiEntityTitle,
  args: { title: 'Quarterly report', subtitle: 'Updated 2 hours ago', ellipsize: false, loading: false, fill: false },
  argTypes: {
    ellipsize: { control: { type: 'boolean' } },
    loading: { control: { type: 'boolean' } },
    fill: { control: { type: 'boolean' } }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiEntityTitleImports, XuiTagImports, NgIcon, XuiIcon],
      providers: [provideIcons({ matDescriptionRound })]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-entity-title ${argsToTemplate(args)}>
        <ng-icon visual xui size="md" name="matDescriptionRound" />
        <span tags><xui-tag>Draft</xui-tag></span>
      </xui-entity-title>
    `
  })
};

export default meta;
type Story = StoryObj<XuiEntityTitle>;

export const Default: Story = {};

export const TitleOnly: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `<xui-entity-title [title]="title" />`
  })
};

/** Loading masks the text in place, so the row keeps its height. */
export const Loading: Story = { args: { loading: true } };

/** Ellipsize truncates rather than wrapping — useful in a narrow list row. */
export const Ellipsized: Story = {
  args: { ellipsize: true, title: 'A considerably longer entity name than the row can fit' },
  render: ({ ...args }) => ({
    props: args,
    template: `<div class="border-border w-64 rounded border p-2"><xui-entity-title ${argsToTemplate(args)} /></div>`
  })
};
