import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSplitter, XuiSplitterImports } from '@xui/splitter';

/**
 * Resizable split panes — drag the gutter between two panels to resize them.
 * Panels take percentage sizes with optional min/max; nest splitters for grids.
 */
const meta: Meta<XuiSplitter> = {
  title: 'Layout/Splitter',
  component: XuiSplitter,
  decorators: [moduleMetadata({ imports: [XuiSplitterImports] })]
};

export default meta;
type Story = StoryObj<XuiSplitter>;

const pane = (label: string) =>
  `<div class="text-foreground-muted flex h-full items-center justify-center text-sm">${label}</div>`;

export const Horizontal: Story = {
  render: () => ({
    template: `
      <xui-splitter class="border-border h-64 w-[720px] rounded-lg border">
        <xui-splitter-panel [defaultSize]="30" [min]="15">${pane('Sidebar')}</xui-splitter-panel>
        <xui-splitter-panel [min]="20">${pane('Content')}</xui-splitter-panel>
      </xui-splitter>
    `
  })
};

export const ThreePanes: Story = {
  render: () => ({
    template: `
      <xui-splitter class="border-border h-64 w-[720px] rounded-lg border">
        <xui-splitter-panel [defaultSize]="25">${pane('Files')}</xui-splitter-panel>
        <xui-splitter-panel [defaultSize]="50">${pane('Editor')}</xui-splitter-panel>
        <xui-splitter-panel [defaultSize]="25">${pane('Preview')}</xui-splitter-panel>
      </xui-splitter>
    `
  })
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <xui-splitter layout="vertical" class="border-border h-80 w-[520px] rounded-lg border">
        <xui-splitter-panel [defaultSize]="60">${pane('Editor')}</xui-splitter-panel>
        <xui-splitter-panel [min]="15">${pane('Terminal')}</xui-splitter-panel>
      </xui-splitter>
    `
  })
};
