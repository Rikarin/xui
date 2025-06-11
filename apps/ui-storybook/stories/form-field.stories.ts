import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { XuiFormFieldComponent, XuiFormFieldImports } from '@xui/form-field';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { XuiInputDirective } from '@xui/input';

export default {
  title: 'Form Field',
  component: XuiFormFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiFormFieldImports, XuiInputDirective, ReactiveFormsModule]
    })
  ]
} as Meta<XuiFormFieldComponent>;

type Story = StoryObj<XuiFormFieldComponent>;

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
