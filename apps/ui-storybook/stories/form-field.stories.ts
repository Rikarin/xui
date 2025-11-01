import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiFormField, XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';

export default {
  title: 'Form Field',
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
