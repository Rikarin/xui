import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiCheckbox } from '@xui/checkbox';

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
      imports: [XuiCheckbox, NgIcon, ReactiveFormsModule]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <label class="flex items-center gap-2">
        <xui-checkbox ${argsToTemplate(args)} />
        Unchecked
      </label>

      <label class="flex items-center gap-2 mt-2">
        <xui-checkbox indeterminate="true" ${argsToTemplate(args)} />
        Indeterminate
      </label>

      <label class="flex items-center gap-2 mt-2">
        <xui-checkbox checked="true" ${argsToTemplate(args)} />
        Checked
      </label>

      <label class="flex items-center gap-2 mt-2">
        <xui-checkbox disabled ${argsToTemplate(args)} />
        Unchecked Disabled
      </label>

      <label class="flex items-center gap-2 mt-2">
        <xui-checkbox indeterminate="true" disabled ${argsToTemplate(args)} />
        Indeterminate Disabled
      </label>

      <label class="flex items-center gap-2 mt-2">
        <xui-checkbox checked="true" disabled ${argsToTemplate(args)} />
        Checked Disabled
      </label>
    `
  })
};

export default meta;
type Story = StoryObj<XuiCheckbox>;

export const Default: Story = {};

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
