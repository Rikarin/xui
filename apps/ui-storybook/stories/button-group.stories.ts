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
