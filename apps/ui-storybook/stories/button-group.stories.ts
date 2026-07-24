import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiButtonGroup, XuiButtonGroupImports } from '@xui/button-group';

const meta: Meta<XuiButtonGroup> = {
  title: 'Button Group',
  component: XuiButtonGroup,
  decorators: [
    moduleMetadata({
      imports: [XuiButtonGroupImports, XuiButtonImports]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiButtonGroup>;

export const Default: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup>
      <button xuiButton>Foo</button>
      <button xuiButton>Bar</button>
      <button xuiButton>Lorem</button>
    </div>
    `
  })
};

export const OutlineButtons: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup>
      <button xuiButton variant="outline">Foo</button>
      <button xuiButton variant="outline">Bar</button>
      <button xuiButton variant="outline">Lorem</button>
    </div>
    `
  })
};

/** Stacked vertically, with the radii collapsing on the vertical axis. */
export const Vertical: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup vertical class="w-40">
      <button xuiButton variant="outline">Top</button>
      <button xuiButton variant="outline">Middle</button>
      <button xuiButton variant="outline">Bottom</button>
    </div>
    `
  })
};

/** `fill` shares the width equally; `alignText` positions each label. */
export const Fill: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup fill alignText="left" class="w-96">
      <button xuiButton variant="outline">Files</button>
      <button xuiButton variant="outline">Settings</button>
      <button xuiButton variant="outline">Help</button>
    </div>
    `
  })
};
