import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiButtonDirective } from '@xui/button';
import { XuiButtonGroupDirective } from '@xui/button-group';

const meta: Meta<XuiButtonGroupDirective> = {
  title: 'Button Group',
  component: XuiButtonGroupDirective,
  decorators: [
    moduleMetadata({
      imports: [XuiButtonGroupDirective, XuiButtonDirective]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiButtonGroupDirective>;

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
