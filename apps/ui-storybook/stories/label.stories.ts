import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiInputImports } from '@xui/input';
import { XuiLabel, XuiLabelImports } from '@xui/label';

/**
 * The text label for a bare form control. Wrapping the control in
 * `<label xuiLabel>` associates the two natively — clicking the text focuses the
 * control, and assistive technology reads them together. For a control that also
 * needs helper text or an error slot, reach for `xui-form-field` instead.
 */
const meta: Meta<XuiLabel> = {
  title: 'Forms/Label',
  component: XuiLabel,
  args: {
    error: 'auto'
  },
  argTypes: {
    error: {
      options: ['auto', true],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiLabelImports, XuiInputImports, ReactiveFormsModule]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiLabel>;

/** The pairing: label text and control inside one `<label xuiLabel>`. */
export const Default: Story = {
  render: () => ({
    template: `
      <label xuiLabel class="grid w-80 gap-1.5">
        Email
        <input xuiInput type="email" placeholder="you@example.com" />
      </label>
    `
  })
};

/**
 * `error="auto"` (the default) turns the label red as soon as the wrapped control is
 * invalid and touched; `[error]="true"` forces the state. Touch the first field and
 * leave it empty to see the auto state.
 */
export const ErrorState: Story = {
  render: () => ({
    props: {
      email: new FormControl('', Validators.required)
    },
    template: `
      <div class="flex w-80 flex-col gap-5">
        <label xuiLabel class="grid gap-1.5">
          Email (required)
          <input xuiInput type="email" placeholder="you@example.com" [formControl]="email" />
        </label>

        <label xuiLabel [error]="true" class="grid gap-1.5">
          Username
          <input xuiInput [error]="true" placeholder="octocat" />
        </label>
      </div>
    `
  })
};

/** A disabled control dims its label along with it. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <label xuiLabel class="grid w-80 gap-1.5">
        API key
        <input xuiInput disabled value="sk-••••••••" />
      </label>
    `
  })
};
