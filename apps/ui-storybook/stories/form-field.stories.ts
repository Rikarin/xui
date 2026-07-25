import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { XuiFormField, XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';

/**
 * The wrapper that gives a control its label, hint and error text, and wires the `aria`
 * relationships between them so a screen reader announces the three together.
 */
export default {
  title: 'Forms/Form field',
  component: XuiFormField,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiFormFieldImports, XuiInputImports, ReactiveFormsModule]
    })
  ]
} as Meta<XuiFormField>;

type Story = StoryObj<XuiFormField>;

export const Default: Story = {
  render: () => ({
    props: {
      name: new FormControl('', Validators.required)
    },
    template: `
      <xui-form-field>
        <input xuiInput aria-label="Name" [formControl]="name" placeholder="Name" />
        <xui-error>The field is required!</xui-error>
        <xui-hint>Enter your real name</xui-hint>
      </xui-form-field>
		`
  })
};

/** The `label`, `labelInfo`, `subLabel` and `helperText` inputs render the chrome for you. */
export const WithLabel: Story = {
  render: () => ({
    template: `
      <xui-form-field
        class="w-80"
        label="Email address"
        labelInfo="(required)"
        subLabel="We use this to send receipts"
        helperText="You can change this later in settings"
      >
        <input xuiInput class="w-full" type="email" placeholder="you@example.com" />
      </xui-form-field>
    `
  })
};

/** `intent` accents the label and helper text. */
export const Intent: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-5 w-80">
        <xui-form-field intent="success" label="Username" helperText="This name is available">
          <input xuiInput class="w-full" value="octocat" />
        </xui-form-field>
        <xui-form-field intent="warning" label="Password" helperText="Consider a longer passphrase">
          <input xuiInput class="w-full" type="password" value="hunter2" />
        </xui-form-field>
      </div>
    `
  })
};

/** `inline` places the label beside the control. */
export const Inline: Story = {
  render: () => ({
    template: `
      <xui-form-field inline label="Port" helperText="Default is 8080" class="w-96">
        <input xuiInput class="w-24" type="number" value="8080" />
      </xui-form-field>
    `
  })
};
