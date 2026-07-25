import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiCheckbox, XuiCheckboxImports } from '@xui/checkbox';

/**
 * A tri-state checkbox. It is a `ControlValueAccessor`, so `ngModel` and reactive forms bind
 * straight to it, and `indeterminate` renders the mixed state a parent checkbox needs.
 */
const meta: Meta<XuiCheckbox> = {
  title: 'Forms/Checkbox',
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
        <xui-checkbox [indeterminate]="true" label="Indeterminate" ${argsToTemplate(args)} />
        <xui-checkbox [checked]="true" label="Checked" ${argsToTemplate(args)} />
        <xui-checkbox disabled label="Unchecked Disabled" ${argsToTemplate(args)} />
        <xui-checkbox [indeterminate]="true" disabled label="Indeterminate Disabled" ${argsToTemplate(args)} />
        <xui-checkbox [checked]="true" disabled label="Checked Disabled" ${argsToTemplate(args)} />
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
        <xui-checkbox inline [checked]="true" label="Comfortable" />
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
          <xui-checkbox [checked]="true" color="primary" aria-label="primary checked" ${tmp} />
          <xui-checkbox [checked]="true" color="secondary" aria-label="secondary checked" ${tmp} />
          <xui-checkbox [checked]="true" color="success" aria-label="success checked" ${tmp} />
          <xui-checkbox [checked]="true" color="error" aria-label="error checked" ${tmp} />
          <xui-checkbox [checked]="true" color="warning" aria-label="warning checked" ${tmp} />
          <xui-checkbox [checked]="true" color="info" aria-label="info checked" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox [indeterminate]="true" color="primary" aria-label="primary indeterminate" ${tmp} />
          <xui-checkbox [indeterminate]="true" color="secondary" aria-label="secondary indeterminate" ${tmp} />
          <xui-checkbox [indeterminate]="true" color="success" aria-label="success indeterminate" ${tmp} />
          <xui-checkbox [indeterminate]="true" color="error" aria-label="error indeterminate" ${tmp} />
          <xui-checkbox [indeterminate]="true" color="warning" aria-label="warning indeterminate" ${tmp} />
          <xui-checkbox [indeterminate]="true" color="info" aria-label="info indeterminate" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox disabled [checked]="true" color="primary" aria-label="primary disabled checked" ${tmp} />
          <xui-checkbox disabled [checked]="true" color="secondary" aria-label="secondary disabled checked" ${tmp} />
          <xui-checkbox disabled [checked]="true" color="success" aria-label="success disabled checked" ${tmp} />
          <xui-checkbox disabled [checked]="true" color="error" aria-label="error disabled checked" ${tmp} />
          <xui-checkbox disabled [checked]="true" color="warning" aria-label="warning disabled checked" ${tmp} />
          <xui-checkbox disabled [checked]="true" color="info" aria-label="info disabled checked" ${tmp} />
        </div>

        <div class="flex gap-2 mt-2">
          <xui-checkbox disabled color="primary" aria-label="primary disabled" ${tmp} />
          <xui-checkbox disabled color="secondary" aria-label="secondary disabled" ${tmp} />
          <xui-checkbox disabled color="success" aria-label="success disabled" ${tmp} />
          <xui-checkbox disabled color="error" aria-label="error disabled" ${tmp} />
          <xui-checkbox disabled color="warning" aria-label="warning disabled" ${tmp} />
          <xui-checkbox disabled color="info" aria-label="info disabled" ${tmp} />
        </div>
      `
    };
  }
};
