import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiButton, XuiButtonImports } from '@xui/button';

/**
 * A clickable action. A directive rather than a component, so it styles a real `<button>` or
 * `<a>` and keeps their semantics — including `disabled`, form submission and link navigation.
 */
const meta: Meta<XuiButton> = {
  title: 'Actions/Button',
  component: XuiButton,
  args: {
    color: 'primary',
    variant: 'default',
    size: 'md'
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
      options: ['md', 'sm', 'lg', 'icon'],
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
    size: 'md'
  }
};

export const Dash: Story = {
  args: {
    variant: 'dash',
    size: 'md'
  }
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md'
  }
};

export const Link: Story = {
  args: {
    variant: 'link',
    size: 'md'
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

/** `loading` swaps the label for a spinner while keeping the button's width. */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="flex gap-3">
        <button xuiButton loading>Save changes</button>
        <button xuiButton loading variant="outline" color="success">Publish</button>
        <button xuiButton loading variant="ghost">Refresh</button>
      </div>
    `
  })
};

/** `active` renders a pressed appearance (and sets <code>aria-pressed</code>). */
export const Active: Story = {
  render: () => ({
    template: `
      <div class="flex gap-3">
        <button xuiButton active>Active</button>
        <button xuiButton variant="outline" active>Active outline</button>
      </div>
    `
  })
};

/** `fill` stretches to the container; `alignText` positions the contents. */
export const FillAndAlign: Story = {
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <button xuiButton fill>Full width, centred</button>
        <button xuiButton fill alignText="left" variant="outline">Full width, left</button>
        <button xuiButton fill alignText="right" variant="outline">Full width, right</button>
      </div>
    `
  })
};

/** The directive works on an anchor too — an <code>AnchorButton</code>. */
export const Anchor: Story = {
  render: () => ({
    template: `<a xuiButton href="#" variant="outline">Anchor button</a>`
  })
};
