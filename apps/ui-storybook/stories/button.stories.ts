import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiButton, XuiButtonImports } from '@xui/button';

const meta: Meta<XuiButton> = {
  title: 'Button',
  component: XuiButton,
  args: {
    color: 'primary',
    variant: 'default',
    size: 'default'
  },
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'info', 'error', 'success', 'warning'],
      control: {
        type: 'select'
      }
    },
    variant: {
      options: ['default', 'dash', 'outline', 'ghost', 'link'],
      control: {
        type: 'select'
      }
    },
    size: {
      options: ['default', 'sm', 'lg', 'icon'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiButtonImports]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<button xuiButton ${argsToTemplate(args)}>Click me!</button>`
  })
};

export default meta;
type Story = StoryObj<XuiButton>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default'
  }
};

export const Dash: Story = {
  args: {
    variant: 'dash',
    size: 'default'
  }
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'default'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'default'
  }
};

export const Link: Story = {
  args: {
    variant: 'link',
    size: 'default'
  }
};

export const Small: Story = {
  args: {
    variant: 'default',
    size: 'sm'
  }
};

export const Large: Story = {
  args: {
    variant: 'default',
    size: 'lg'
  }
};

export const Colors: Story = {
  render: ({ ...args }) => {
    const tmp = argsToTemplate(args, { exclude: ['color', 'variant'] });
    return {
      props: args,
      template: `
        <div class="flex gap-2">
          <button xuiButton color="primary" ${tmp}>Click me!</button>
          <button xuiButton color="secondary" ${tmp}>Click me!</button>
          <button xuiButton color="success" ${tmp}>Click me!</button>
          <button xuiButton color="error" ${tmp}>Click me!</button>
          <button xuiButton color="warning" ${tmp}>Click me!</button>
          <button xuiButton color="info" ${tmp}>Click me!</button>
        </div>

        <div class="flex gap-2 mt-2">
          <button xuiButton color="primary" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton color="secondary" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton color="success" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton color="error" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton color="warning" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton color="info" variant="outline" ${tmp}>Click me!</button>
        </div>

        <div class="flex gap-2 mt-2">
          <button xuiButton color="primary" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton color="secondary" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton color="success" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton color="error" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton color="warning" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton color="info" variant="dash" ${tmp}>Click me!</button>
        </div>
      `
    };
  }
};

export const Disabled: Story = {
  render: ({ ...args }) => {
    const tmp = argsToTemplate(args, { exclude: ['color', 'variant'] });
    return {
      props: args,
      template: `
        <div class="flex gap-2">
          <button xuiButton disabled color="primary" ${tmp}>Click me!</button>
          <button xuiButton disabled color="secondary" ${tmp}>Click me!</button>
          <button xuiButton disabled color="success" ${tmp}>Click me!</button>
          <button xuiButton disabled color="error" ${tmp}>Click me!</button>
          <button xuiButton disabled color="warning" ${tmp}>Click me!</button>
          <button xuiButton disabled color="info" ${tmp}>Click me!</button>
        </div>

        <div class="flex gap-2 mt-2">
          <button xuiButton disabled color="primary" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton disabled color="secondary" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton disabled color="success" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton disabled color="error" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton disabled color="warning" variant="outline" ${tmp}>Click me!</button>
          <button xuiButton disabled color="info" variant="outline" ${tmp}>Click me!</button>
        </div>

        <div class="flex gap-2 mt-2">
          <button xuiButton disabled color="primary" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton disabled color="secondary" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton disabled color="success" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton disabled color="error" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton disabled color="warning" variant="dash" ${tmp}>Click me!</button>
          <button xuiButton disabled color="info" variant="dash" ${tmp}>Click me!</button>
        </div>
      `
    };
  }
};
