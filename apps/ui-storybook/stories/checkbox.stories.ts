import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiCheckboxComponent } from '@xui/checkbox';

const meta: Meta<XuiCheckboxComponent> = {
  title: 'Checkbox',
  component: XuiCheckboxComponent,
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
      imports: [XuiCheckboxComponent, NgIcon, ReactiveFormsModule]
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
        <xui-checkbox checked="indeterminate" ${argsToTemplate(args)} />
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
        <xui-checkbox checked="indeterminate" disabled ${argsToTemplate(args)} />
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
type Story = StoryObj<XuiCheckboxComponent>;

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
          <xui-checkbox checked="indeterminate" color="primary" ${tmp} />
          <xui-checkbox checked="indeterminate" color="secondary" ${tmp} />
          <xui-checkbox checked="indeterminate" color="success" ${tmp} />
          <xui-checkbox checked="indeterminate" color="error" ${tmp} />
          <xui-checkbox checked="indeterminate" color="warning" ${tmp} />
          <xui-checkbox checked="indeterminate" color="info" ${tmp} />
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
