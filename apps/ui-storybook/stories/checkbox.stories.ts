import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiCheckbox, XuiCheckboxImports } from '@xui/checkbox';

const meta: Meta<XuiCheckbox> = {
  title: 'Checkbox',
  component: XuiCheckbox,
  args: {
    color: 'primary',
    size: 'md'
  },
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'info', 'error', 'success', 'warning'],
      control: {
        type: 'select'
      }
    },
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiCheckboxImports, NgIcon, ReactiveFormsModule]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-2">
        <xui-checkbox label="Unchecked" ${argsToTemplate(args)} />
        <xui-checkbox indeterminate="true" label="Indeterminate" ${argsToTemplate(args)} />
        <xui-checkbox checked="true" label="Checked" ${argsToTemplate(args)} />
        <xui-checkbox disabled label="Unchecked Disabled" ${argsToTemplate(args)} />
        <xui-checkbox indeterminate="true" disabled label="Indeterminate Disabled" ${argsToTemplate(args)} />
        <xui-checkbox checked="true" disabled label="Checked Disabled" ${argsToTemplate(args)} />
      </div>
    `
  })
};

export default meta;
type Story = StoryObj<XuiCheckbox>;

export const Default: Story = {};

/** A label from the `label` input, or richer content via projection. */
export const WithLabel: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-2">
        <xui-checkbox label="Plain string label" />
        <xui-checkbox>Projected <b>rich</b> content</xui-checkbox>
        <xui-checkbox large label="Large" />
      </div>
    `
  })
};

/** The box can sit on either side, and controls can flow inline. */
export const Layout: Story = {
  render: () => ({
    template: `
      <xui-checkbox class="w-64" alignIndicator="end" label="Indicator at the end" />

      <div class="mt-4">
        <xui-checkbox inline checked="true" label="Comfortable" />
        <xui-checkbox inline label="Cozy" />
        <xui-checkbox inline label="Compact" />
      </div>
    `
  })
};

export const Colors: Story = {
  render: ({ ...args }) => {
    const tmp = argsToTemplate(args, { exclude: ['color'] });
    return {
      props: args,
      template: `
        <div class="flex gap-2">
          <xui-checkbox checked="true" color="primary" ${tmp} />
          <xui-checkbox checked="true" color="secondary" ${tmp} />
          <xui-checkbox checked="true" color="success" ${tmp} />
          <xui-checkbox checked="true" color="error" ${tmp} />
          <xui-checkbox checked="true" color="warning" ${tmp} />
          <xui-checkbox checked="true" color="info" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox indeterminate="true" color="primary" ${tmp} />
          <xui-checkbox indeterminate="true" color="secondary" ${tmp} />
          <xui-checkbox indeterminate="true" color="success" ${tmp} />
          <xui-checkbox indeterminate="true" color="error" ${tmp} />
          <xui-checkbox indeterminate="true" color="warning" ${tmp} />
          <xui-checkbox indeterminate="true" color="info" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox disabled checked="true" color="primary" ${tmp} />
          <xui-checkbox disabled checked="true" color="secondary" ${tmp} />
          <xui-checkbox disabled checked="true" color="success" ${tmp} />
          <xui-checkbox disabled checked="true" color="error" ${tmp} />
          <xui-checkbox disabled checked="true" color="warning" ${tmp} />
          <xui-checkbox disabled checked="true" color="info" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox disabled color="primary" ${tmp} />
          <xui-checkbox disabled color="secondary" ${tmp} />
          <xui-checkbox disabled color="success" ${tmp} />
          <xui-checkbox disabled color="error" ${tmp} />
          <xui-checkbox disabled color="warning" ${tmp} />
          <xui-checkbox disabled color="info" ${tmp} />
        </div>
      `
    };
  }
};
