import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiControlGroup, XuiControlGroupImports } from '@xui/control-group';
import { XuiInputImports } from '@xui/input';

/**
 * Groups adjacent inputs and buttons into one seamless unit — the rounding and
 * doubled borders between neighbours collapse, and the shared 1px border is
 * overlapped so it never reads as double-width.
 */
const meta: Meta<XuiControlGroup> = {
  title: 'Forms/Control group',
  component: XuiControlGroup,
  decorators: [moduleMetadata({ imports: [XuiControlGroupImports, XuiButtonImports, XuiInputImports] })]
};

export default meta;
type Story = StoryObj<XuiControlGroup>;

/** An input joined to a button. */
export const Default: Story = {
  render: () => ({
    template: `
      <div xuiControlGroup>
        <input xuiInput placeholder="Search…" class="w-64" />
        <button xuiButton variant="outline">Search</button>
      </div>
    `
  })
};

/** Stretched to fill, sharing the width equally. */
export const Fill: Story = {
  render: () => ({
    template: `
      <div xuiControlGroup fill class="w-96">
        <button xuiButton variant="outline">Day</button>
        <button xuiButton variant="outline">Week</button>
        <button xuiButton variant="outline">Month</button>
      </div>
    `
  })
};

/** Stacked vertically. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <div xuiControlGroup orientation="vertical" class="w-48">
        <button xuiButton variant="outline">Top</button>
        <button xuiButton variant="outline">Middle</button>
        <button xuiButton variant="outline">Bottom</button>
      </div>
    `
  })
};
