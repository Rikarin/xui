import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSegmentedControl, XuiSegmentedControlImports } from '@xui/segmented-control';

/**
 * A single-choice control as a row of segments — a compact toggle between a few
 * mutually exclusive options. `role="radiogroup"` with one tab stop; arrow keys
 * move between segments. Full `ControlValueAccessor`.
 */
const meta: Meta<XuiSegmentedControl> = {
  title: 'Forms/Segmented control',
  component: XuiSegmentedControl,
  decorators: [moduleMetadata({ imports: [XuiSegmentedControlImports, FormsModule] })]
};

export default meta;
type Story = StoryObj<XuiSegmentedControl>;

export const Default: Story = {
  render: () => ({
    props: {
      view: 'list',
      options: [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
        { value: 'board', label: 'Board' }
      ]
    },
    template: `
      <xui-segmented-control [options]="options" [(value)]="view" aria-label="View" />
      <p class="text-foreground-muted mt-3 text-sm">View: {{ view }}</p>
    `
  })
};

export const Small: Story = {
  render: () => ({
    props: {
      size: 'md',
      options: [
        { value: 'd', label: 'Day' },
        { value: 'w', label: 'Week' },
        { value: 'm', label: 'Month' }
      ]
    },
    template: `<xui-segmented-control size="sm" [options]="options" value="w" aria-label="Range" />`
  })
};

/** Stretched to fill its container, with a disabled option. */
export const Fill: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived', disabled: true }
      ]
    },
    template: `<xui-segmented-control class="w-96" fill [options]="options" value="all" aria-label="Filter" />`
  })
};
