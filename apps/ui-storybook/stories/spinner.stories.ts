import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiSpinner, XuiSpinnerImports } from '@xui/spinner';

export default {
  title: 'Spinner',
  component: XuiSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiSpinnerImports]
    })
  ]
} as Meta<XuiSpinner>;

type Story = StoryObj<XuiSpinner>;

export const Default: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex gap-4">
        <xui-spinner color="primary" ${argsToTemplate(args)} />
        <xui-spinner color="secondary" ${argsToTemplate(args)} />
        <xui-spinner color="success" ${argsToTemplate(args)} />
        <xui-spinner color="error" ${argsToTemplate(args)} />
        <xui-spinner color="info" ${argsToTemplate(args)} />
        <xui-spinner color="warning" ${argsToTemplate(args)} />
      </div>
		`
  })
};
