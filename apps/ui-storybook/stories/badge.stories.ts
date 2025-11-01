import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';
import { XuiBadge, XuiBadgeImports } from '@xui/badge';

const meta: Meta<XuiBadge> = {
  title: 'Badge',
  component: XuiBadge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'error', 'success', 'warning', 'info'],
      control: {
        type: 'select'
      },
      table: {
        defaultValue: { summary: 'default' }
      }
    },
    size: {
      options: ['md', 'lg'],
      control: {
        type: 'select'
      },
      table: {
        defaultValue: { summary: 'default' }
      }
    },
    static: {
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' }
      }
    }
  },
  args: {
    static: false
  },
  decorators: [
    moduleMetadata({
      imports: [XuiBadgeImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <button xuiBadge ${argsToTemplate(args)}>I am a badge</button>
    `
  })
};

export default meta;
type Story = StoryObj<XuiBadge>;

export const Default: Story = {
  args: {
    color: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    color: 'secondary'
  }
};

export const Error: Story = {
  args: {
    color: 'error'
  }
};

export const Warning: Story = {
  args: {
    color: 'warning'
  }
};

export const Success: Story = {
  args: {
    color: 'success'
  }
};

export const Info: Story = {
  args: {
    color: 'info'
  }
};

export const Overview: Story = {
  render: () => ({
    template: `
      <div class="flex gap-2">
        <span xuiBadge color="primary">Badge</span>
        <span xuiBadge color="secondary">Badge</span>
        <span xuiBadge color="success">Badge</span>
        <span xuiBadge color="error">Badge</span>
        <span xuiBadge color="warning">Badge</span>
        <span xuiBadge color="info">Badge</span>
      </div>
    `
  })
};
